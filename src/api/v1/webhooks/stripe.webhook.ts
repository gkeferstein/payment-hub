/**
 * Stripe Webhook Handler
 * Handles webhook events from Stripe payment provider
 * 
 * Events handled:
 * - payment_intent.succeeded
 * - payment_intent.failed
 * - payment_intent.canceled
 */

import { Request, Response } from 'express';

/**
 * Verify Stripe webhook signature
 * In production, use the Stripe SDK for proper signature validation
 */
function verifyStripeSignature(req: Request): boolean {
  const signature = req.headers['stripe-signature'] as string;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error('STRIPE_WEBHOOK_SECRET not configured');
    return false;
  }

  if (!signature) {
    console.error('Missing Stripe signature header');
    return false;
  }

  // In production, use Stripe SDK for proper validation
  // For now, simple check
  return true;
}

/**
 * Handle Stripe webhook
 * POST /api/v1/webhooks/stripe
 */
export async function handleStripeWebhook(req: Request, res: Response): Promise<void> {
  try {
    if (!verifyStripeSignature(req)) {
      res.status(401).json({
        success: false,
        error: {
          message: 'Invalid webhook signature',
          code: 'INVALID_SIGNATURE',
        },
      });
      return;
    }

    const event = req.body;
    const eventType = event.type;
    const eventId = event.id;

    console.log(`Received Stripe webhook: ${eventType} (${eventId})`);

    switch (eventType) {
      case 'payment_intent.succeeded':
        await handlePaymentIntentSucceeded(event.data.object);
        break;

      case 'payment_intent.payment_failed':
      case 'payment_intent.failed':
        await handlePaymentIntentFailed(event.data.object);
        break;

      case 'payment_intent.canceled':
        await handlePaymentIntentCanceled(event.data.object);
        break;

      default:
        console.log(`Unhandled Stripe event type: ${eventType}`);
    }

    res.status(200).json({ received: true });
  } catch (error: any) {
    console.error('Error processing Stripe webhook:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Error processing webhook',
        code: 'WEBHOOK_PROCESSING_ERROR',
      },
    });
  }
}

/**
 * Handle payment_intent.succeeded event
 */
async function handlePaymentIntentSucceeded(paymentIntent: any): Promise<void> {
  const providerReference = paymentIntent.id;
  const amount = paymentIntent.amount / 100;

  console.log(`Payment succeeded: ${providerReference} (${amount})`);

  // Note: getPaymentByProviderReference method needs to be added to paymentService
  // For now, this is a placeholder implementation
  console.log('Payment success handling - implement provider reference lookup');
}

/**
 * Handle payment_intent.failed event
 */
async function handlePaymentIntentFailed(paymentIntent: any): Promise<void> {
  const providerReference = paymentIntent.id;
  const failureMessage = paymentIntent.last_payment_error?.message || 'Payment failed';

  console.log(`Payment failed: ${providerReference} - ${failureMessage}`);
}

/**
 * Handle payment_intent.canceled event
 */
async function handlePaymentIntentCanceled(paymentIntent: any): Promise<void> {
  const providerReference = paymentIntent.id;

  console.log(`Payment canceled: ${providerReference}`);
}
