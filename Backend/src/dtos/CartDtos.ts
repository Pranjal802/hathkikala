import { z } from 'zod';
import { objectIdSchema } from './common.js';

export const addCartItemSchema = z.object({
  productId: objectIdSchema,
  variantSku: z.string().min(1),
  quantity: z.number().int().positive().max(50), // sane upper bound, adjust if needed
});
export type AddCartItemDto = z.infer<typeof addCartItemSchema>;

export const updateCartItemSchema = z.object({
  delta: z.number().int().refine((v) => v !== 0, 'delta cannot be 0'), // e.g. +1 or -1 from a stepper
});
export type UpdateCartItemDto = z.infer<typeof updateCartItemSchema>;