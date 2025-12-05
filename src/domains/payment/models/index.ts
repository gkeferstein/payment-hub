/**
 * Payment Domain Models
 * Export all payment-related types and interfaces
 */

// Enums
export {
  PaymentStatus,
  PaymentProvider,
  PaymentMethod,
  PAYMENT_STATUS_TRANSITIONS,
  isValidPaymentStatusTransition,
} from './payment-status.enum';

// Interfaces
export type {
  Payment,
  CreatePaymentInput,
  UpdatePaymentInput,
} from './payment.interface';

export type {
  PaymentStatusHistory,
  CreatePaymentStatusHistoryInput,
} from './payment-status-history.interface';
