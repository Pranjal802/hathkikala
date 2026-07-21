import type { Request, Response } from 'express';
import mongoose from 'mongoose';
import Cart from '../models/Cart.js';
import Product from '../models/Product.js';
import Order, { type IOrderItem } from '../models/Order.js';
import { AppError } from '../utils/AppError.js';
import { toOrderResponse } from '../utils/toOrderResponse.js';
import type { CreateOrderDto } from '../dtos/OrderDtos.js';

// POST /api/orders
// Turns the current user's cart into an Order. This is the one place in the
// whole app where inventory correctness actually matters, so it gets two
// layers of protection:
//
// 1. ATOMIC PER-VARIANT DECREMENT: each stock decrement is a single
//    findOneAndUpdate with the stock check baked into the query filter
//    itself (`stockQty: { $gte: quantity }`). MongoDB guarantees this
//    read-check-write happens as one atomic operation on that document, so
//    two concurrent orders for the last item can NEVER both succeed - the
//    second one's filter simply won't match anymore and findOneAndUpdate
//    returns null.
//
// 2. MULTI-DOCUMENT TRANSACTION: a cart can have several different
//    products in it. We wrap all the stock decrements + the Order.create +
//    the cart-clear in one session.withTransaction(), so if item #3 out of
//    4 fails (out of stock), items #1 and #2's decrements are rolled back
//    too - you never end up in a state where stock was reserved but no
//    order exists. Atlas clusters (including the free M0 tier) run as
//    replica sets, so transactions work without any extra setup.
export async function createOrder(req: Request, res: Response) {
  const userId = req.user!._id;
  const dto = req.body as CreateOrderDto;

  const rawAddress = dto.shippingAddress
    ? dto.shippingAddress
    : req.user!.addresses.find((a) => a._id?.toString() === dto.addressId);

  if (!rawAddress) {
    throw new AppError('Shipping address not found', 400);
  }

  // Normalize to exactly the fields Order.shippingAddress expects - a saved
  // IAddress carries extra stuff (_id, label, isDefault) that shouldn't leak
  // into the frozen order snapshot, and this also avoids mixing two
  // differently-shaped source types going into the same field.
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

  const session = await mongoose.startSession();

  try {
    const order = await session.withTransaction(async () => {
      const cart = await Cart.findOne({ userId }).session(session);
      if (!cart || cart.items.length === 0) {
        throw new AppError('Your cart is empty', 400);
      }

      const orderItems: IOrderItem[] = [];
      let subtotal = 0;

      for (const cartItem of cart.items) {
        // The single atomic operation: only decrements if enough stock
        // exists RIGHT NOW, at the database level - not based on a stale
        // read from earlier in this function.
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
            new: true,
            session,
          }
        );

        if (!updatedProduct) {
          // Throwing inside withTransaction aborts and rolls back
          // every decrement already made earlier in this loop.
          throw new AppError(
            `"${cartItem.variantSku}" no longer has enough stock available`,
            409
          );
        }

        const variant = updatedProduct.variants.find((v) => v.sku === cartItem.variantSku)!;

        // Charge the CURRENT live price at checkout, not the cart's
        // priceSnapshot - the snapshot is only for display/UX ("your cart
        // total"), it should never be treated as a price guarantee.
        const unitPrice = variant.price;
        subtotal += unitPrice * cartItem.quantity;

        orderItems.push({
          productId: updatedProduct._id,
          productName: updatedProduct.name,
          variantSku: cartItem.variantSku,
          variantAttributes: variant.attributes,
          quantity: cartItem.quantity,
          unitPrice,
        });
      }

      const shippingFee = 0; // flat/free for now - revisit once shipping rules exist
      const totalAmount = subtotal + shippingFee;

      const [createdOrder] = await Order.create(
        [
          {
            userId,
            items: orderItems,
            shippingAddress,
            payment: {
              provider: 'razorpay' as const,
              status: 'pending' as const,
              amount: totalAmount,
              currency: 'INR',
            },
            subtotal,
            shippingFee,
            totalAmount,
            status: 'pending' as const,
            statusHistory: [{ status: 'pending', changedAt: new Date() }],
          },
        ],
        { session }
      );

      cart.items = [] as typeof cart.items;
      await cart.save({ session });

      return createdOrder!;
    });

    return res.status(201).json({ success: true, data: { order: toOrderResponse(order) } });
  } finally {
    await session.endSession();
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
