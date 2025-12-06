/**
 * Configuration Service
 * Centralized configuration management with environment variable support
 */

export class ConfigService {
  /**
   * Check if system is running in sandbox/test mode
   * When true, no real payments are processed and callbacks are only logged
   */
  static isSandboxMode(): boolean {
    return process.env.SANDBOX_MODE === 'true' || process.env.SANDBOX_MODE === '1';
  }

  /**
   * Get Stripe API key (test or live depending on mode)
   */
  static getStripeApiKey(): string | null {
    if (this.isSandboxMode()) {
      // In sandbox mode, use test key if provided, otherwise return null (will use mock)
      return process.env.STRIPE_TEST_SECRET_KEY || null;
    }
    return process.env.STRIPE_SECRET_KEY || null;
  }

  /**
   * Get Stripe webhook secret
   */
  static getStripeWebhookSecret(): string | null {
    if (this.isSandboxMode()) {
      return process.env.STRIPE_TEST_WEBHOOK_SECRET || null;
    }
    return process.env.STRIPE_WEBHOOK_SECRET || null;
  }

  /**
   * Check if callbacks should be sent (false in sandbox mode)
   */
  static shouldSendCallbacks(): boolean {
    return !this.isSandboxMode();
  }
}









