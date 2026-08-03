import { Router } from 'express';
import { generateVirtualTryOn, getTryOnLogs } from '../controllers/AiController.js';
import { optionalProtect, protect } from '../middleware/protect.js';
import { restrictTo } from '../middleware/restrictTo.js';

const router = Router();

// Public / Customer Endpoints (accessible by guests & logged in users)
router.post('/virtual-tryon', optionalProtect, generateVirtualTryOn);

// Admin Analytics Endpoint
router.get('/admin/logs', protect, restrictTo('admin'), getTryOnLogs);

export default router;
