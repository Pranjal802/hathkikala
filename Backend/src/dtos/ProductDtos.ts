import { z } from 'zod';
import { objectIdSchema } from './common.js';

// Query params come in as strings, so we coerce numbers/booleans explicitly.
export const productListQuerySchema = z.object({
  minPrice: z.coerce.number().nonnegative().optional(),
  maxPrice: z.coerce.number().nonnegative().optional(),
  size: z.string().optional(),
  color: z.string().optional(),
  search: z.string().optional(),
  sort: z.enum(['price_asc', 'price_desc', 'newest']).optional().default('newest'),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(50).optional().default(12),
});
export type ProductListQueryDto = z.infer<typeof productListQuerySchema>;

// GET /api/products/admin/all - admin browse/search across every product,
// active or not. Deliberately separate from productListQuerySchema above:
// no variant-level $elemMatch filtering, but adds isActive/categoryId filters
// an admin panel actually needs.
export const productAdminListQuerySchema = z.object({
  categoryId: objectIdSchema.optional(),
  search: z.string().optional(),
  isActive: z.coerce.boolean().optional(),
  sort: z.enum(['newest', 'oldest', 'name_asc']).optional().default('newest'),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(20),
});
export type ProductAdminListQueryDto = z.infer<typeof productAdminListQuerySchema>;

// ---- Admin DTOs ----

const variantInputSchema = z.object({
  sku: z.string().trim().min(1),
  price: z.coerce.number().nonnegative(),
  stockQty: z.coerce.number().int().nonnegative().optional().default(0),
  attributes: z.record(z.string(), z.string()).optional().default({}),
  isActive: z.coerce.boolean().optional().default(true),
});

const productImageInputSchema = z.object({
  url: z.string().trim().url(),
  publicId: z.string().trim().min(1).optional(),
  altText: z.string().trim().optional(),
  sortOrder: z.coerce.number().int().nonnegative().optional().default(0),
});

// POST /api/products - creating an item always requires its category and
// at least one variant (a product with zero purchasable variants isn't sellable yet).
export const createProductSchema = z.object({
  categoryId: objectIdSchema,
  name: z.string().trim().min(2),
  description: z.string().trim().optional(),
  basePrice: z.coerce.number().nonnegative(),
  isCustomizable: z.coerce.boolean().optional().default(false),
  productionTimeDays: z.coerce.number().int().nonnegative().optional(),
  variants: z.array(variantInputSchema).min(1, 'At least one variant is required'),
  images: z.array(productImageInputSchema).optional(),
});
export type CreateProductDto = z.infer<typeof createProductSchema>;

// PATCH /api/products/:id - top-level product fields only; variants are
// managed through their own endpoints below.
export const updateProductSchema = z.object({
  categoryId: objectIdSchema.optional(),
  name: z.string().trim().min(2).optional(),
  description: z.string().trim().optional(),
  basePrice: z.coerce.number().nonnegative().optional(),
  isCustomizable: z.coerce.boolean().optional(),
  productionTimeDays: z.coerce.number().int().nonnegative().optional(),
  isActive: z.coerce.boolean().optional(),
});
export type UpdateProductDto = z.infer<typeof updateProductSchema>;

// POST /api/products/:id/variants
export const addVariantSchema = variantInputSchema;
export type AddVariantDto = z.infer<typeof addVariantSchema>;

// PATCH /api/products/:id/variants/:variantId
// Everything optional (PATCH semantics) - this is also the "edit inventory
// amount" endpoint via stockQty.
export const updateVariantSchema = z.object({
  sku: z.string().trim().min(1).optional(),
  price: z.coerce.number().nonnegative().optional(),
  stockQty: z.coerce.number().int().nonnegative().optional(),
  attributes: z.record(z.string(), z.string()).optional(),
  isActive: z.coerce.boolean().optional(),
});
export type UpdateVariantDto = z.infer<typeof updateVariantSchema>;
