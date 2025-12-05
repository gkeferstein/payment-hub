/**
 * Payment Interface
 * Represents a payment transaction in the system
 */

import { PaymentStatus, PaymentProvider } from './payment-status.enum';

export interface Payment {
  id: string;
  order_id: string;
  provider: PaymentProvider;
  provider_reference?: string;
  payment_method?: string;
  status: PaymentStatus;
  amount: number;
  currency: string;
  refunded_amount: number;
  failure_message?: string;
  failure_code?: string;
  redirect_url?: string;
  success_url?: string;
  cancel_url?: string;
  metadata?: Record<string, any>;
  created_at: Date;
  updated_at: Date;
  completed_at?: Date;
}

/**
 * Create Payment Input
 * Used when creating a new payment
 */
export interface CreatePaymentInput {
  order_id: string;
  provider: PaymentProvider;
  payment_method?: string;
  amount?: number; // Optional, can be calculated from order
  currency?: string; // Optional, can be taken from order
  success_url?: string;
  cancel_url?: string;
  metadata?: Record<string, any>;
}

/**
 * Update Payment Input
 * Used when updating a payment (usually from webhook)
 */
export interface UpdatePaymentInput {
  status?: PaymentStatus;
  provider_reference?: string;
  redirect_url?: string;
  failure_message?: string;
  failure_code?: string;
  completed_at?: Date;
  metadata?: Record<string, any>;
}





