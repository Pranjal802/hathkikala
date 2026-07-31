import { Router } from 'express';
import { protect } from '../middleware/protect.js';
import { createCashfreeOrder, verifyCashfreePayment, cashfreeWebhook } from '../controllers/CashfreeController.js';

const router = Router();

router.post('/create-order', protect, createCashfreeOrder);
router.post('/verify', protect, verifyCashfreePayment);
router.post('/webhook', cashfreeWebhook);

export default router;
