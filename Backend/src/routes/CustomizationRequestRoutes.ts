import { Router } from 'express';
import {
  createCustomizationRequest,
  getMyCustomizationRequests,
  getCustomizationByOrder,
  updateCustomizationAdmin,
} from '../controllers/CustomizationRequestController.js';
import { protect, optionalProtect } from '../middleware/protect.js';
import { restrictTo } from '../middleware/restrictTo.js';

const router = Router();

// Public / Guest & Authenticated Customization Request Creation
router.post('/', optionalProtect, createCustomizationRequest);

// Protected routes
router.get('/my', protect, getMyCustomizationRequests);
router.get('/order/:orderId', protect, getCustomizationByOrder);
router.post('/admin/:id/update', protect, restrictTo('admin'), updateCustomizationAdmin);

export default router;
