import type { Request, Response } from 'express';
import mongoose from 'mongoose';
import Cart from '../models/Cart.js';
import Product from '../models/Product.js';
import Order, { type IOrderItem } from '../models/Order.js';
import { AppError } from '../utils/AppError.js';
import { toOrderResponse } from '../utils/toOrderResponse.js';
import type { CreateOrderDto } from '../dtos/OrderDtos.js';

// POST /api/orders
// Turns the current user's cart into an Order. The local fallback DB used in
// development is a single-node MongoDB instance, so multi-document transactions
// are not available here. To keep the checkout flow correct, we instead:
//
// 1. Pre-validate every line item against the current live stock.
// 2. Decrement stock one variant at a time via atomic findOneAndUpdate.
// 3. If something fails mid-way, restore each already-decremented variant.
// 4. Create the order snapshot and clear the cart.
export async function createOrder(req: Request, res: Response) {
  const userId = req.user!._id;
  const dto = req.body as CreateOrderDto;

  const rawAddress = dto.shippingAddress
    ? dto.shippingAddress
    : req.user!.addresses.find((a) => a._id?.toString() === dto.addressId);

  if (!rawAddress) {
    throw new AppError('Shipping address not found', 400);
  }

  const shippingAddress = {
    fullName: rawAddress.fullName,
    phone: rawAddress.phone,
    line1: rawAddress.line1,
    ...(rawAddress.line2 ? { line2: rawAddress.line2 } : {}),
    city: rawAddress.city,
    state: rawAddress.state,
    postalCode: rawAddress.postalCode,
    country: rawAddress.country,
  };

  const cart = await Cart.findOne({ userId });
  if (!cart || cart.items.length === 0) {
    throw new AppError('Your cart is empty', 400);
  }

  const paymentProvider = dto.paymentMethod || 'cod';

  const orderItems: IOrderItem[] = [];
  let subtotal = 0;
  const appliedDecrements: Array<{ productId: mongoose.Types.ObjectId; variantSku: string; quantity: number }> = [];

  try {
    for (const cartItem of cart.items) {
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

    const createdOrder = await Order.create({
      userId,
      items: orderItems,
      shippingAddress,
      payment: {
        provider: paymentProvider,
        status: 'pending' as const,
        amount: totalAmount,
        currency: 'INR',
      },
      subtotal,
      shippingFee,
      totalAmount,
      status: 'pending' as const,
      statusHistory: [{ status: 'pending', changedAt: new Date() }],
    });

    cart.items = [] as typeof cart.items;
    await cart.save();

    return res.status(201).json({ success: true, data: { order: toOrderResponse(createdOrder) } });
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

// GET /api/orders
export async function listOrders(req: Request, res: Response) {
  const orders = await Order.find({ userId: req.user!._id }).sort({ createdAt: -1 });
  return res.status(200).json({
    success: true,
    data: { orders: orders.map(toOrderResponse) },
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

// PATCH /api/orders/admin/:id/status - Admin update status & tracking
export async function updateOrderStatusAdmin(req: Request, res: Response) {
  const { id } = req.params;
  const { status, trackingNumber, courierName, customizationNotes, note } = req.body;

  const order = await Order.findById(id);
  if (!order) {
    throw new AppError('Order not found', 404);
  }

  if (status) {
    order.status = status;
    order.statusHistory.push({
      status,
      changedAt: new Date(),
      note: note || `Status updated to ${status}`,
    });
  }

  if (trackingNumber !== undefined) order.trackingNumber = trackingNumber;
  if (courierName !== undefined) order.courierName = courierName;
  if (customizationNotes !== undefined) order.customizationNotes = customizationNotes;

  await order.save();
  return res.status(200).json({
    success: true,
    message: 'Order status updated successfully',
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
