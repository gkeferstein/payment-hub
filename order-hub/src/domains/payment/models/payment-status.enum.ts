/**
 * Payment Status Enum
 * Defines all possible payment statuses
 */

export enum PaymentStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  REQUIRES_ACTION = 'requires_action',
  SUCCEEDED = 'succeeded',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded',
}

/**
 * Payment Provider Enum
 * Defines supported payment providers
 */
export enum PaymentProvider {
  STRIPE = 'stripe',
  BTCPAY = 'btcpay',
  PAYPAL = 'paypal',
  SEPA = 'sepa',
  MANUAL = 'manual',
}

/**
 * Valid status transitions for payments
 */
export const PAYMENT_STATUS_TRANSITIONS: Record<PaymentStatus, PaymentStatus[]> = {
  [PaymentStatus.PENDING]: [
    PaymentStatus.PROCESSING,
    PaymentStatus.REQUIRES_ACTION,
    PaymentStatus.SUCCEEDED,
    PaymentStatus.FAILED,
    PaymentStatus.CANCELLED,
  ],
  [PaymentStatus.PROCESSING]: [
    PaymentStatus.REQUIRES_ACTION,
    PaymentStatus.SUCCEEDED,
    PaymentStatus.FAILED,
    PaymentStatus.CANCELLED,
  ],
  [PaymentStatus.REQUIRES_ACTION]: [
    PaymentStatus.PROCESSING,
    PaymentStatus.SUCCEEDED,
    PaymentStatus.FAILED,
    PaymentStatus.CANCELLED,
  ],
  [PaymentStatus.SUCCEEDED]: [PaymentStatus.REFUNDED],
  [PaymentStatus.FAILED]: [], // Terminal state
  [PaymentStatus.CANCELLED]: [], // Terminal state
  [PaymentStatus.REFUNDED]: [], // Terminal state
};

/**
 * Check if a status transition is valid
 */
export function isValidPaymentStatusTransition(
  currentStatus: PaymentStatus,
  newStatus: PaymentStatus
): boolean {
  return PAYMENT_STATUS_TRANSITIONS[currentStatus].includes(newStatus);
}
