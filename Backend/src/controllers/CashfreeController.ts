import type { Request, Response } from 'express';
import Cashfree from '../config/cashfree.js';
import Order from '../models/Order.js';
import { AppError } from '../utils/AppError.js';

// POST /api/payments/cashfree/create-order
export async function createCashfreeOrder(req: Request, res: Response) {
  const { orderId } = req.body;
  if (!orderId) {
    throw new AppError('Order ID is required', 400);
  }

  const order = await Order.findById(orderId);
  if (!order) {
    throw new AppError('Order not found', 404);
  }

  const appId = process.env.CASHFREE_APP_ID;
  const secretKey = process.env.CASHFREE_SECRET_KEY;

  // Fallback simulation mode if credentials are not set yet during development
  if (!appId || !secretKey || appId.includes('your_cashfree_app_id')) {
    const mockSessionId = `session_sim_${Date.now()}`;
    order.payment.provider = 'cashfree';
    order.payment.providerOrderId = `cf_order_sim_${Date.now()}`;
    await order.save();

    return res.status(200).json({
      success: true,
      isSimulationMode: true,
      paymentSessionId: mockSessionId,
      orderId: order._id.toString(),
      message: 'Cashfree initialized in simulation mode (Add CASHFREE_APP_ID & CASHFREE_SECRET_KEY in .env for production)',
    });
  }

  try {
    const request = {
      order_id: order._id.toString(),
      order_amount: order.totalAmount,
      order_currency: 'INR',
      customer_details: {
        customer_id: order.userId.toString(),
        customer_name: order.shippingAddress.fullName,
        customer_email: req.user?.email || 'customer@hathkikala.com',
        customer_phone: order.shippingAddress.phone.replace(/[^0-9]/g, '').slice(-10) || '9876543210',
      },
      order_meta: {
        return_url: `${req.headers.origin || 'http://localhost:5174'}/orders?cf_order_id={order_id}`,
      },
    };

    const response = await Cashfree.PGCreateOrder('2023-08-01', request as any);
    const data = response.data;

    order.payment.provider = 'cashfree';
    order.payment.providerOrderId = data.order_id;
    await order.save();

    return res.status(200).json({
      success: true,
      isSimulationMode: false,
      paymentSessionId: data.payment_session_id,
      orderId: order._id.toString(),
    });
  } catch (err: any) {
    console.error('Cashfree PGCreateOrder Error:', err?.response?.data || err?.message || err);
    throw new AppError(`Cashfree order creation failed: ${err?.response?.data?.message || err.message}`, 502);
  }
}

// POST /api/payments/cashfree/verify
export async function verifyCashfreePayment(req: Request, res: Response) {
  const { orderId } = req.body;
  if (!orderId) {
    throw new AppError('Order ID is required', 400);
  }

  const order = await Order.findById(orderId);
  if (!order) {
    throw new AppError('Order not found', 404);
  }

  const appId = process.env.CASHFREE_APP_ID;
  const secretKey = process.env.CASHFREE_SECRET_KEY;

  // Handle simulation mode verification
  if (!appId || !secretKey || appId.includes('your_cashfree_app_id')) {
    order.payment.status = 'paid';
    order.payment.paidAt = new Date();
    order.status = 'confirmed';
    order.statusHistory.push({
      status: 'confirmed',
      changedAt: new Date(),
      note: 'Payment verified via Cashfree (Test/Simulation Mode)',
    });
    await order.save();

    return res.status(200).json({
      success: true,
      isSimulationMode: true,
      message: 'Cashfree payment verified (Simulation Mode)',
      data: { order },
    });
  }

  try {
    const response = await Cashfree.PGFetchOrder('2023-08-01', orderId);
    const cfOrder = response.data;

    if (cfOrder.order_status === 'PAID') {
      order.payment.status = 'paid';
      order.payment.paidAt = new Date();
      order.status = 'confirmed';
      order.statusHistory.push({
        status: 'confirmed',
        changedAt: new Date(),
        note: `Payment verified via Cashfree (Status: PAID)`,
      });
      await order.save();

      return res.status(200).json({
        success: true,
        message: 'Payment verified successfully!',
        data: { order },
      });
    } else {
      return res.status(400).json({
        success: false,
        message: `Payment status is ${cfOrder.order_status}`,
        orderStatus: cfOrder.order_status,
      });
    }
  } catch (err: any) {
    console.error('Cashfree PGFetchOrder Error:', err?.response?.data || err?.message || err);
    throw new AppError(`Cashfree verification failed: ${err?.response?.data?.message || err.message}`, 502);
  }
}

// POST /api/payments/cashfree/webhook
export async function cashfreeWebhook(req: Request, res: Response) {
  try {
    const payload = req.body;
    if (payload?.type === 'PAYMENT_SUCCESS_WEBHOOK' && payload?.data?.order?.order_id) {
      const orderId = payload.data.order.order_id;
      const order = await Order.findById(orderId);
      if (order && order.payment.status !== 'paid') {
        order.payment.status = 'paid';
        order.payment.paidAt = new Date();
        order.payment.providerPaymentId = payload.data.payment.cf_payment_id;
        order.status = 'confirmed';
        order.statusHistory.push({
          status: 'confirmed',
          changedAt: new Date(),
          note: 'Payment verified via Cashfree Webhook',
        });
        await order.save();
      }
    }
    return res.status(200).json({ status: 'OK' });
  } catch (err) {
    console.error('Cashfree Webhook Error:', err);
    return res.status(500).json({ status: 'ERROR' });
  }
}
