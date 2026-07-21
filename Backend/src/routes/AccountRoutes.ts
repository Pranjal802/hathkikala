import { Router } from 'express';
import { getMyAccount } from '../controllers/AccountController.js';
import { optionalAuth } from '../middleware/optionalAuth.js';

const router = Router();

router.get('/me', optionalAuth, getMyAccount);

export default router;
