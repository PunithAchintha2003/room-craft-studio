import { Router } from 'express';
import { PaymentController } from '../controllers/payment.controller';
import { protect } from '../middleware/auth.middleware';
import express from 'express';

const router = Router();

// Webhook route - needs raw body for signature verification
router.post(
  '/webhook',
  express.raw({ type: 'application/json' }),
  PaymentController.handleWebhook
);

// Protected routes
router.use(protect);

// POST /api/payment/create-intent - Create payment intent
router.post('/create-intent', PaymentController.createPaymentIntent);

// GET /api/payment/intent/:paymentIntentId - Get payment intent
router.get('/intent/:paymentIntentId', PaymentController.getPaymentIntent);

// POST /api/payment/refund - Process refund (admin only - to be protected)
router.post('/refund', PaymentController.refundPayment);

export default router;
