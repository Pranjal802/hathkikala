import type { Request, Response } from 'express';
import Cart from '../models/Cart.js';
import Product from '../models/Product.js';
import { AppError } from '../utils/AppError.js';
import { toCartResponse } from '../utils/toCartResponse.js';
import type { AddCartItemDto, UpdateCartItemDto } from '../dtos/CartDtos.js';

// Atomic upsert - if two requests race to create a user's first cart at the
// same time, this (plus the unique partial index on userId in the Cart
// model) guarantees only one cart document ever exists per user.
async function getOrCreateCart(userId: string) {
  return Cart.findOneAndUpdate(
    { userId },
    { $setOnInsert: { userId, items: [] } },
    { upsert: true, new: true }
  );
}

// GET /api/cart
export async function getCart(req: Request, res: Response) {
  const cart = await getOrCreateCart(req.user!._id.toString());
  return res.status(200).json({ success: true, data: await toCartResponse(cart) });
}

// POST /api/cart/items
//
// Rewritten to use atomic operators end-to-end instead of "load the whole
// cart, mutate the array in JS, save the whole document back." The old
// version had a real (if narrow) race: two near-simultaneous requests for
// the same user (double-click, two tabs) could both read the cart before
// either saved, and the second .save() would clobber the first change.
//
// This version never loads-then-blindly-saves. Every write is a single
// atomic findOneAndUpdate whose FILTER already encodes the precondition
// (item exists vs. doesn't, stock available vs. not) - so MongoDB itself
// guarantees the read-check-write happens as one indivisible step.
export async function addItemToCart(req: Request, res: Response) {
  const { productId, variantSku, quantity } = req.body as AddCartItemDto;
  const userId = req.user!._id.toString();

  const product = await Product.findOne({ _id: productId, isActive: true });
  if (!product) {
    throw new AppError('Product not found', 404);
  }
  let variant = product.variants.find((v) => v.sku === variantSku && v.isActive);
  if (!variant && product.variants.length > 0) {
    variant = product.variants.find((v) => v.isActive) || product.variants[0];
  }
  if (!variant) {
    throw new AppError('Selected variant is not available', 404);
  }

  // Soft/UX check for the obvious case (asking for more than exists at all).
  // Final enforcement always happens atomically at order creation time.
  if (variant.stockQty < quantity) {
    throw new AppError(`Only ${variant.stockQty} left in stock`, 409);
  }

  await getOrCreateCart(userId); // ensure the cart document exists before either attempt below

  // Attempt 1: item already in cart -> atomically increment it, but only if
  // doing so wouldn't exceed stock. The stock check lives INSIDE the filter
  // itself ("existing quantity + incoming <= stockQty"), so this is one
  // atomic read-check-write - no separate read beforehand to go stale.
  const incremented = await Cart.findOneAndUpdate(
    {
      userId,
      items: {
        $elemMatch: {
          productId,
          variantSku,
          quantity: { $lte: variant.stockQty - quantity },
        },
      },
    },
    {
      $inc: { 'items.$.quantity': quantity },
      $set: { 'items.$.priceSnapshot': variant.price },
    },
    { new: true }
  );

  if (incremented) {
    return res.status(200).json({ success: true, data: await toCartResponse(incremented) });
  }

  // Attempt 2: item not in cart yet (or attempt 1 didn't match) -> push a new
  // line item, but ONLY if it still doesn't exist. The $not/$elemMatch guard
  // prevents a race where two concurrent "add new item" requests both think
  // the item is missing and both try to push, creating a duplicate line.
  const added = await Cart.findOneAndUpdate(
    {
      userId,
      items: { $not: { $elemMatch: { productId, variantSku } } },
    },
    {
      $push: {
        items: { productId: product._id, variantSku, quantity, priceSnapshot: variant.price },
      },
    },
    { new: true }
  );

  if (added) {
    return res.status(200).json({ success: true, data: await toCartResponse(added) });
  }

  // Neither attempt matched: the item DOES exist (so attempt 2's guard
  // correctly refused to push a duplicate), and incrementing it would have
  // exceeded stock (so attempt 1 correctly refused too). Report that clearly.
  throw new AppError(`Only ${variant.stockQty} left in stock`, 409);
}

// PATCH /api/cart/items/:itemId
//
// Takes a DELTA (+1 / -1 / etc), not an absolute quantity. This matters for
// two reasons:
//   1. The FE never needs to know/trust the "current" quantity before
//      sending a request - it just says "one more" or "one less," and the
//      backend applies that atomically against whatever the real stored
//      value is. No risk of overwriting with a number computed from stale
//      client state.
//   2. Decrementing to zero-or-below is handled as a normal case here
//      (falls through to a $pull), rather than being a separate thing the
//      frontend has to remember to call DELETE for.
export async function updateCartItem(req: Request, res: Response) {
  const { itemId } = req.params;
  if (!itemId) {
    throw new AppError('Cart item id is required', 400);
  }
  const { delta } = req.body as UpdateCartItemDto;
  const userId = req.user!._id.toString();

  // A lightweight projection read - just enough to confirm the item exists
  // and know which product/variant it points to, so stock can be checked
  // before attempting an increment.
  const cartWithItem = await Cart.findOne(
    { userId, 'items._id': itemId },
    { items: { $elemMatch: { _id: itemId } } }
  );
  const item = cartWithItem?.items[0];
  if (!cartWithItem || !item) {
    throw new AppError('Cart item not found', 404);
  }

  if (delta < 0) {
    // Decrementing: two atomic attempts, same shape as addItemToCart.
    // Attempt 1: decrement, but only if it stays strictly positive.
    const decremented = await Cart.findOneAndUpdate(
      { userId, items: { $elemMatch: { _id: itemId, quantity: { $gt: -delta } } } },
      { $inc: { 'items.$.quantity': delta } },
      { new: true }
    );
    if (decremented) {
      return res.status(200).json({ success: true, data: await toCartResponse(decremented) });
    }

    // Attempt 1 didn't match -> decrementing would take it to zero or below
    // -> remove the line item entirely instead of leaving quantity <= 0.
    const removed = await Cart.findOneAndUpdate(
      { userId, 'items._id': itemId },
      { $pull: { items: { _id: itemId } } },
      { new: true }
    );
    // removed should always be non-null here (we confirmed the item exists
    // above), but guard anyway in case it was removed by a concurrent request.
    if (!removed) {
      throw new AppError('Cart item not found', 404);
    }
    return res.status(200).json({ success: true, data: await toCartResponse(removed) });
  }

  // Incrementing: validate against live stock first (soft/UX check - final
  // enforcement is always at checkout, same as addItemToCart).
  const product = await Product.findOne({ _id: item.productId, isActive: true });
  const variant = product?.variants.find((v) => v.sku === item.variantSku && v.isActive);
  if (!product || !variant) {
    throw new AppError('This item is no longer available - please remove it from your cart', 409);
  }

  const incremented = await Cart.findOneAndUpdate(
    {
      userId,
      items: { $elemMatch: { _id: itemId, quantity: { $lte: variant.stockQty - delta } } },
    },
    {
      $inc: { 'items.$.quantity': delta },
      $set: { 'items.$.priceSnapshot': variant.price },
    },
    { new: true }
  );
  if (!incremented) {
    throw new AppError(`Only ${variant.stockQty} left in stock`, 409);
  }

  return res.status(200).json({ success: true, data: await toCartResponse(incremented) });
}

// DELETE /api/cart/items/:itemId
export async function removeCartItem(req: Request, res: Response) {
  const { itemId } = req.params;
  if (!itemId) {
    throw new AppError('Cart item id is required', 400);
  }
  const userId = req.user!._id.toString();

  // One atomic call: the filter only matches if the item is still there, and
  // $pull removes it in the same operation - no separate existence check,
  // no load-mutate-save round trip.
  const updatedCart = await Cart.findOneAndUpdate(
    { userId, 'items._id': itemId },
    { $pull: { items: { _id: itemId } } },
    { new: true }
  );
  if (!updatedCart) {
    throw new AppError('Cart item not found', 404);
  }

  return res.status(200).json({ success: true, data: await toCartResponse(updatedCart) });
}