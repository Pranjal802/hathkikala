import { Router } from 'express';
import { createOrder, listOrders, getOrderById } from '../controllers/OrderController.js';
import { protect } from '../middleware/protect.js';
import { validate } from '../middleware/validate.js';
import { createOrderSchema } from '../dtos/OrderDtos.js';

const router = Router();

router.use(protect); // every order route requires a logged-in user

router.post('/', validate(createOrderSchema), createOrder);
router.get('/', listOrders);
router.get('/:id', getOrderById);

export default router;
