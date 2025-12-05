/**
 * Order Status History Interface
 * Represents a status change record for an order
 */

import { OrderStatus } from './order-status.enum';

export interface OrderStatusHistory {
  id: string;
  order_id: string;
  old_status?: OrderStatus;
  new_status: OrderStatus;
  changed_by: string;
  change_reason?: string;
  metadata?: Record<string, any>;
  changed_at: Date;
}

/**
 * Create Order Status History Input
 */
export interface CreateOrderStatusHistoryInput {
  order_id: string;
  old_status?: OrderStatus;
  new_status: OrderStatus;
  changed_by: string;
  change_reason?: string;
  metadata?: Record<string, any>;
}



