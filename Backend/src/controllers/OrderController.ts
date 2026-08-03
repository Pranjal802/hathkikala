import type { Request, Response } from 'express';
import mongoose from 'mongoose';
import Cart from '../models/Cart.js';
import Product from '../models/Product.js';
import Order, { type IOrderItem } from '../models/Order.js';
import { AppError } from '../utils/AppError.js';
import { toOrderResponse } from '../utils/toOrderResponse.js';
import type { CreateOrderDto } from '../dtos/OrderDtos.js';
import { sendOrderConfirmationEmail, sendShippingUpdateEmail } from '../services/emailService.js';

// POST /api/orders - Support both authenticated user & guest checkout
export async function createOrder(req: Request, res: Response) {
  const userId = req.user?._id;
  const isGuest = !userId;
  const dto = req.body as CreateOrderDto & { guestEmail?: string; guestPhone?: string };

  let rawAddress = dto.shippingAddress;
  if (!rawAddress && req.user) {
    rawAddress = req.user.addresses.find((a) => a._id?.toString() === dto.addressId);
  }

  if (!rawAddress) {
    throw new AppError('Shipping address is required', 400);
  }

  if (isGuest && (!dto.guestEmail || !dto.guestPhone)) {
    if (!rawAddress.phone) {
      throw new AppError('Email and phone number are required for guest checkout', 400);
    }
  }

  const shippingAddress = {
    fullName: rawAddress.fullName,
    phone: rawAddress.phone,
    line1: rawAddress.line1,
    ...(rawAddress.line2 ? { line2: rawAddress.line2 } : {}),
    city: rawAddress.city,
    state: rawAddress.state,
    postalCode: rawAddress.postalCode,
    country: rawAddress.country || 'India',
  };

  let cart = userId ? await Cart.findOne({ userId }) : null;
  const directItems = req.body.items;

  let itemsToProcess = cart?.items || [];
  if (itemsToProcess.length === 0 && Array.isArray(directItems) && directItems.length > 0) {
    itemsToProcess = directItems;
  }

  if (itemsToProcess.length === 0) {
    throw new AppError('Your cart is empty', 400);
  }

  const paymentProvider = dto.paymentMethod || 'cod';

  const orderItems: IOrderItem[] = [];
  let subtotal = 0;
  const appliedDecrements: Array<{ productId: mongoose.Types.ObjectId; variantSku: string; quantity: number }> = [];

  try {
    for (const cartItem of itemsToProcess) {
      const product = await Product.findById(cartItem.productId);
      if (!product || !product.isActive) {
        throw new AppError('One or more products are no longer available', 409);
      }

      const variant = product.variants.find((v) => v.sku === cartItem.variantSku && v.isActive);
      if (!variant) {
        throw new AppError(`"${cartItem.variantSku}" is no longer available`, 409);
      }

      if (variant.stockQty < cartItem.quantity) {
        throw new AppError(`Only ${variant.stockQty} left in stock for "${variant.sku}"`, 409);
      }

      const updatedProduct = await Product.findOneAndUpdate(
        {
          _id: cartItem.productId,
          isActive: true,
          variants: {
            $elemMatch: {
              sku: cartItem.variantSku,
              isActive: true,
              stockQty: { $gte: cartItem.quantity },
            },
          },
        },
        { $inc: { 'variants.$[v].stockQty': -cartItem.quantity } },
        {
          arrayFilters: [{ 'v.sku': cartItem.variantSku }],
          returnDocument: 'after',
        }
      );

      if (!updatedProduct) {
        await Promise.all(
          appliedDecrements.map((item) =>
            Product.findOneAndUpdate(
              {
                _id: item.productId,
                variants: { $elemMatch: { sku: item.variantSku, isActive: true } },
              },
              { $inc: { 'variants.$[v].stockQty': item.quantity } },
              {
                arrayFilters: [{ 'v.sku': item.variantSku }],
                returnDocument: 'after',
              }
            )
          )
        );

        throw new AppError(`"${cartItem.variantSku}" no longer has enough stock available`, 409);
      }

      const freshVariant = updatedProduct.variants.find((v) => v.sku === cartItem.variantSku && v.isActive);
      if (!freshVariant) {
        await Promise.all(
          appliedDecrements.map((item) =>
            Product.findOneAndUpdate(
              {
                _id: item.productId,
                variants: { $elemMatch: { sku: item.variantSku, isActive: true } },
              },
              { $inc: { 'variants.$[v].stockQty': item.quantity } },
              {
                arrayFilters: [{ 'v.sku': item.variantSku }],
                returnDocument: 'after',
              }
            )
          )
        );

        throw new AppError(`"${cartItem.variantSku}" is no longer available`, 409);
      }

      const unitPrice = freshVariant.price;
      subtotal += unitPrice * cartItem.quantity;
      appliedDecrements.push({ productId: updatedProduct._id, variantSku: cartItem.variantSku, quantity: cartItem.quantity });

      orderItems.push({
        productId: updatedProduct._id,
        productName: updatedProduct.name,
        variantSku: cartItem.variantSku,
        variantAttributes: freshVariant.attributes,
        quantity: cartItem.quantity,
        unitPrice,
      });
    }

    const shippingFee = 0;
    const totalAmount = subtotal + shippingFee;

    const guestEmailVal = dto.guestEmail || (req.user ? req.user.email : rawAddress.phone + '@guest.com');
    const guestPhoneVal = dto.guestPhone || rawAddress.phone;

    const createdOrder = await Order.create({
      ...(userId ? { userId } : {}),
      guestEmail: guestEmailVal,
      guestPhone: guestPhoneVal,
      isGuestOrder: isGuest,
      items: orderItems,
      shippingAddress,
      payment: {
        provider: paymentProvider,
        status: 'pending' as const,
        amount: totalAmount,
        currency: 'INR',
        ...((req.body as any).paymentProof ? { paymentProof: (req.body as any).paymentProof } : {}),
      },
      subtotal,
      shippingFee,
      totalAmount,
      status: 'placed' as const,
      statusHistory: [{ status: 'placed', changedAt: new Date(), note: 'Order placed successfully' }],
      ...(req.body.customizationNotes ? { customizationNotes: req.body.customizationNotes } : {}),
    });

    if (cart) {
      cart.items = [] as typeof cart.items;
      await cart.save();
    }

    const formattedOrder = toOrderResponse(createdOrder);
    sendOrderConfirmationEmail(req.user?.email || guestEmailVal, formattedOrder).catch((err) =>
      console.error('Order confirmation email error:', err)
    );

    return res.status(201).json({ success: true, data: { order: formattedOrder } });
  } catch (error) {
    if (appliedDecrements.length > 0) {
      await Promise.all(
        appliedDecrements.map((item) =>
          Product.findOneAndUpdate(
            {
              _id: item.productId,
              variants: { $elemMatch: { sku: item.variantSku, isActive: true } },
            },
            { $inc: { 'variants.$[v].stockQty': item.quantity } },
            {
              arrayFilters: [{ 'v.sku': item.variantSku }],
              returnDocument: 'after',
            }
          )
        )
      );
    }

    throw error;
  }
}

// POST /api/orders/guest-lookup - Guest track order using Order ID + Phone Number
export async function guestLookupOrder(req: Request, res: Response) {
  const { orderId, phone } = req.body;
  if (!orderId || !phone) {
    throw new AppError('Order ID and Phone Number are required', 400);
  }

  const cleanPhone = phone.trim().replace(/\D/g, '');
  const cleanOrderId = orderId.trim();

  let query: any = {
    $or: [
      { _id: mongoose.isValidObjectId(cleanOrderId) ? new mongoose.Types.ObjectId(cleanOrderId) : null },
      { 'payment.providerOrderId': cleanOrderId }
    ].filter((q) => q._id !== null || q['payment.providerOrderId'])
  };

  let order = await Order.findOne(query);

  if (!order) {
    throw new AppError('No order found matching this Order ID and Phone number', 404);
  }

  const orderPhoneClean = (order.shippingAddress?.phone || order.guestPhone || '').replace(/\D/g, '');
  if (!orderPhoneClean.includes(cleanPhone) && !cleanPhone.includes(orderPhoneClean)) {
    throw new AppError('No order found matching this Order ID and Phone number', 404);
  }

  return res.status(200).json({
    success: true,
    data: { order: toOrderResponse(order) }
  });
}

// GET /api/orders - Paginated order history (10 orders per page)
export async function listOrders(req: Request, res: Response) {
  const page = parseInt(req.query.page as string || '1', 10);
  const limit = parseInt(req.query.limit as string || '10', 10);
  const skip = (page - 1) * limit;

  const [orders, totalOrders] = await Promise.all([
    Order.find({ userId: req.user!._id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Order.countDocuments({ userId: req.user!._id })
  ]);

  return res.status(200).json({
    success: true,
    data: {
      orders: orders.map(toOrderResponse),
      pagination: {
        page,
        limit,
        totalOrders,
        totalPages: Math.ceil(totalOrders / limit) || 1,
      }
    },
  });
}

// POST /api/orders/:id/cancel - Customer cancel order (Only if Placed or Confirmed)
export async function cancelOrderCustomer(req: Request, res: Response) {
  const orderId = req.params.id;
  const { reason } = req.body;

  const order = await Order.findOne({ _id: orderId, userId: req.user!._id });
  if (!order) {
    throw new AppError('Order not found', 404);
  }

  if (order.status === 'in_production' || order.status === 'shipped' || order.status === 'delivered') {
    throw new AppError('This item is already being handcrafted for you and can no longer be cancelled.', 400);
  }

  if (order.status === 'cancelled') {
    throw new AppError('This order is already cancelled', 400);
  }

  // Restore inventory stocks for each item in the cancelled order
  for (const item of order.items) {
    await Product.findOneAndUpdate(
      {
        _id: item.productId,
        variants: { $elemMatch: { sku: item.variantSku } }
      },
      { $inc: { 'variants.$[v].stockQty': item.quantity } },
      { arrayFilters: [{ 'v.sku': item.variantSku }] }
    );
  }

  order.status = 'cancelled';
  order.cancelReason = reason || 'Cancelled by customer';
  order.statusHistory.push({
    status: 'cancelled',
    changedAt: new Date(),
    note: `Order cancelled by customer. Reason: ${order.cancelReason}`,
  });

  await order.save();

  return res.status(200).json({
    success: true,
    message: 'Order cancelled successfully',
    data: { order: toOrderResponse(order) }
  });
}

// POST /api/orders/:id/reorder - Add items from past order to active cart
export async function reorderCustomer(req: Request, res: Response) {
  const orderId = req.params.id;
  const userId = req.user!._id;

  const order = await Order.findOne({ _id: orderId, userId });
  if (!order) {
    throw new AppError('Order not found', 404);
  }

  let cart = await Cart.findOne({ userId });
  if (!cart) {
    cart = await Cart.create({ userId, items: [] });
  }

  let addedCount = 0;
  for (const item of order.items) {
    const product = await Product.findById(item.productId);
    if (product && product.isActive) {
      const variant = product.variants.find((v) => v.sku === item.variantSku && v.isActive);
      if (variant && variant.stockQty > 0) {
        const existingCartItem = cart.items.find((i) => i.productId.toString() === item.productId.toString() && i.variantSku === item.variantSku);
        if (existingCartItem) {
          existingCartItem.quantity += item.quantity;
        } else {
          cart.items.push({
            productId: item.productId,
            variantSku: item.variantSku,
            quantity: Math.min(item.quantity, variant.stockQty),
          } as any);
        }
        addedCount++;
      }
    }
  }

  await cart.save();

  return res.status(200).json({
    success: true,
    message: `Added ${addedCount} available item(s) from past order to your cart`,
    data: { cart }
  });
}

// GET /api/orders/:id
export async function getOrderById(req: Request, res: Response) {
  const orderId = req.params.id;
  if (!orderId) {
    throw new AppError('Order id is required', 400);
  }
  const order = await Order.findOne({ _id: orderId, userId: req.user!._id });
  if (!order) {
    throw new AppError('Order not found', 404);
  }
  return res.status(200).json({ success: true, data: { order: toOrderResponse(order) } });
}

// GET /api/orders/admin/all - Admin view all orders
export async function listAllOrdersAdmin(req: Request, res: Response) {
  const { status } = req.query;
  const filter: Record<string, unknown> = {};
  if (status && status !== 'all') {
    filter.status = status;
  }
  const orders = await Order.find(filter).sort({ createdAt: -1 });
  return res.status(200).json({
    success: true,
    data: { orders: orders.map(toOrderResponse) },
  });
}

// PATCH /api/orders/admin/:id/status - Admin update status, tracking & payment status
export async function updateOrderStatusAdmin(req: Request, res: Response) {
  const { id } = req.params;
  const { status, trackingNumber, courierName, trackingUrl, customizationNotes, note, paymentStatus, cancelReason } = req.body;

  const order = await Order.findById(id);
  if (!order) {
    throw new AppError('Order not found', 404);
  }

  if (status) {
    order.status = status as any;
    order.statusHistory.push({
      status,
      changedAt: new Date(),
      note: note || `Status updated to ${status}`,
    });

    if (status === 'paid' || status === 'delivered') {
      if (order.payment.status !== 'paid') {
        order.payment.status = 'paid';
        order.payment.paidAt = new Date();
      }
    } else if (status === 'cancelled' || status === 'refunded') {
      if (cancelReason) order.cancelReason = cancelReason;
      if (status === 'refunded') order.payment.status = 'refunded';
    }
  }

  if (paymentStatus) {
    order.payment.status = paymentStatus;
    if (paymentStatus === 'paid' && !order.payment.paidAt) {
      order.payment.paidAt = new Date();
    }
  }

  if (trackingNumber !== undefined) {
    order.trackingNumber = trackingNumber;
    if (trackingNumber && ['pending', 'placed', 'confirmed', 'processing'].includes(order.status)) {
      order.status = 'shipped';
      order.statusHistory.push({
        status: 'shipped',
        changedAt: new Date(),
        note: `Auto-marked as Shipped (Tracking: ${trackingNumber})`,
      });
    }
  }
  if (courierName !== undefined) order.courierName = courierName;
  if (trackingUrl !== undefined) order.trackingUrl = trackingUrl;
  if (customizationNotes !== undefined) order.customizationNotes = customizationNotes;
  if (cancelReason !== undefined) order.cancelReason = cancelReason;

  await order.save();
  const formattedOrder = toOrderResponse(order);

  if (order.status === 'shipped' || trackingNumber) {
    sendShippingUpdateEmail(req.user?.email || 'customer@hathkikala.com', formattedOrder).catch((err) =>
      console.error('Shipping update email error:', err)
    );
  }

  return res.status(200).json({
    success: true,
    message: 'Order updated successfully',
    data: { order: formattedOrder },
  });
}

// POST /api/orders/admin/:id/notes - Admin add staff note
export async function addOrderStaffNoteAdmin(req: Request, res: Response) {
  const { id } = req.params;
  const { note } = req.body;
  if (!note || !note.trim()) {
    throw new AppError('Note content is required', 400);
  }

  const order = await Order.findById(id);
  if (!order) {
    throw new AppError('Order not found', 404);
  }

  if (!order.staffNotes) order.staffNotes = [];
  order.staffNotes.push({
    note: note.trim(),
    author: req.user?.name || req.user?.email || 'Admin Staff',
    createdAt: new Date(),
  });

  await order.save();
  return res.status(200).json({
    success: true,
    message: 'Staff note added',
    data: { order: toOrderResponse(order) },
  });
}

// GET /api/orders/admin/stats - Admin dashboard statistics
export async function getOrderStatsAdmin(req: Request, res: Response) {
  const [totalOrders, pendingOrders, completedOrders, revenueResult, lowStockProducts] = await Promise.all([
    Order.countDocuments(),
    Order.countDocuments({ status: { $in: ['pending', 'placed', 'confirmed', 'in_production'] } }),
    Order.countDocuments({ status: 'delivered' }),
    Order.aggregate([
      { $match: { status: { $ne: 'cancelled' } } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } },
    ]),
    Product.find({ 'variants.stockQty': { $lte: 5 } }),
  ]);

  const totalRevenue = revenueResult[0]?.total || 0;

  return res.status(200).json({
    success: true,
    data: {
      totalOrders,
      pendingOrders,
      completedOrders,
      totalRevenue,
      lowStockCount: lowStockProducts.length,
      lowStockItems: lowStockProducts.map((p) => ({
        id: p._id.toString(),
        name: p.name,
        stockQty: p.variants.reduce((sum, v) => sum + v.stockQty, 0),
      })),
    },
  });
}
