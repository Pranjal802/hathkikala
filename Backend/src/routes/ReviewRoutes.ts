import { Router } from 'express';
import {
  getProductReviews,
  createReview,
  getMyReviews,
  getUnreviewedItems,
  updateReviewCustomer,
  deleteReviewCustomer,
  listAllReviewsAdmin,
  updateReviewAdmin,
} from '../controllers/ReviewController.js';
import { protect } from '../middleware/protect.js';
import { restrictTo } from '../middleware/restrictTo.js';

const router = Router();

// Public route
router.get('/product/:productId', getProductReviews);

// Protected Customer routes
router.use(protect);
router.get('/my', getMyReviews);
router.get('/unreviewed', getUnreviewedItems);
router.post('/', createReview);
router.patch('/:id', updateReviewCustomer);
router.delete('/:id', deleteReviewCustomer);

// Admin routes
router.get('/admin/all', restrictTo('admin'), listAllReviewsAdmin);
router.patch('/admin/:id', restrictTo('admin'), updateReviewAdmin);

export default router;
