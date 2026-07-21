import { z } from 'zod';

// NOTE: role is intentionally NOT accepted from the client here - every
// signup becomes a plain 'user' (see User model default). Promoting someone
// to 'admin' is a separate, manually-controlled operation (e.g. directly in
// the DB or via a seed script), never something a client can request.
export const registerSchema = z.object({
  username: z.string().min(3),
  email: z.email(),
  phone: z.string().min(10),
  password: z.string().min(6),
});
export type RegisterDto = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  emailOrPhone: z.string(),
  password: z.string(),
});
export type LoginDto = z.infer<typeof loginSchema>;

// Response DTO — shape of user data sent back to client (no password!)
export interface UserResponseDto {
  id: string;
  // username: string;
  email: string;
  phone: string;
}