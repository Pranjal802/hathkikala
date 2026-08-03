import { Router } from 'express';
import {
  createOrder,
  listOrders,
  getOrderById,
  guestLookupOrder,
  cancelOrderCustomer,
  reorderCustomer,
  listAllOrdersAdmin,
  updateOrderStatusAdmin,
  addOrderStaffNoteAdmin,
  getOrderStatsAdmin,
} from '../controllers/OrderController.js';
import { protect, optionalProtect } from '../middleware/protect.js';
import { restrictTo } from '../middleware/restrictTo.js';

const router = Router();

// Public / Guest Routes
router.post('/guest-lookup', guestLookupOrder);
router.post('/', optionalProtect, createOrder);

// Protected Routes (requires login)
router.use(protect);

// Admin routes
router.get('/admin/all', restrictTo('admin'), listAllOrdersAdmin);
router.get('/admin/stats', restrictTo('admin'), getOrderStatsAdmin);
router.patch('/admin/:id/status', restrictTo('admin'), updateOrderStatusAdmin);
router.post('/admin/:id/notes', restrictTo('admin'), addOrderStaffNoteAdmin);

// Customer routes
router.get('/', listOrders);
router.post('/:id/cancel', cancelOrderCustomer);
router.post('/:id/reorder', reorderCustomer);
router.get('/:id', getOrderById);

export default router;
