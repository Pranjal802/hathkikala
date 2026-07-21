import { z } from 'zod';

export const createCategorySchema = z.object({
  name: z.string().trim().min(2),
  description: z.string().trim().optional(),
  icon: z.string().trim().optional(),
  sortOrder: z.coerce.number().int().optional().default(0),
});
export type CreateCategoryDto = z.infer<typeof createCategorySchema>;

// All fields optional on update - PATCH semantics, only touch what's sent.
export const updateCategorySchema = z.object({
  name: z.string().trim().min(2).optional(),
  description: z.string().trim().optional(),
  icon: z.string().trim().optional(),
  sortOrder: z.coerce.number().int().optional(),
  isActive: z.coerce.boolean().optional(),
});
export type UpdateCategoryDto = z.infer<typeof updateCategorySchema>;
