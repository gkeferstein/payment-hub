/**
 * Webhook Simulator Service
 * Allows simulating webhook events in sandbox mode without real Stripe connection
 * Useful for testing the complete payment flow
 */

import { paymentService } from '../../../domains/payment/services';
import { orderService } from '../../../domains/order/services';
import { PaymentStatus } from '../../../domains/payment/models';
import { OrderStatus } from '../../../domains/order/models';

export interface SimulateWebhookInput {
  payment_id: string;
  event_type: 'payment_intent.succeeded' | 'payment_intent.failed' | 'payment_intent.canceled';
  delay_ms?: number; // Optional delay before processing (for testing async behavior)
}

export class WebhookSimulatorService {
  /**
   * Simulate a Stripe webhook event
   * Only works in sandbox mode
   */
  async simulateStripeWebhook(input: SimulateWebhookInput): Promise<void> {
    if (process.env.SANDBOX_MODE !== 'true' && process.env.SANDBOX_MODE !== '1') {
      throw new Error('Webhook simulation is only available in SANDBOX_MODE');
    }

    const payment = await paymentService.getPaymentById(input.payment_id);
    if (!payment) {
      throw new Error(`Payment ${input.payment_id} not found`);
    }

    if (!payment.provider_reference) {
      throw new Error(`Payment ${input.payment_id} has no provider_reference (must be created first)`);
    }

    // Optional delay for testing async behavior
    if (input.delay_ms) {
      await this.sleep(input.delay_ms);
    }

    console.log(`[SANDBOX] Simulating Stripe webhook: ${input.event_type} for payment ${input.payment_id}`);

    switch (input.event_type) {
      case 'payment_intent.succeeded':
        await this.simulatePaymentSucceeded(payment);
        break;
      case 'payment_intent.failed':
        await this.simulatePaymentFailed(payment);
        break;
      case 'payment_intent.canceled':
        await this.simulatePaymentCanceled(payment);
        break;
      default:
        throw new Error(`Unsupported event type: ${input.event_type}`);
    }
  }

  /**
   * Simulate payment_intent.succeeded event
   */
  private async simulatePaymentSucceeded(payment: any): Promise<void> {
    // Update payment status
    await paymentService.updatePaymentStatus(
      payment.id,
      PaymentStatus.SUCCEEDED,
      'system',
      'Payment succeeded via simulated webhook (SANDBOX MODE)'
    );

    // Update payment with completed_at
    await paymentService.updatePayment(payment.id, {
      completed_at: new Date(),
    });

    // Check if order should be marked as paid
    const order = await orderService.getOrderById(payment.order_id);
    if (order && order.status !== OrderStatus.PAID) {
      const summary = await paymentService.getPaymentSummaryForOrder(payment.order_id);
      if (summary.total_paid >= order.grand_total) {
        await orderService.updateOrderStatus(
          order.id,
          OrderStatus.PAID,
          'system',
          'Order fully paid via simulated payment (SANDBOX MODE)'
        );
      }
    }
  }

  /**
   * Simulate payment_intent.failed event
   */
  private async simulatePaymentFailed(payment: any): Promise<void> {
    await paymentService.updatePayment(payment.id, {
      status: PaymentStatus.FAILED,
      failure_message: 'Payment failed (simulated in SANDBOX MODE)',
      failure_code: 'card_declined',
    });
  }

  /**
   * Simulate payment_intent.canceled event
   */
  private async simulatePaymentCanceled(payment: any): Promise<void> {
    await paymentService.updatePaymentStatus(
      payment.id,
      PaymentStatus.CANCELLED,
      'system',
      'Payment canceled via simulated webhook (SANDBOX MODE)'
    );
  }

  /**
   * Sleep helper
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

export const webhookSimulatorService = new WebhookSimulatorService();









