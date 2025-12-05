/**
 * Stripe Webhook Handler
 * Handles webhook events from Stripe payment provider
 * 
 * Events handled:
 * - payment_intent.succeeded
 * - payment_intent.failed
 * - payment_intent.canceled
 * - terminal.reader.action_required (Terminal)
 * - terminal.reader.action_succeeded (Terminal)
 * - terminal.reader.action_failed (Terminal)
 */

import { Request, Response } from 'express';
import { paymentService } from '../../../domains/payment/services';
import { orderService } from '../../../domains/order/services';
import { PaymentStatus } from '../../../domains/payment/models';
import { OrderStatus } from '../../../domains/order/models';

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
      // Payment Intent Events (Online & Terminal)
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

      // Terminal-specific Events
      case 'terminal.reader.action_required':
        await handleTerminalActionRequired(event.data.object);
        break;

      case 'terminal.reader.action_succeeded':
        await handleTerminalActionSucceeded(event.data.object);
        break;

      case 'terminal.reader.action_failed':
        await handleTerminalActionFailed(event.data.object);
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
 * Works for both online and terminal payments
 */
async function handlePaymentIntentSucceeded(paymentIntent: any): Promise<void> {
  const providerReference = paymentIntent.id;
  const amount = paymentIntent.amount / 100;
  const orderId = paymentIntent.metadata?.order_id;

  console.log(`Payment succeeded: ${providerReference} (${amount}) for order: ${orderId}`);

  if (!orderId) {
    console.warn(`Payment Intent ${providerReference} has no order_id in metadata`);
    return;
  }

  try {
    // Find payment by provider reference
    const payments = await paymentService.getPaymentsByOrderId(orderId);
    const payment = payments.find((p) => p.provider_reference === providerReference);

    if (!payment) {
      console.warn(`Payment not found for provider_reference: ${providerReference}`);
      return;
    }

    // Update payment status
    await paymentService.updatePaymentStatus(
      payment.id,
      PaymentStatus.SUCCEEDED,
      'system',
      'Payment succeeded via Stripe webhook'
    );

    // Update payment with completed_at
    await paymentService.updatePayment(payment.id, {
      completed_at: new Date(),
      provider_reference: providerReference,
    });

    // Check if order should be marked as paid
    const order = await orderService.getOrderById(orderId);
    if (order && order.status !== OrderStatus.PAID) {
      const summary = await paymentService.getPaymentSummaryForOrder(orderId);
      if (summary.total_paid >= order.grand_total) {
        await orderService.updateOrderStatus(
          orderId,
          OrderStatus.PAID,
          'system',
          'Order fully paid via terminal payment'
        );
      }
    }
  } catch (error: any) {
    console.error(`Error handling payment_intent.succeeded: ${error.message}`);
  }
}

/**
 * Handle payment_intent.failed event
 */
async function handlePaymentIntentFailed(paymentIntent: any): Promise<void> {
  const providerReference = paymentIntent.id;
  const failureMessage = paymentIntent.last_payment_error?.message || 'Payment failed';
  const failureCode = paymentIntent.last_payment_error?.code;
  const orderId = paymentIntent.metadata?.order_id;

  console.log(`Payment failed: ${providerReference} - ${failureMessage}`);

  if (!orderId) {
    return;
  }

  try {
    const payments = await paymentService.getPaymentsByOrderId(orderId);
    const payment = payments.find((p) => p.provider_reference === providerReference);

    if (payment) {
      await paymentService.updatePayment(payment.id, {
        status: PaymentStatus.FAILED,
        failure_message: failureMessage,
        failure_code: failureCode,
      });
    }
  } catch (error: any) {
    console.error(`Error handling payment_intent.failed: ${error.message}`);
  }
}

/**
 * Handle payment_intent.canceled event
 */
async function handlePaymentIntentCanceled(paymentIntent: any): Promise<void> {
  const providerReference = paymentIntent.id;
  const orderId = paymentIntent.metadata?.order_id;

  console.log(`Payment canceled: ${providerReference}`);

  if (!orderId) {
    return;
  }

  try {
    const payments = await paymentService.getPaymentsByOrderId(orderId);
    const payment = payments.find((p) => p.provider_reference === providerReference);

    if (payment) {
      await paymentService.updatePaymentStatus(
        payment.id,
        PaymentStatus.CANCELLED,
        'system',
        'Payment canceled via Stripe webhook'
      );
    }
  } catch (error: any) {
    console.error(`Error handling payment_intent.canceled: ${error.message}`);
  }
}

/**
 * Handle terminal.reader.action_required event
 * Terminal requires additional action (e.g., PIN entry, signature)
 */
async function handleTerminalActionRequired(readerAction: any): Promise<void> {
  const paymentIntentId = readerAction.action?.payment_intent;
  console.log(`Terminal action required for Payment Intent: ${paymentIntentId}`);
  
  // Payment status should remain PROCESSING or REQUIRES_ACTION
  // Terminal SDK handles the action, we just log it
}

/**
 * Handle terminal.reader.action_succeeded event
 * Terminal action completed successfully
 * This usually triggers payment_intent.succeeded, but we handle it here too
 */
async function handleTerminalActionSucceeded(readerAction: any): Promise<void> {
  const paymentIntentId = readerAction.action?.payment_intent;
  console.log(`Terminal action succeeded for Payment Intent: ${paymentIntentId}`);
  
  // The payment_intent.succeeded event will handle the actual status update
  // This is just for logging/auditing terminal-specific actions
}

/**
 * Handle terminal.reader.action_failed event
 * Terminal action failed (e.g., card declined, reader error)
 */
async function handleTerminalActionFailed(readerAction: any): Promise<void> {
  const paymentIntentId = readerAction.action?.payment_intent;
  const error = readerAction.action?.failure_details;
  
  console.log(`Terminal action failed for Payment Intent: ${paymentIntentId}`, error);
  
  // The payment_intent.failed event will handle the actual status update
  // This is just for logging/auditing terminal-specific failures
}
