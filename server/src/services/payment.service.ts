import Stripe from 'stripe';
import { AppError } from '../utils/AppError';

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
if (!stripeSecretKey) {
  throw new Error('STRIPE_SECRET_KEY environment variable is not set');
}

export const stripe = new Stripe(stripeSecretKey, {
  apiVersion: '2024-12-18.acacia',
  typescript: true,
});

export class PaymentService {
  // Create payment intent
  static async createPaymentIntent(
    amount: number,
    currency: string = 'usd',
    metadata: Record<string, string> = {}
  ): Promise<Stripe.PaymentIntent> {
    try {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency,
        metadata,
        automatic_payment_methods: {
          enabled: true,
        },
      });

      return paymentIntent;
    } catch (error) {
      console.error('Stripe createPaymentIntent error:', error);
      throw new AppError('Failed to create payment intent', 500);
    }
  }

  // Confirm payment intent
  static async confirmPaymentIntent(paymentIntentId: string): Promise<Stripe.PaymentIntent> {
    try {
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
      return paymentIntent;
    } catch (error) {
      console.error('Stripe confirmPaymentIntent error:', error);
      throw new AppError('Failed to confirm payment', 500);
    }
  }

  // Refund payment
  static async refundPayment(
    paymentIntentId: string,
    amount?: number
  ): Promise<Stripe.Refund> {
    try {
      const refundOptions: Stripe.RefundCreateParams = {
        payment_intent: paymentIntentId,
      };

      if (amount) {
        refundOptions.amount = Math.round(amount * 100); // Convert to cents
      }

      const refund = await stripe.refunds.create(refundOptions);
      return refund;
    } catch (error) {
      console.error('Stripe refundPayment error:', error);
      throw new AppError('Failed to process refund', 500);
    }
  }

  // Handle webhook events
  static constructWebhookEvent(
    rawBody: Buffer,
    signature: string
  ): Stripe.Event {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
      throw new AppError('STRIPE_WEBHOOK_SECRET is not configured', 500);
    }

    try {
      const event = stripe.webhooks.constructEvent(
        rawBody,
        signature,
        webhookSecret
      );
      return event;
    } catch (error: any) {
      console.error('Webhook signature verification failed:', error.message);
      throw new AppError(`Webhook Error: ${error.message}`, 400);
    }
  }

  // Get payment intent
  static async getPaymentIntent(paymentIntentId: string): Promise<Stripe.PaymentIntent> {
    try {
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
      return paymentIntent;
    } catch (error) {
      console.error('Stripe getPaymentIntent error:', error);
      throw new AppError('Failed to retrieve payment intent', 500);
    }
  }

  // Update payment intent
  static async updatePaymentIntent(
    paymentIntentId: string,
    params: Stripe.PaymentIntentUpdateParams
  ): Promise<Stripe.PaymentIntent> {
    try {
      const paymentIntent = await stripe.paymentIntents.update(paymentIntentId, params);
      return paymentIntent;
    } catch (error) {
      console.error('Stripe updatePaymentIntent error:', error);
      throw new AppError('Failed to update payment intent', 500);
    }
  }

  // Cancel payment intent
  static async cancelPaymentIntent(paymentIntentId: string): Promise<Stripe.PaymentIntent> {
    try {
      const paymentIntent = await stripe.paymentIntents.cancel(paymentIntentId);
      return paymentIntent;
    } catch (error) {
      console.error('Stripe cancelPaymentIntent error:', error);
      throw new AppError('Failed to cancel payment intent', 500);
    }
  }
}
