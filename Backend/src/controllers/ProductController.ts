import type { Request, Response } from 'express';
import Product from '../models/Product.js';
import Category from '../models/Category.js';
import { AppError } from '../utils/AppError.js';
import type {
  ProductListQueryDto,
  ProductAdminListQueryDto,
  CreateProductDto,
  UpdateProductDto,
  AddVariantDto,
  UpdateVariantDto,
} from '../dtos/ProductDtos.js';
import { toProductListItem, toProductDetail, toProductAdminDetail, toProductAdminListItem } from '../utils/toProductResponse.js';
import { slugify } from '../utils/slugify.js';
import { uploadBufferToCloudinary, deleteFromCloudinary } from '../utils/cloudinaryUpload.js';

// GET /api/categories/:slug/products
export async function listProductsByCategory(req: Request, res: Response) {
  const categorySlug = req.params.slug;
  if (!categorySlug) {
    throw new AppError('Category slug is required', 400);
  }
  const category = await Category.findOne({ slug: categorySlug, isActive: true });
  if (!category) {
    throw new AppError('Category not found', 404);
  }

  // Parsed and coerced by the validateQuery(productListQuerySchema) middleware
  const query = req.validatedQuery as ProductListQueryDto;

  // All price/size/color filters must match on the SAME variant
  // (e.g. "green AND size M AND under 500"), so they all live inside
  // one $elemMatch rather than separate top-level conditions.
  const variantMatch: Record<string, unknown> = { isActive: true };
  if (query.minPrice !== undefined || query.maxPrice !== undefined) {
    variantMatch.price = {
      ...(query.minPrice !== undefined ? { $gte: query.minPrice } : {}),
      ...(query.maxPrice !== undefined ? { $lte: query.maxPrice } : {}),
    };
  }
  if (query.size) variantMatch['attributes.size'] = query.size;
  if (query.color) variantMatch['attributes.color'] = query.color;

  // Built up conditionally below, so we type it loosely here rather than
  // fight Mongoose v9's (non-exported) internal filter typing for a shape
  // that's assembled piece by piece.
  const filter: Record<string, unknown> = {
    categoryId: category._id,
    isActive: true,
    variants: { $elemMatch: variantMatch },
  };

  if (query.search) {
    filter.$text = { $search: query.search };
  }

  const sortMap: Record<string, Record<string, 1 | -1>> = {
    price_asc: { basePrice: 1 },
    price_desc: { basePrice: -1 },
    newest: { createdAt: -1 },
  };
  // NOTE: sorting by basePrice, not per-variant price - if this store starts
  // relying heavily on variant-level pricing, this should move to an
  // aggregation pipeline that sorts by min variant price instead.
  const sort = sortMap[query.sort] ?? sortMap.newest;

  const skip = (query.page - 1) * query.limit;

  const [products, total] = await Promise.all([
    Product.find(filter).sort(sort).skip(skip).limit(query.limit),
    Product.countDocuments(filter),
  ]);

  return res.status(200).json({
    success: true,
    data: {
      category: { id: category._id.toString(), name: category.name, slug: category.slug },
      products: products.map(toProductListItem),
      pagination: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages: Math.ceil(total / query.limit),
      },
    },
  });
}

// GET /api/products - List/Search/Filter active products across all categories
export async function listAllProductsPublic(req: Request, res: Response) {
  const { categoryId, search, sort, isBestSeller, isTrending, page = '1', limit = '50' } = req.query;

  const filter: Record<string, unknown> = { isActive: true };
  if (categoryId) filter.categoryId = categoryId;
  if (isBestSeller === 'true') filter.isBestSeller = true;
  if (isTrending === 'true') filter.isTrending = true;

  if (search && typeof search === 'string' && search.trim() !== '') {
    filter.$or = [
      { name: { $regex: search.trim(), $options: 'i' } },
      { description: { $regex: search.trim(), $options: 'i' } },
    ];
  }

  const pageNum = parseInt(page as string, 10) || 1;
  const limitNum = parseInt(limit as string, 10) || 50;
  const skip = (pageNum - 1) * limitNum;

  let sortOption: Record<string, 1 | -1> = { createdAt: -1 };
  if (sort === 'price_asc') sortOption = { basePrice: 1 };
  if (sort === 'price_desc') sortOption = { basePrice: -1 };

  const [products, total] = await Promise.all([
    Product.find(filter).sort(sortOption).skip(skip).limit(limitNum),
    Product.countDocuments(filter),
  ]);

  return res.status(200).json({
    success: true,
    data: {
      products: products.map(toProductListItem),
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    },
  });
}

// GET /api/products/:slug
export async function getProductBySlug(req: Request, res: Response) {
  const slug = req.params.slug;
  if (!slug) {
    throw new AppError('Product slug is required', 400);
  }
  const product = await Product.findOne({ slug, isActive: true });
  if (!product) {
    throw new AppError('Product not found', 404);
  }

  return res.status(200).json({
    success: true,
    data: { product: toProductDetail(product) },
  });
}

// ---- Admin ----

// GET /api/products/admin/all - admin browse/search/filter across every
// product (active or not). This is the "product management table" endpoint.
export async function listProductsAdmin(req: Request, res: Response) {
  const query = req.validatedQuery as ProductAdminListQueryDto;

  const filter: Record<string, unknown> = {};
  if (query.categoryId) filter.categoryId = query.categoryId;
  if (query.isActive !== undefined) filter.isActive = query.isActive;
  if (query.search) filter.$text = { $search: query.search };

  const sortMap: Record<string, Record<string, 1 | -1>> = {
    newest: { createdAt: -1 },
    oldest: { createdAt: 1 },
    name_asc: { name: 1 },
  };
  const sort = sortMap[query.sort] ?? sortMap.newest;
  const skip = (query.page - 1) * query.limit;

  const [products, total] = await Promise.all([
    Product.find(filter).sort(sort).skip(skip).limit(query.limit),
    Product.countDocuments(filter),
  ]);

  return res.status(200).json({
    success: true,
    data: {
      products: products.map(toProductAdminListItem),
      pagination: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages: Math.ceil(total / query.limit),
      },
    },
  });
}

// GET /api/products/:id/admin - admin only, full detail incl. inactive variants/images
export async function getProductByIdAdmin(req: Request, res: Response) {
  const { id } = req.params;
  const product = await Product.findById(id);
  if (!product) {
    throw new AppError('Product not found', 404);
  }
  return res.status(200).json({
    success: true,
    data: { product: toProductAdminDetail(product) },
  });
}

// POST /api/products - admin only. Creates the item together with its
// initial variant(s) in one call.
export async function createProduct(req: Request, res: Response) {
  const body = req.body as CreateProductDto;

  const category = await Category.findById(body.categoryId);
  if (!category) {
    throw new AppError('Category not found', 404);
  }

  const normalizedImages = (body.images ?? []).map((image, index) => ({
    url: image.url,
    publicId: image.publicId ?? `manual-${Date.now()}-${index}`,
    altText: image.altText ?? body.name,
    sortOrder: image.sortOrder ?? index,
  }));

  const product = await Product.create({
    categoryId: category._id,
    name: body.name,
    slug: slugify(body.name),
    basePrice: body.basePrice,
    isCustomizable: body.isCustomizable,
    variants: body.variants,
    images: normalizedImages,
    ...(body.description !== undefined ? { description: body.description } : {}),
    ...(body.productionTimeDays !== undefined ? { productionTimeDays: body.productionTimeDays } : {}),
  });

  return res.status(201).json({
    success: true,
    message: 'Product created successfully',
    data: { product: toProductAdminDetail(product) },
  });
}

// PATCH /api/products/:id - admin only. Top-level fields; variants have
// their own endpoints below.
export async function updateProduct(req: Request, res: Response) {
  const { id } = req.params;
  const body = req.body as UpdateProductDto;

  const product = await Product.findById(id);
  if (!product) {
    throw new AppError('Product not found', 404);
  }

  if (body.categoryId !== undefined) {
    const category = await Category.findById(body.categoryId);
    if (!category) {
      throw new AppError('Category not found', 404);
    }
    product.categoryId = category._id;
  }
  if (body.name !== undefined) {
    product.name = body.name;
    product.slug = slugify(body.name);
  }
  if (body.description !== undefined) product.description = body.description;
  if (body.basePrice !== undefined) product.basePrice = body.basePrice;
  if (body.isCustomizable !== undefined) product.isCustomizable = body.isCustomizable;
  if (body.productionTimeDays !== undefined) product.productionTimeDays = body.productionTimeDays;
  if (body.isActive !== undefined) product.isActive = body.isActive;

  await product.save();

  return res.status(200).json({
    success: true,
    message: 'Product updated successfully',
    data: { product: toProductAdminDetail(product) },
  });
}

// DELETE /api/products/:id - admin only. Soft delete (keeps order history intact).
export async function deleteProduct(req: Request, res: Response) {
  const { id } = req.params;
  const product = await Product.findById(id);
  if (!product) {
    throw new AppError('Product not found', 404);
  }
  product.isActive = false;
  await product.save();
  return res.status(200).json({ success: true, message: 'Product deactivated successfully' });
}

// POST /api/products/:id/variants - admin only. Add a new variant to an existing item.
export async function addVariant(req: Request, res: Response) {
  const { id } = req.params;
  const body = req.body as AddVariantDto;

  const product = await Product.findById(id);
  if (!product) {
    throw new AppError('Product not found', 404);
  }

  product.variants.push(body as any);
  await product.save();

  return res.status(201).json({
    success: true,
    message: 'Variant added successfully',
    data: { product: toProductAdminDetail(product) },
  });
}

// PATCH /api/products/:id/variants/:variantId - admin only.
// This is also how you edit the inventory amount: send { "stockQty": 42 }.
export async function updateVariant(req: Request, res: Response) {
  const { id, variantId } = req.params;
  const body = req.body as UpdateVariantDto;

  const product = await Product.findById(id);
  if (!product) {
    throw new AppError('Product not found', 404);
  }

  const variant = product.variants.find((v) => v._id?.toString() === variantId);
  if (!variant) {
    throw new AppError('Variant not found', 404);
  }

  if (body.sku !== undefined) variant.sku = body.sku;
  if (body.price !== undefined) variant.price = body.price;
  if (body.stockQty !== undefined) variant.stockQty = body.stockQty;
  if (body.isActive !== undefined) variant.isActive = body.isActive;
  if (body.attributes !== undefined) {
    variant.attributes = new Map(Object.entries(body.attributes));
  }

  await product.save();

  return res.status(200).json({
    success: true,
    message: 'Variant updated successfully',
    data: { product: toProductAdminDetail(product) },
  });
}

// DELETE /api/products/:id/variants/:variantId - admin only.
// Soft delete via isActive:false, same reasoning as categories/products -
// past orders may still reference this SKU.
export async function deleteVariant(req: Request, res: Response) {
  const { id, variantId } = req.params;

  const product = await Product.findById(id);
  if (!product) {
    throw new AppError('Product not found', 404);
  }
  const variant = product.variants.find((v) => v._id?.toString() === variantId);
  if (!variant) {
    throw new AppError('Variant not found', 404);
  }

  variant.isActive = false;
  await product.save();

  return res.status(200).json({ success: true, message: 'Variant deactivated successfully' });
}

// POST /api/products/:id/images - admin only, multipart/form-data field "images" (up to 6).
// Files arrive in memory (see middleware/upload.ts) and are streamed to Cloudinary here.
export async function uploadProductImages(req: Request, res: Response) {
  const { id } = req.params;
  const product = await Product.findById(id);
  if (!product) {
    throw new AppError('Product not found', 404);
  }

  const files = (req.files as Express.Multer.File[] | undefined) ?? [];
  if (files.length === 0) {
    throw new AppError('At least one image file is required', 400);
  }

  const startingSortOrder = product.images.length;
  const uploaded = await Promise.all(files.map((f) => uploadBufferToCloudinary(f.buffer)));

  uploaded.forEach((result, i) => {
    product.images.push({
      url: result.url,
      publicId: result.publicId,
      sortOrder: startingSortOrder + i,
    } as any);
  });

  await product.save();

  return res.status(201).json({
    success: true,
    message: 'Images uploaded successfully',
    data: { product: toProductAdminDetail(product) },
  });
}

// DELETE /api/products/:id/images/:imageId - admin only.
// Images are removed outright (not soft-deleted) - they're presentation
// assets, not something that needs to stay in historical records.
export async function deleteProductImage(req: Request, res: Response) {
  const { id, imageId } = req.params;

  const product = await Product.findById(id);
  if (!product) {
    throw new AppError('Product not found', 404);
  }

  const imageIndex = product.images.findIndex((img) => img._id?.toString() === imageId);
  if (imageIndex === -1) {
    throw new AppError('Image not found', 404);
  }

  const publicId = product.images[imageIndex]!.publicId;
  product.images.splice(imageIndex, 1);
  await product.save();
  await deleteFromCloudinary(publicId); // best-effort; DB is already source of truth

  return res.status(200).json({ success: true, message: 'Image deleted successfully' });
}
