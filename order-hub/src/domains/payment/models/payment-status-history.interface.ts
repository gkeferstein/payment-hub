/**
 * Payment Status History Interface
 * Represents a status change record for a payment
 */

import { PaymentStatus } from './payment-status.enum';

export interface PaymentStatusHistory {
  id: string;
  payment_id: string;
  old_status?: PaymentStatus;
  new_status: PaymentStatus;
  changed_by: string;
  change_reason?: string;
  provider?: string;
  provider_reference?: string;
  metadata?: Record<string, any>;
  changed_at: Date;
}

/**
 * Create Payment Status History Input
 */
export interface CreatePaymentStatusHistoryInput {
  payment_id: string;
  old_status?: PaymentStatus;
  new_status: PaymentStatus;
  changed_by: string;
  change_reason?: string;
  provider?: string;
  provider_reference?: string;
  metadata?: Record<string, any>;
}
