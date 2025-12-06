/**
 * Stripe Mock Adapter
 * Simulates Stripe API calls without making real requests
 * Used in sandbox/test mode to avoid real payments
 */

import {
  TerminalConnectionTokenResponse,
  TerminalPaymentIntentResponse,
  CreateTerminalPaymentIntentInput,
} from './stripe-terminal.adapter';

export class StripeMockAdapter {
  /**
   * Create a mock connection token for Terminal SDK
   * Returns a fake token that looks valid but won't work with real Stripe
   */
  async createConnectionToken(locationId?: string): Promise<TerminalConnectionTokenResponse> {
    console.log('[SANDBOX] Creating mock Stripe connection token', { locationId });
    
    // Generate a fake token that looks like a real Stripe token
    const fakeToken = `pst_test_mock_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    
    return {
      secret: fakeToken,
      expires_at: Date.now() + 5 * 60 * 1000, // 5 minutes from now
    };
  }

  /**
   * Create a mock Payment Intent for Terminal payments
   * Returns a fake payment intent ID that can be used for testing
   */
  async createTerminalPaymentIntent(
    input: CreateTerminalPaymentIntentInput
  ): Promise<TerminalPaymentIntentResponse> {
    console.log('[SANDBOX] Creating mock Stripe Terminal Payment Intent', {
      order_id: input.order_id,
      amount: input.amount,
      currency: input.currency,
    });

    // Generate a fake payment intent ID that looks like a real Stripe ID
    const fakePaymentIntentId = `pi_mock_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    
    // Create mock connection token
    const connectionToken = await this.createConnectionToken(input.location_id);

    return {
      payment_intent_id: fakePaymentIntentId,
      connection_token: connectionToken.secret,
      expires_at: connectionToken.expires_at,
    };
  }

  /**
   * Get mock Payment Intent status
   * In sandbox mode, returns a simulated status
   */
  async getPaymentIntentStatus(paymentIntentId: string): Promise<{
    status: string;
    amount: number;
    currency: string;
    metadata: Record<string, string>;
  }> {
    console.log('[SANDBOX] Getting mock Payment Intent status', { paymentIntentId });
    
    // Return a mock status - in real testing, you might want to track this
    return {
      status: 'requires_payment_method', // Default status for new payment intents
      amount: 0,
      currency: 'eur',
      metadata: {},
    };
  }

  /**
   * Cancel a mock Payment Intent
   * In sandbox mode, just logs the action
   */
  async cancelPaymentIntent(paymentIntentId: string): Promise<void> {
    console.log('[SANDBOX] Canceling mock Payment Intent', { paymentIntentId });
    // No-op in sandbox mode
  }

  /**
   * Capture a mock Payment Intent
   * In sandbox mode, just logs the action
   */
  async capturePaymentIntent(paymentIntentId: string, amount?: number): Promise<void> {
    console.log('[SANDBOX] Capturing mock Payment Intent', { paymentIntentId, amount });
    // No-op in sandbox mode
  }
}









