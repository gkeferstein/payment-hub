/**
 * Terminal API Types
 * Type definitions for Stripe Terminal endpoints
 */

export interface CreateConnectionTokenRequest {
  location_id?: string;
}

export interface CreateConnectionTokenResponse {
  success: boolean;
  data: {
    secret: string;
    expires_at: number;
  };
}

export interface CreateTerminalPaymentIntentRequest {
  order_id: string;
  amount?: number; // Optional, can be calculated from order
  currency?: string; // Optional, defaults to order currency
  location_id?: string;
  reader_id?: string;
  metadata?: Record<string, any>;
}

export interface CreateTerminalPaymentIntentResponse {
  success: boolean;
  data: {
    payment_id: string; // HUB payment ID
    payment_intent_id: string; // Stripe Payment Intent ID
    connection_token: string;
    expires_at: number;
  };
}

export interface TerminalPaymentStatusResponse {
  success: boolean;
  data: {
    payment_id: string;
    payment_intent_id: string;
    status: string;
    amount: number;
    currency: string;
  };
}










