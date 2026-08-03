import type { Request, Response } from 'express';
import Review from '../models/Review.js';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import { AppError } from '../utils/AppError.js';

// GET /api/reviews/product/:productId - Public get approved product reviews
export async function getProductReviews(req: Request, res: Response) {
  const { productId } = req.params;
  const reviews = await Review.find({ productId: productId as any, status: 'approved' }).sort({ createdAt: -1 });

  return res.status(200).json({
    success: true,
    data: { reviews }
  });
}

// POST /api/reviews - Customer create review
export async function createReview(req: Request, res: Response) {
  const userId = req.user!._id;
  const { productId, rating, comment } = req.body;

  if (!productId || !rating || !comment) {
    throw new AppError('Product ID, rating, and comment are required', 400);
  }

  const numericRating = Number(rating);
  if (numericRating < 1 || numericRating > 5) {
    throw new AppError('Rating must be between 1 and 5 stars', 400);
  }

  const product = await Product.findById(productId);
  if (!product) {
    throw new AppError('Product not found', 404);
  }

  // Check if customer has a delivered order for this product
  const deliveredOrder = await Order.findOne({
    userId,
    status: 'delivered',
    'items.productId': productId
  });

  const isVerifiedPurchase = Boolean(deliveredOrder);

  const review = new Review({
    productId,
    userId,
    customerName: req.user!.name || req.user!.email.split('@')[0],
    rating: numericRating,
    comment: comment.trim(),
    isVerifiedPurchase,
    status: 'approved',
  });
  await review.save();

  // Update product average rating & reviewCount
  const allReviews = await Review.find({ productId: productId as any, status: 'approved' });
  const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / (allReviews.length || 1);

  await Product.findByIdAndUpdate(productId, {
    rating: Math.round(avgRating * 10) / 10,
    reviewCount: allReviews.length
  });

  return res.status(201).json({
    success: true,
    message: 'Thank you for reviewing! Your feedback is live ✨',
    data: { review }
  });
}

// GET /api/reviews/my - Customer get written reviews
export async function getMyReviews(req: Request, res: Response) {
  const userId = req.user!._id;
  const reviews = await Review.find({ userId: userId as any }).populate({
    path: 'productId',
    select: 'name slug images thumbnail',
  }).sort({ createdAt: -1 });

  return res.status(200).json({
    success: true,
    data: { reviews }
  });
}

// GET /api/reviews/unreviewed - Get delivered order items that haven't been reviewed yet
export async function getUnreviewedItems(req: Request, res: Response) {
  const userId = req.user!._id;

  const deliveredOrders = await Order.find({ userId: userId as any, status: 'delivered' });
  if (deliveredOrders.length === 0) {
    return res.status(200).json({ success: true, data: { unreviewedItems: [] } });
  }

  const userReviews = await Review.find({ userId: userId as any });
  const reviewedProductIds = new Set(userReviews.map((r: any) => (r.productId?._id || r.productId).toString()));

  const unreviewedMap = new Map<string, { productId: string; productName: string; orderId: string; deliveredAt: Date }>();

  for (const order of deliveredOrders) {
    for (const item of order.items) {
      const pId = item.productId.toString();
      if (!reviewedProductIds.has(pId) && !unreviewedMap.has(pId)) {
        unreviewedMap.set(pId, {
          productId: pId,
          productName: item.productName,
          orderId: (order as any)._id.toString(),
          deliveredAt: order.updatedAt || order.createdAt || new Date(),
        });
      }
    }
  }

  return res.status(200).json({
    success: true,
    data: { unreviewedItems: Array.from(unreviewedMap.values()) }
  });
}

// PATCH /api/reviews/:id - Customer update own review
export async function updateReviewCustomer(req: Request, res: Response) {
  const userId = req.user!._id;
  const { id } = req.params;
  const { rating, comment } = req.body;

  const review = await Review.findOne({ _id: id as any, userId: userId as any });
  if (!review) {
    throw new AppError('Review not found or unauthorized', 404);
  }

  if (rating !== undefined) {
    const numRating = Number(rating);
    if (numRating >= 1 && numRating <= 5) review.rating = numRating;
  }
  if (comment !== undefined) review.comment = comment.trim();

  await review.save();

  return res.status(200).json({
    success: true,
    message: 'Review updated successfully!',
    data: { review }
  });
}

// DELETE /api/reviews/:id - Customer delete own review
export async function deleteReviewCustomer(req: Request, res: Response) {
  const userId = req.user!._id;
  const { id } = req.params;

  const review = await Review.findOneAndDelete({ _id: id as any, userId: userId as any });
  if (!review) {
    throw new AppError('Review not found or unauthorized', 404);
  }

  return res.status(200).json({
    success: true,
    message: 'Review deleted'
  });
}

// GET /api/reviews/admin/all - Admin list all reviews
export async function listAllReviewsAdmin(req: Request, res: Response) {
  const reviews = await Review.find().populate('productId', 'name slug').sort({ createdAt: -1 });
  return res.status(200).json({
    success: true,
    data: { reviews }
  });
}

// PATCH /api/reviews/admin/:id - Admin update status or admin reply
export async function updateReviewAdmin(req: Request, res: Response) {
  const { id } = req.params;
  const { status, adminReply } = req.body;

  const review = await Review.findById(id);
  if (!review) {
    throw new AppError('Review not found', 404);
  }

  if (status) review.status = status;
  if (adminReply !== undefined) review.adminReply = adminReply;

  await review.save();

  return res.status(200).json({
    success: true,
    message: 'Review status updated',
    data: { review }
  });
}
