/**
 * Stripe Terminal Adapter
 * Handles Stripe Terminal-specific operations:
 * - Connection Token generation
 * - Terminal Payment Intent creation
 * - Terminal-specific payment processing
 */

import Stripe from 'stripe';

export interface TerminalConnectionTokenResponse {
  secret: string;
  expires_at: number;
}

export interface TerminalPaymentIntentResponse {
  payment_intent_id: string;
  connection_token: string;
  expires_at: number;
}

export interface CreateTerminalPaymentIntentInput {
  order_id: string;
  amount: number;
  currency: string;
  location_id?: string;
  reader_id?: string;
  metadata?: Record<string, any>;
}

export class StripeTerminalAdapter {
  private stripe: Stripe;

  constructor(apiKey: string) {
    this.stripe = new Stripe(apiKey, {
      apiVersion: '2024-12-18.acacia',
    });
  }

  /**
   * Create a connection token for Terminal SDK
   * Connection tokens are short-lived (5-10 minutes) and used to authenticate
   * the Terminal SDK with Stripe's servers.
   */
  async createConnectionToken(locationId?: string): Promise<TerminalConnectionTokenResponse> {
    try {
      const params: Stripe.Terminal.ConnectionTokenCreateParams = {};

      // If location_id is provided, restrict token to that location
      if (locationId) {
        params.location = locationId;
      }

      const connectionToken = await this.stripe.terminal.connectionTokens.create(params);

      return {
        secret: connectionToken.secret,
        expires_at: Date.now() + 5 * 60 * 1000, // 5 minutes from now
      };
    } catch (error: any) {
      throw new Error(`Failed to create connection token: ${error.message}`);
    }
  }

  /**
   * Create a Payment Intent specifically for Terminal payments
   * Terminal Payment Intents use 'card_present' payment method type
   * and 'manual' capture method (recommended for Terminal)
   */
  async createTerminalPaymentIntent(
    input: CreateTerminalPaymentIntentInput
  ): Promise<TerminalPaymentIntentResponse> {
    try {
      // Create Payment Intent with Terminal-specific settings
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: Math.round(input.amount * 100), // Convert to cents
        currency: input.currency.toLowerCase(),
        payment_method_types: ['card_present'],
        capture_method: 'manual', // Recommended for Terminal - allows review before capture
        metadata: {
          order_id: input.order_id,
          source: 'pos',
          terminal_location_id: input.location_id || '',
          terminal_reader_id: input.reader_id || '',
          ...input.metadata,
        },
      });

      // Generate connection token for this payment
      const connectionToken = await this.createConnectionToken(input.location_id);

      return {
        payment_intent_id: paymentIntent.id,
        connection_token: connectionToken.secret,
        expires_at: connectionToken.expires_at,
      };
    } catch (error: any) {
      throw new Error(`Failed to create terminal payment intent: ${error.message}`);
    }
  }

  /**
   * Get Payment Intent status
   * Useful for checking payment status after Terminal collection
   */
  async getPaymentIntentStatus(paymentIntentId: string): Promise<{
    status: string;
    amount: number;
    currency: string;
    metadata: Record<string, string>;
  }> {
    try {
      const paymentIntent = await this.stripe.paymentIntents.retrieve(paymentIntentId);

      return {
        status: paymentIntent.status,
        amount: paymentIntent.amount / 100, // Convert from cents
        currency: paymentIntent.currency,
        metadata: paymentIntent.metadata as Record<string, string>,
      };
    } catch (error: any) {
      throw new Error(`Failed to retrieve payment intent: ${error.message}`);
    }
  }

  /**
   * Cancel a Payment Intent
   * Useful if payment collection is cancelled at Terminal
   */
  async cancelPaymentIntent(paymentIntentId: string): Promise<void> {
    try {
      await this.stripe.paymentIntents.cancel(paymentIntentId);
    } catch (error: any) {
      throw new Error(`Failed to cancel payment intent: ${error.message}`);
    }
  }

  /**
   * Capture a Payment Intent
   * Terminal payments are created with 'manual' capture, so they need
   * to be explicitly captured after successful collection
   */
  async capturePaymentIntent(paymentIntentId: string, amount?: number): Promise<void> {
    try {
      const params: Stripe.PaymentIntentCaptureParams = {};
      if (amount) {
        params.amount_to_capture = Math.round(amount * 100);
      }

      await this.stripe.paymentIntents.capture(paymentIntentId, params);
    } catch (error: any) {
      throw new Error(`Failed to capture payment intent: ${error.message}`);
    }
  }
}

