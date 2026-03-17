import { Request, Response, NextFunction } from 'express';
import { PaymentService } from '../services/payment.service';
import { OrderService } from '../services/order.service';
import { successResponse } from '../utils/response.util';
import { AppError } from '../utils/AppError';

export class PaymentController {
  // POST /api/payment/create-intent
  static async createPaymentIntent(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!._id;
      const { orderId } = req.body;

      if (!orderId) {
        throw new AppError('Order ID is required', 400);
      }

      // Get order
      const order = await OrderService.getOrderById(orderId, userId);

      // Create payment intent
      const paymentIntent = await PaymentService.createPaymentIntent(
        order.total,
        'usd',
        {
          orderId: order._id.toString(),
          orderNumber: order.orderNumber,
          userId: userId.toString(),
        }
      );

      // Update order with payment intent ID
      await OrderService.updatePaymentDetails(
        orderId,
        paymentIntent.id,
        paymentIntent.status
      );

      successResponse(
        res,
        {
          clientSecret: paymentIntent.client_secret,
          paymentIntentId: paymentIntent.id,
        },
        'Payment intent created successfully'
      );
    } catch (error) {
      next(error);
    }
  }

  // POST /api/payment/webhook
  static async handleWebhook(req: Request, res: Response, next: NextFunction) {
    try {
      const signature = req.headers['stripe-signature'] as string;
      if (!signature) {
        throw new AppError('Missing stripe signature', 400);
      }

      const rawBody = req.body; // Raw body from stripe middleware
      const event = PaymentService.constructWebhookEvent(rawBody, signature);

      // Handle different event types
      switch (event.type) {
        case 'payment_intent.succeeded': {
          const paymentIntent = event.data.object as any;
          const orderId = paymentIntent.metadata.orderId;

          if (orderId) {
            // Update order status
            await OrderService.updatePaymentDetails(
              orderId,
              paymentIntent.id,
              'succeeded',
              paymentIntent.payment_method
            );
            await OrderService.confirmOrder(orderId);
            console.log(`✅ Payment succeeded for order ${orderId}`);
          }
          break;
        }

        case 'payment_intent.payment_failed': {
          const paymentIntent = event.data.object as any;
          const orderId = paymentIntent.metadata.orderId;

          if (orderId) {
            await OrderService.updatePaymentDetails(
              orderId,
              paymentIntent.id,
              'failed'
            );
            await OrderService.updateOrderStatus(orderId, 'failed', 'Payment failed');
            console.log(`❌ Payment failed for order ${orderId}`);
          }
          break;
        }

        case 'charge.refunded': {
          const charge = event.data.object as any;
          const paymentIntentId = charge.payment_intent;

          // Find order by payment intent ID
          const Order = require('../models/order.model').Order;
          const order = await Order.findOne({
            'paymentDetails.stripePaymentIntentId': paymentIntentId,
          });

          if (order) {
            await OrderService.updateOrderStatus(
              order._id.toString(),
              'refunded',
              'Payment refunded'
            );
            console.log(`💰 Refund processed for order ${order.orderNumber}`);
          }
          break;
        }

        default:
          console.log(`Unhandled event type: ${event.type}`);
      }

      res.json({ received: true });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/payment/intent/:paymentIntentId
  static async getPaymentIntent(req: Request, res: Response, next: NextFunction) {
    try {
      const { paymentIntentId } = req.params;
      const paymentIntent = await PaymentService.getPaymentIntent(paymentIntentId);

      successResponse(res, { paymentIntent }, 'Payment intent retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  // POST /api/payment/refund
  static async refundPayment(req: Request, res: Response, next: NextFunction) {
    try {
      const { orderId, amount } = req.body;

      if (!orderId) {
        throw new AppError('Order ID is required', 400);
      }

      // Get order (admin check would be here)
      const Order = require('../models/order.model').Order;
      const order = await Order.findById(orderId);

      if (!order) {
        throw new AppError('Order not found', 404);
      }

      // Process refund
      const refund = await PaymentService.refundPayment(
        order.paymentDetails.stripePaymentIntentId,
        amount
      );

      successResponse(res, { refund }, 'Refund processed successfully');
    } catch (error) {
      next(error);
    }
  }
}
