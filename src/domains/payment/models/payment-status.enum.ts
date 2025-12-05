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
 * Payment Method Enum
 * Defines supported payment methods
 */
export enum PaymentMethod {
  // Online methods
  CARD = 'card',
  SEPA_DEBIT = 'sepa_debit',
  BITCOIN = 'bitcoin',
  
  // Terminal methods
  TERMINAL_CARD = 'terminal_card',      // Card inserted/tapped at terminal
  TERMINAL_TAP = 'terminal_tap',         // Contactless payment at terminal
  TERMINAL_MANUAL = 'terminal_manual',   // Manual entry at terminal
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
