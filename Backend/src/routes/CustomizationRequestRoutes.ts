import { Router } from 'express';
import {
  getMyCustomizationRequests,
  getCustomizationByOrder,
  updateCustomizationAdmin,
} from '../controllers/CustomizationRequestController.js';
import { protect } from '../middleware/protect.js';
import { restrictTo } from '../middleware/restrictTo.js';

const router = Router();

router.use(protect);

router.get('/my', getMyCustomizationRequests);
router.get('/order/:orderId', getCustomizationByOrder);
router.post('/admin/:id/update', restrictTo('admin'), updateCustomizationAdmin);

export default router;
