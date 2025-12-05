/**
 * Order Item Interface
 * Represents a single line item in an order
 */

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
  metadata: Record<string, any>;
  created_at: Date;
  updated_at: Date;
}

/**
 * Create Order Item Input
 * Used when creating a new order item
 */
export interface CreateOrderItemInput {
  name: string;
  sku?: string;
  description?: string;
  quantity: number;
  unit_price: number;
  tax_rate?: number;
  metadata?: Record<string, any>;
}

/**
 * Calculate totals for an order item
 */
export function calculateOrderItemTotals(item: CreateOrderItemInput): {
  total_price: number;
  tax_amount: number;
} {
  const taxRate = item.tax_rate || 0;
  const total_price = item.quantity * item.unit_price;
  const tax_amount = total_price * (taxRate / 100);

  return {
    total_price,
    tax_amount,
  };
}
