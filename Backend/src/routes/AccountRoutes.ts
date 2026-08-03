import { Router } from 'express';
import {
  getMyAccount,
  updateProfile,
  addAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
} from '../controllers/AccountController.js';
import { optionalAuth } from '../middleware/optionalAuth.js';
import { protect } from '../middleware/protect.js';

const router = Router();

router.get('/me', optionalAuth, getMyAccount);
router.patch('/profile', protect, updateProfile);
router.post('/addresses', protect, addAddress);
router.patch('/addresses/:addressId', protect, updateAddress);
router.delete('/addresses/:addressId', protect, deleteAddress);
router.patch('/addresses/:addressId/default', protect, setDefaultAddress);

export default router;
