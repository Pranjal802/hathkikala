import { Router } from 'express';
import { getMyAccount } from '../controllers/AccountController.js';
import { protect } from '../middleware/protect.js';

const router = Router();

router.get('/me', protect, getMyAccount);

export default router;
