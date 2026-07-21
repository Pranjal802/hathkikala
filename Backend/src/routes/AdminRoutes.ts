import { Router } from 'express';
import {
  getSiteSettings,
  updateSiteSettings,
  listCoupons,
  createCoupon,
  deleteCoupon,
  validateCoupon,
  listCustomers,
  listReviews,
  updateReview,
  listSupportTickets,
  updateSupportTicket,
  createSupportTicket,
} from '../controllers/AdminController.js';
import { protect } from '../middleware/protect.js';
import { restrictTo } from '../middleware/restrictTo.js';

const router = Router();

// Public
router.get('/settings', getSiteSettings);
router.post('/coupons/validate', validateCoupon);
router.post('/support', createSupportTicket);

// Admin Protected
router.patch('/settings', protect, restrictTo('admin'), updateSiteSettings);
router.get('/coupons', protect, restrictTo('admin'), listCoupons);
router.post('/coupons', protect, restrictTo('admin'), createCoupon);
router.delete('/coupons/:id', protect, restrictTo('admin'), deleteCoupon);
router.get('/customers', protect, restrictTo('admin'), listCustomers);
router.get('/reviews', protect, restrictTo('admin'), listReviews);
router.patch('/reviews/:id', protect, restrictTo('admin'), updateReview);
router.get('/support', protect, restrictTo('admin'), listSupportTickets);
router.patch('/support/:id', protect, restrictTo('admin'), updateSupportTicket);

export default router;
