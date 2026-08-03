import type { Request, Response } from 'express';
import Wishlist from '../models/Wishlist.js';
import Product from '../models/Product.js';
import Cart from '../models/Cart.js';
import { AppError } from '../utils/AppError.js';

// GET /api/wishlist
export async function getWishlist(req: Request, res: Response) {
  const userId = req.user!._id;

  let wishlist = await Wishlist.findOne({ userId }).populate({
    path: 'products.productId',
    select: 'name slug basePrice compareAtPrice rating reviewCount images category variants isActive',
  });

  if (!wishlist) {
    wishlist = await Wishlist.create({ userId, products: [] });
  }

  // Filter out any hard-deleted product references
  const validProducts = wishlist.products.filter((item) => item.productId !== null);

  return res.status(200).json({
    success: true,
    data: {
      wishlist: validProducts.map((item: any) => {
        const prod = item.productId;
        const totalStock = prod.variants ? prod.variants.reduce((sum: number, v: any) => sum + (v.stockQty || 0), 0) : 0;
        return {
          productId: prod._id,
          name: prod.name,
          slug: prod.slug,
          basePrice: prod.basePrice,
          compareAtPrice: prod.compareAtPrice,
          rating: prod.rating,
          reviewCount: prod.reviewCount,
          images: prod.images,
          variants: prod.variants,
          isOutOfStock: totalStock <= 0 || !prod.isActive,
          addedAt: item.addedAt,
        };
      }),
    },
  });
}

// POST /api/wishlist/toggle - Add or remove product from Wishlist
export async function toggleWishlist(req: Request, res: Response) {
  const userId = req.user!._id;
  const { productId } = req.body;

  if (!productId) {
    throw new AppError('Product ID is required', 400);
  }

  let wishlist = await Wishlist.findOne({ userId });
  if (!wishlist) {
    wishlist = await Wishlist.create({ userId, products: [] });
  }

  const existingIndex = wishlist.products.findIndex(
    (p) => p.productId.toString() === productId.toString()
  );

  let isSaved = false;
  if (existingIndex > -1) {
    wishlist.products.splice(existingIndex, 1);
    isSaved = false;
  } else {
    wishlist.products.push({ productId, addedAt: new Date() } as any);
    isSaved = true;
  }

  await wishlist.save();

  return res.status(200).json({
    success: true,
    message: isSaved ? 'Added to Wishlist ❤️' : 'Removed from Wishlist',
    data: { isSaved, wishlistProductIds: wishlist.products.map((p) => p.productId.toString()) },
  });
}

// POST /api/wishlist/move-to-cart - Move item from Wishlist to Cart
export async function moveToCart(req: Request, res: Response) {
  const userId = req.user!._id;
  const { productId, variantSku } = req.body;

  if (!productId) {
    throw new AppError('Product ID is required', 400);
  }

  const product = await Product.findById(productId);
  if (!product || !product.isActive) {
    throw new AppError('Product is no longer available', 404);
  }

  const targetVariant = variantSku
    ? product.variants.find((v) => v.sku === variantSku && v.isActive)
    : product.variants.find((v) => v.isActive && v.stockQty > 0) || product.variants[0];

  if (!targetVariant || targetVariant.stockQty <= 0) {
    throw new AppError('Item is currently Out of Stock', 400);
  }

  let cart = await Cart.findOne({ userId });
  if (!cart) {
    cart = await Cart.create({ userId, items: [] });
  }

  const existingCartItem = cart.items.find(
    (item) => item.productId.toString() === productId.toString() && item.variantSku === targetVariant.sku
  );

  if (existingCartItem) {
    existingCartItem.quantity += 1;
  } else {
    cart.items.push({
      productId,
      variantSku: targetVariant.sku,
      quantity: 1,
    } as any);
  }
  await cart.save();

  // Remove from Wishlist
  await Wishlist.updateOne(
    { userId },
    { $pull: { products: { productId } } }
  );

  return res.status(200).json({
    success: true,
    message: `Moved "${product.name}" to Cart! 🛍️`,
    data: { cart },
  });
}
