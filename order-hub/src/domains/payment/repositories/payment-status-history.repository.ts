/**
 * Payment Status History Repository
 * Data access layer for payment_status_history table
 */

import { db } from '../../../infrastructure/database';
import { PaymentStatusHistory, CreatePaymentStatusHistoryInput } from '../models';

export class PaymentStatusHistoryRepository {
  private readonly tableName = 'payment_status_history';

  /**
   * Create a new status history entry
   */
  async create(input: CreatePaymentStatusHistoryInput): Promise<PaymentStatusHistory> {
    const [history] = await db(this.tableName)
      .insert({
        payment_id: input.payment_id,
        old_status: input.old_status,
        new_status: input.new_status,
        changed_by: input.changed_by,
        change_reason: input.change_reason,
        provider: input.provider,
        provider_reference: input.provider_reference,
        metadata: input.metadata ? JSON.stringify(input.metadata) : '{}',
        changed_at: new Date(),
      })
      .returning('*');

    return this.mapToHistory(history);
  }

  /**
   * Get complete history for a payment
   */
  async findByPaymentId(paymentId: string): Promise<PaymentStatusHistory[]> {
    const histories = await db(this.tableName)
      .where({ payment_id: paymentId })
      .orderBy('changed_at', 'asc');

    return histories.map((h) => this.mapToHistory(h));
  }

  /**
   * Map database row to PaymentStatusHistory
   */
  private mapToHistory(row: any): PaymentStatusHistory {
    return {
      id: row.id,
      payment_id: row.payment_id,
      old_status: row.old_status,
      new_status: row.new_status,
      changed_by: row.changed_by,
      change_reason: row.change_reason,
      provider: row.provider,
      provider_reference: row.provider_reference,
      metadata: row.metadata ? (typeof row.metadata === 'string' ? JSON.parse(row.metadata) : row.metadata) : {},
      changed_at: row.changed_at,
    };
  }
}

export const paymentStatusHistoryRepository = new PaymentStatusHistoryRepository();
