/**
 * Order Interface
 * Represents a complete order in the system
 */

import { OrderStatus } from './order-status.enum';
import { CreateOrderItemInput, OrderItem } from './order-item.interface';

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
  totals: OrderTotals;
  metadata: Record<string, any>;
  created_at: Date;
  updated_at: Date;
}

export interface OrderWithItems extends Order {
  items: OrderItem[];
}

export interface OrderTotals {
  subtotal: number;
  tax_total: number;
  shipping_total: number;
  discount_total: number;
  grand_total: number;
}

/**
 * Create Order Input
 * Used when creating a new order
 */
export interface CreateOrderInput {
  customer_id?: string;
  source: string;
  source_order_id: string;
  currency?: string;
  items: CreateOrderItemInput[];
  shipping_total?: number;
  discount_total?: number;
  metadata?: Record<string, any>;
}

/**
 * Update Order Input
 */
export interface UpdateOrderInput {
  status?: OrderStatus;
  metadata?: Record<string, any>;
}

/**
 * Calculate order totals from items
 */
export function calculateOrderTotals(
  items: CreateOrderItemInput[],
  shipping_total: number = 0,
  discount_total: number = 0
): OrderTotals {
  const subtotal = items.reduce((sum, item) => {
    return sum + (item.quantity * item.unit_price);
  }, 0);

  const tax_total = items.reduce((sum, item) => {
    const taxRate = item.tax_rate || 0;
    const itemTotal = item.quantity * item.unit_price;
    return sum + (itemTotal * (taxRate / 100));
  }, 0);

  const grand_total = subtotal + tax_total + shipping_total - discount_total;

  return {
    subtotal,
    tax_total,
    shipping_total,
    discount_total,
    grand_total,
  };
}
