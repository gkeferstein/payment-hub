/**
 * Webhook Forwarding Service
 * Forwards Stripe webhooks to both Payment Hub AND original channels
 * Allows parallel operation without breaking existing flows
 */

import { paymentService } from '../../domains/payment/services';
import { orderService } from '../../domains/order/services';
import { PaymentStatus } from '../../domains/payment/models';
import { OrderStatus } from '../../domains/order/models';
import { ChannelConfigService } from '../config/channel-config.service';

export interface ForwardedWebhookEvent {
  event_type: string;
  payment_intent_id: string;
  order_id?: string;
  amount: number;
  currency: string;
  metadata?: Record<string, any>;
  timestamp: string;
}

export class WebhookForwardingService {
  /**
   * Forward a Stripe webhook event
   * This processes the webhook in Payment Hub AND forwards to original channel if needed
   */
  async forwardStripeWebhook(event: ForwardedWebhookEvent): Promise<void> {
    const { payment_intent_id, order_id, event_type } = event;

    console.log(`[WEBHOOK-FORWARDING] Processing ${event_type} for payment ${payment_intent_id}`);

    // Try to find order by metadata or payment_intent_id
    let order = null;
    if (order_id) {
      order = await orderService.getOrderById(order_id);
    }

    // If no order found, try to find by payment_intent_id in payments
    if (!order && payment_intent_id) {
      // This would require a query by provider_reference
      // For now, we'll log and continue
      console.log(`[WEBHOOK-FORWARDING] Order not found for payment_intent ${payment_intent_id}`);
    }

    // Process in Payment Hub (if order exists and channel uses Payment Hub)
    if (order) {
      const channelConfig = await ChannelConfigService.getChannelConfig(order.source);
      
      if (channelConfig.shadow_mode) {
        // Shadow mode: Only log, don't update anything
        console.log(`[WEBHOOK-FORWARDING] Shadow mode: Logging webhook for ${order.source}, not updating status`);
        return;
      }

      if (channelConfig.use_payment_hub) {
        // Process in Payment Hub
        await this.processInPaymentHub(event, order);
      }
    }

    // Forward to original channel (if configured)
    // This would typically be done via callback or webhook to the original system
    // For now, we just log it
    console.log(`[WEBHOOK-FORWARDING] Webhook would be forwarded to original channel (if configured)`);
  }

  /**
   * Process webhook in Payment Hub
   */
  private async processInPaymentHub(event: ForwardedWebhookEvent, order: any): Promise<void> {
    const { payment_intent_id, event_type } = event;

    try {
      // Find payment by provider_reference
      const payments = await paymentService.getPaymentsByOrderId(order.id);
      const payment = payments.find((p) => p.provider_reference === payment_intent_id);

      if (!payment) {
        console.log(`[WEBHOOK-FORWARDING] Payment not found for provider_reference: ${payment_intent_id}`);
        return;
      }

      switch (event_type) {
        case 'payment_intent.succeeded':
          await paymentService.updatePaymentStatus(
            payment.id,
            PaymentStatus.SUCCEEDED,
            'system',
            'Payment succeeded via forwarded Stripe webhook'
          );
          await paymentService.updatePayment(payment.id, {
            completed_at: new Date(),
          });

          // Update order status if fully paid
          if (order.status !== OrderStatus.PAID) {
            const summary = await paymentService.getPaymentSummaryForOrder(order.id);
            if (summary.total_paid >= order.grand_total) {
              await orderService.updateOrderStatus(
                order.id,
                OrderStatus.PAID,
                'system',
                'Order fully paid via forwarded webhook'
              );
            }
          }
          break;

        case 'payment_intent.failed':
        case 'payment_intent.payment_failed':
          await paymentService.updatePayment(payment.id, {
            status: PaymentStatus.FAILED,
            failure_message: 'Payment failed via forwarded webhook',
          });
          break;

        case 'payment_intent.canceled':
          await paymentService.updatePaymentStatus(
            payment.id,
            PaymentStatus.CANCELLED,
            'system',
            'Payment canceled via forwarded webhook'
          );
          break;
      }
    } catch (error: any) {
      console.error(`[WEBHOOK-FORWARDING] Error processing in Payment Hub: ${error.message}`);
    }
  }
}

export const webhookForwardingService = new WebhookForwardingService();

