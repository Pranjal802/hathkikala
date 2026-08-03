import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().trim().optional(),
  username: z.string().trim().optional(),
  email: z.string().trim().email({ message: "Please provide a valid email address" }),
  phone: z.string().trim().min(7, { message: "Phone number must be at least 7 digits" }).optional().or(z.literal('')),
  password: z.string().min(4, { message: "Password must be at least 4 characters long" }),
});

export type RegisterDto = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  emailOrPhone: z.string().min(1, { message: "Email or phone is required" }),
  password: z.string().min(1, { message: "Password is required" }),
});

export type LoginDto = z.infer<typeof loginSchema>;

// Response DTO — shape of user data sent back to client
export interface UserResponseDto {
  id: string;
  name?: string;
  email: string;
  phone: string;
  role: string;
  addresses?: any[];
}