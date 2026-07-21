import type { ProductDocument, IVariant } from '../models/Product.js';

// Mongoose Map fields sometimes come back as a real Map (regular query)
// and sometimes as a plain object (.lean() queries) - handle both so
// callers don't have to think about it.
function attributesToPlainObject(
  attributes: Map<string, string> | Record<string, string> | undefined
): Record<string, string> {
  if (!attributes) return {};
  if (attributes instanceof Map) return Object.fromEntries(attributes);
  return attributes;
}

function computePriceRange(variants: IVariant[]): { min: number; max: number } {
  const activePrices = variants.filter((v) => v.isActive).map((v) => v.price);
  if (activePrices.length === 0) return { min: 0, max: 0 };
  return { min: Math.min(...activePrices), max: Math.max(...activePrices) };
}

// Lightweight shape for listing/grid pages - no need to ship every
// variant's full detail just to render a product card.
export function toProductListItem(product: ProductDocument) {
  const priceRange = computePriceRange(product.variants);
  const primaryImage = [...product.images].sort((a, b) => a.sortOrder - b.sortOrder)[0];
  const hasStock = product.variants.some((v) => v.isActive && v.stockQty > 0);
  const totalStock = product.variants.reduce((sum, v) => sum + (v.isActive ? v.stockQty : 0), 0);

  return {
    id: product._id.toString(),
    categoryId: product.categoryId.toString(),
    name: product.name,
    slug: product.slug,
    description: product.description ?? null,
    basePrice: product.basePrice,
    discountPrice: product.discountPrice ?? null,
    badge: product.badge ?? null,
    emoji: product.emoji ?? null,
    isBestSeller: !!product.isBestSeller,
    isTrending: !!product.isTrending,
    priceRange,
    thumbnail: primaryImage?.url ?? null,
    isCustomizable: product.isCustomizable,
    productionTimeDays: product.productionTimeDays ?? null,
    inStock: hasStock,
    totalStock,
    variants: product.variants.filter((v) => v.isActive).map((v) => ({
      id: v._id?.toString(),
      sku: v.sku,
      price: v.price,
      inStock: v.stockQty > 0,
      stockQty: v.stockQty,
      attributes: attributesToPlainObject(v.attributes),
    })),
  };
}

export function toProductAdminListItem(product: ProductDocument) {
  const primaryImage = [...product.images].sort((a, b) => a.sortOrder - b.sortOrder)[0];
  const totalStock = product.variants.reduce((sum, v) => sum + (v.isActive ? v.stockQty : 0), 0);

  return {
    id: product._id.toString(),
    categoryId: product.categoryId.toString(),
    name: product.name,
    slug: product.slug,
    basePrice: product.basePrice,
    discountPrice: product.discountPrice ?? null,
    badge: product.badge ?? null,
    emoji: product.emoji ?? null,
    isBestSeller: !!product.isBestSeller,
    isTrending: !!product.isTrending,
    isCustomizable: product.isCustomizable,
    thumbnail: primaryImage?.url ?? null,
    variantCount: product.variants.length,
    totalStock,
    isActive: product.isActive,
    createdAt: (product as any).createdAt,
  };
}

export function toProductAdminDetail(product: ProductDocument) {
  const sortedImages = [...product.images].sort((a, b) => a.sortOrder - b.sortOrder);

  return {
    id: product._id.toString(),
    categoryId: product.categoryId.toString(),
    name: product.name,
    slug: product.slug,
    description: product.description ?? null,
    basePrice: product.basePrice,
    discountPrice: product.discountPrice ?? null,
    badge: product.badge ?? null,
    emoji: product.emoji ?? null,
    isBestSeller: !!product.isBestSeller,
    isTrending: !!product.isTrending,
    isCustomizable: product.isCustomizable,
    productionTimeDays: product.productionTimeDays ?? null,
    isActive: product.isActive,
    images: sortedImages.map((img) => ({
      id: img._id?.toString(),
      url: img.url,
      publicId: img.publicId,
      altText: img.altText ?? null,
      sortOrder: img.sortOrder,
    })),
    variants: product.variants.map((v) => ({
      id: v._id?.toString(),
      sku: v.sku,
      price: v.price,
      stockQty: v.stockQty,
      attributes: attributesToPlainObject(v.attributes),
      isActive: v.isActive,
    })),
  };
}

export function toProductDetail(product: ProductDocument) {
  const activeVariants = product.variants.filter((v) => v.isActive);
  const sortedImages = [...product.images].sort((a, b) => a.sortOrder - b.sortOrder);
  const totalStock = activeVariants.reduce((sum, v) => sum + v.stockQty, 0);

  return {
    id: product._id.toString(),
    categoryId: product.categoryId.toString(),
    name: product.name,
    slug: product.slug,
    description: product.description ?? null,
    basePrice: product.basePrice,
    discountPrice: product.discountPrice ?? null,
    badge: product.badge ?? null,
    emoji: product.emoji ?? null,
    isBestSeller: !!product.isBestSeller,
    isTrending: !!product.isTrending,
    isCustomizable: product.isCustomizable,
    productionTimeDays: product.productionTimeDays ?? null,
    totalStock,
    images: sortedImages.map((img) => ({ url: img.url, altText: img.altText ?? null })),
    variants: activeVariants.map((v) => ({
      id: v._id?.toString(),
      sku: v.sku,
      price: v.price,
      inStock: v.stockQty > 0,
      stockQty: v.stockQty,
      attributes: attributesToPlainObject(v.attributes),
    })),
  };
}
