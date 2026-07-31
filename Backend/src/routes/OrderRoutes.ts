import { Router } from 'express';
import {
  createOrder,
  listOrders,
  getOrderById,
  listAllOrdersAdmin,
  updateOrderStatusAdmin,
  addOrderStaffNoteAdmin,
  getOrderStatsAdmin,
} from '../controllers/OrderController.js';
import { protect } from '../middleware/protect.js';
import { restrictTo } from '../middleware/restrictTo.js';
import { validate } from '../middleware/validate.js';
import { createOrderSchema } from '../dtos/OrderDtos.js';

const router = Router();

router.use(protect); // every order route requires a logged-in user

// Admin routes must stay above the generic /:id customer route or they
// get swallowed by Express's param matching.
router.get('/admin/all', restrictTo('admin'), listAllOrdersAdmin);
router.get('/admin/stats', restrictTo('admin'), getOrderStatsAdmin);
router.patch('/admin/:id/status', restrictTo('admin'), updateOrderStatusAdmin);
router.post('/admin/:id/notes', restrictTo('admin'), addOrderStaffNoteAdmin);

// Customer routes
router.post('/', validate(createOrderSchema), createOrder);
router.get('/', listOrders);
router.get('/:id', getOrderById);

export default router;
