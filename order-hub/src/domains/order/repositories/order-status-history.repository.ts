/**
 * Order Status History Repository
 * Data access layer for order_status_history table
 */

import { db } from '../../../infrastructure/database';
import { OrderStatusHistory, CreateOrderStatusHistoryInput } from '../models';

export class OrderStatusHistoryRepository {
  private readonly tableName = 'order_status_history';

  /**
   * Create a new status history entry
   */
  async create(input: CreateOrderStatusHistoryInput): Promise<OrderStatusHistory> {
    const [history] = await db(this.tableName)
      .insert({
        order_id: input.order_id,
        old_status: input.old_status,
        new_status: input.new_status,
        changed_by: input.changed_by,
        change_reason: input.change_reason,
        metadata: input.metadata ? JSON.stringify(input.metadata) : '{}',
      })
      .returning('*');

    return this.mapToHistory(history);
  }

  /**
   * Get complete history for an order
   */
  async getOrderHistory(orderId: string): Promise<OrderStatusHistory[]> {
    const history = await db(this.tableName)
      .where({ order_id: orderId })
      .orderBy('changed_at', 'asc');

    return history.map((h) => this.mapToHistory(h));
  }

  /**
   * Get latest status change for an order
   */
  async getLatestChange(orderId: string): Promise<OrderStatusHistory | null> {
    const history = await db(this.tableName)
      .where({ order_id: orderId })
      .orderBy('changed_at', 'desc')
      .first();

    if (!history) {
      return null;
    }

    return this.mapToHistory(history);
  }

  /**
   * Map database row to OrderStatusHistory interface
   */
  private mapToHistory(row: any): OrderStatusHistory {
    return {
      id: row.id,
      order_id: row.order_id,
      old_status: row.old_status,
      new_status: row.new_status,
      changed_by: row.changed_by,
      change_reason: row.change_reason,
      metadata: typeof row.metadata === 'string' ? JSON.parse(row.metadata) : row.metadata,
      changed_at: new Date(row.changed_at),
    };
  }
}

export const orderStatusHistoryRepository = new OrderStatusHistoryRepository();
