import { z } from 'zod';
import { objectIdSchema } from './common.js';

const inlineAddressSchema = z.object({
  fullName: z.string().min(1),
  phone: z.string().min(10),
  line1: z.string().min(1),
  line2: z.string().optional(),
  city: z.string().min(1),
  state: z.string().min(1),
  postalCode: z.string().min(1),
  country: z.string().min(1),
});

// Either reference one of the user's saved addresses by id,
// or provide a full address inline (e.g. a one-off shipping address).
export const createOrderSchema = z
  .object({
    addressId: objectIdSchema.optional(),
    shippingAddress: inlineAddressSchema.optional(),
    paymentMethod: z.enum(['cod', 'online', 'cashfree', 'razorpay', 'stripe', 'paypal']).optional(),
  })
  .refine((data) => data.addressId || data.shippingAddress, {
    message: 'Provide either addressId or shippingAddress',
  });
export type CreateOrderDto = z.infer<typeof createOrderSchema>;
export type InlineAddressDto = z.infer<typeof inlineAddressSchema>;
