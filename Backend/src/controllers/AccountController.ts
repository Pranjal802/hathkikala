import type { Request, Response } from 'express';
import Cart from '../models/Cart.js';
import { toUserResponse } from '../utils/toUserResponse.js';
import { toCartResponse } from '../utils/toCartResponse.js';

// GET /api/account/me
// One-shot endpoint for the frontend to call on app load: who is logged in
// + what's in their cart, so the FE doesn't have to fire two requests and
// juggle loading states separately for something it needs together anyway.
export async function getMyAccount(req: Request, res: Response) {
  const user = req.user!;

  const cart = await Cart.findOneAndUpdate(
    { userId: user._id },
    { $setOnInsert: { userId: user._id, items: [] } },
    { upsert: true, new: true }
  );

  return res.status(200).json({
    success: true,
    data: {
      user: toUserResponse(user),
      cart: await toCartResponse(cart),
    },
  });
}
