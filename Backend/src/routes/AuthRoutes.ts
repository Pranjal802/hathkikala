import { Router } from 'express';
import { signup, login, logout } from '../controllers/AuthControllers.js';
import { validate } from '../middleware/validate.js';
import { registerSchema, loginSchema } from '../dtos/AuthDtos.js';
import { protect } from '../middleware/protect.js';
// import { authorize } from '../middleware/roleMiddleware.js';

const router = Router();

// Public routes
router.post('/register', validate(registerSchema), signup);
router.post('/login', validate(loginSchema), login);
router.post('/logout', protect, logout);

// Protected route — any logged-in user
// router.get('/profile', protect, getProfile);

// Example: protected + role-restricted route
// router.delete('/users/:id', protect, authorize('admin'), deleteUser);

export default router;