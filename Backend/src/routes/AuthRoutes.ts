import { Router } from 'express';
import { signup, login, logout, verifyOtp, resendOtp, forgotPassword } from '../controllers/AuthControllers.js';
import { validate } from '../middleware/validate.js';
import { registerSchema, loginSchema } from '../dtos/AuthDtos.js';
import { protect } from '../middleware/protect.js';

const router = Router();

// Public routes
router.post('/register', validate(registerSchema), signup);
router.post('/verify-otp', verifyOtp);
router.post('/resend-otp', resendOtp);
router.post('/login', validate(loginSchema), login);
router.post('/logout', logout);
router.post('/forgot-password', forgotPassword);

export default router;