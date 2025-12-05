/**
 * Type definitions for Order Hub Admin
 * Matches the API types from Order Hub
 */

export interface Order {
  id: string;
  customer_id?: string;
  source: string;
  source_order_id: string;
  status: OrderStatus;
  currency: string;
  subtotal: number;
  tax_total: number;
  shipping_total: number;
  discount_total: number;
  grand_total: number;
  totals?: Record<string, any>;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
  items?: OrderItem[];
}

export interface OrderWithPayments extends Order {
  payments: Payment[];
  payment_summary: PaymentSummary;
}

export interface PaymentSummary {
  total_paid: number;
  total_refunded: number;
  payment_count: number;
  has_successful_payment: boolean;
  remaining_amount: number;
}

export interface OrderItem {
  id: string;
  order_id: string;
  name: string;
  sku?: string;
  description?: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  tax_rate: number;
  tax_amount: number;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

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
  created_at: string;
  updated_at: string;
  completed_at?: string;
}

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'paid'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'refunded';

export type PaymentStatus =
  | 'pending'
  | 'processing'
  | 'requires_action'
  | 'succeeded'
  | 'failed'
  | 'cancelled'
  | 'refunded';

export type PaymentProvider = 'stripe' | 'btcpay' | 'paypal' | 'sepa' | 'manual';

export interface OrderStatusHistory {
  id: string;
  order_id: string;
  old_status?: OrderStatus;
  new_status: OrderStatus;
  changed_by: string;
  change_reason?: string;
  metadata?: Record<string, any>;
  changed_at: string;
}

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
  changed_at: string;
}




