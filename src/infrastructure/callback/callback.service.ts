/**
 * Callback Service
 * Sends callbacks to external systems (WooCommerce, POS, B2B)
 * when order or payment status changes
 */

import { Order } from '../../domains/order/models';
import { Payment } from '../../domains/payment/models';
import { ConfigService } from '../config/config.service';
import { ChannelConfigService } from '../config/channel-config.service';
import crypto from 'crypto';

interface CallbackPayload {
  order_id: string;
  source: string;
  source_order_id: string;
  status: string;
  payment?: {
    payment_id: string;
    provider: string;
    status: string;
    amount: number;
  };
  timestamp: string;
}

export class CallbackService {
  /**
   * Send callback when order status changes
   */
  async sendOrderCallback(order: Order, payment?: Payment): Promise<void> {
    // Check if callbacks are enabled for this channel
    if (!(await ChannelConfigService.shouldSendCallbacks(order.source))) {
      console.log(`[CALLBACK] Callbacks disabled for channel ${order.source} (shadow mode or disabled)`);
      return;
    }

    const callbackUrl = this.getCallbackUrl(order.source);
    if (!callbackUrl) {
      console.log(`No callback URL configured for source: ${order.source}`);
      return;
    }

    const payload: CallbackPayload = {
      order_id: order.id,
      source: order.source,
      source_order_id: order.source_order_id,
      status: order.status,
      timestamp: new Date().toISOString(),
    };

    if (payment) {
      payload.payment = {
        payment_id: payment.id,
        provider: payment.provider,
        status: payment.status,
        amount: payment.amount,
      };
    }

    await this.sendCallback(callbackUrl, payload, order.source);
  }

  /**
   * Send callback when payment status changes
   */
  async sendPaymentCallback(payment: Payment, order: Order): Promise<void> {
    // Check if callbacks are enabled for this channel
    if (!(await ChannelConfigService.shouldSendCallbacks(order.source))) {
      console.log(`[CALLBACK] Callbacks disabled for channel ${order.source} (shadow mode or disabled)`);
      return;
    }

    const callbackUrl = this.getCallbackUrl(order.source);
    if (!callbackUrl) {
      console.log(`No callback URL configured for source: ${order.source}`);
      return;
    }

    const payload: CallbackPayload = {
      order_id: order.id,
      source: order.source,
      source_order_id: order.source_order_id,
      status: order.status,
      payment: {
        payment_id: payment.id,
        provider: payment.provider,
        status: payment.status,
        amount: payment.amount,
      },
      timestamp: new Date().toISOString(),
    };

    await this.sendCallback(callbackUrl, payload, order.source);
  }

  /**
   * Send HTTP callback to external system
   */
  private async sendCallback(
    url: string,
    payload: CallbackPayload,
    source: string,
    maxRetries: number = 3
  ): Promise<void> {
    // In sandbox mode, only log callbacks, don't actually send them
    if (!ConfigService.shouldSendCallbacks()) {
      console.log('[SANDBOX] Callback would be sent (not actually sent in sandbox mode):', {
        url,
        source,
        payload,
      });
      return;
    }

    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`Sending callback to ${source} (attempt ${attempt}/${maxRetries})`);

        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 30000);

        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'OrderHub/1.0',
            'X-Order-Hub-Signature': this.generateSignature(payload),
          },
          body: JSON.stringify(payload),
          signal: controller.signal,
        });

        clearTimeout(timeout);

        if (response.ok) {
          console.log(`Callback sent successfully to ${source}`);
          return;
        } else {
          console.error(`Callback failed with status ${response.status}: ${await response.text()}`);
          lastError = new Error(`HTTP ${response.status}`);
        }
      } catch (error: any) {
        console.error(`Callback attempt ${attempt} failed:`, error.message);
        lastError = error;

        if (attempt < maxRetries) {
          const delay = Math.min(1000 * Math.pow(2, attempt - 1), 10000);
          await this.sleep(delay);
        }
      }
    }

    console.error(`Failed to send callback to ${source} after ${maxRetries} attempts:`, lastError);
  }

  /**
   * Get callback URL for a specific source
   */
  private getCallbackUrl(source: string): string | null {
    const envKey = `${source.toUpperCase()}_CALLBACK_URL`;
    return process.env[envKey] || null;
  }

  /**
   * Generate signature for callback payload
   */
  private generateSignature(payload: CallbackPayload): string {
    const secret = process.env.CALLBACK_SECRET || 'default-secret-change-in-production';
    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(JSON.stringify(payload));
    return hmac.digest('hex');
  }

  /**
   * Sleep helper for retry delays
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

export const callbackService = new CallbackService();
