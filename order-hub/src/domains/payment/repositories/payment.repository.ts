/**
 * Payment Repository
 * Data access layer for payments table
 * Implements Repository Pattern with CRUD operations
 */

import { db } from '../../../infrastructure/database';
import {
  Payment,
  PaymentStatus,
  PaymentProvider,
  CreatePaymentInput,
  UpdatePaymentInput,
} from '../models';

export class PaymentRepository {
  private readonly tableName = 'payments';

  /**
   * Create a new payment
   */
  async create(input: CreatePaymentInput): Promise<Payment> {
    const [payment] = await db(this.tableName)
      .insert({
        order_id: input.order_id,
        provider: input.provider,
        payment_method: input.payment_method,
        status: PaymentStatus.PENDING,
        amount: input.amount,
        currency: input.currency || 'EUR',
        refunded_amount: 0,
        success_url: input.success_url,
        cancel_url: input.cancel_url,
        metadata: input.metadata ? JSON.stringify(input.metadata) : '{}',
      })
      .returning('*');

    return this.mapToPayment(payment);
  }

  /**
   * Find payment by ID
   */
  async findById(id: string): Promise<Payment | null> {
    const payment = await db(this.tableName).where({ id }).first();
    if (!payment) {
      return null;
    }
    return this.mapToPayment(payment);
  }

  /**
   * Find payment by provider reference
   */
  async findByProviderReference(
    provider: PaymentProvider,
    reference: string
  ): Promise<Payment | null> {
    const payment = await db(this.tableName)
      .where({ provider, provider_reference: reference })
      .first();
    if (!payment) {
      return null;
    }
    return this.mapToPayment(payment);
  }

  /**
   * Find all payments for an order
   */
  async findByOrderId(orderId: string): Promise<Payment[]> {
    const payments = await db(this.tableName)
      .where({ order_id: orderId })
      .orderBy('created_at', 'desc');
    return payments.map((p) => this.mapToPayment(p));
  }

  /**
   * Update payment status
   */
  async updateStatus(paymentId: string, newStatus: PaymentStatus): Promise<void> {
    const updateData: any = {
      status: newStatus,
      updated_at: new Date(),
    };

    if (newStatus === PaymentStatus.SUCCEEDED) {
      updateData.completed_at = new Date();
    }

    await db(this.tableName).where({ id: paymentId }).update(updateData);
  }

  /**
   * Update payment
   */
  async update(paymentId: string, input: UpdatePaymentInput): Promise<Payment | null> {
    const updateData: any = {
      updated_at: new Date(),
    };

    if (input.status) {
      updateData.status = input.status;
      if (input.status === PaymentStatus.SUCCEEDED) {
        updateData.completed_at = new Date();
      }
    }

    if (input.provider_reference) updateData.provider_reference = input.provider_reference;
    if (input.redirect_url) updateData.redirect_url = input.redirect_url;
    if (input.failure_message) updateData.failure_message = input.failure_message;
    if (input.failure_code) updateData.failure_code = input.failure_code;
    if (input.completed_at) updateData.completed_at = input.completed_at;
    if (input.metadata) updateData.metadata = JSON.stringify(input.metadata);

    const [payment] = await db(this.tableName)
      .where({ id: paymentId })
      .update(updateData)
      .returning('*');

    if (!payment) {
      return null;
    }

    return this.mapToPayment(payment);
  }

  /**
   * Find payments by status
   */
  async findByStatus(status: PaymentStatus, limit: number = 100): Promise<Payment[]> {
    const payments = await db(this.tableName)
      .where({ status })
      .orderBy('created_at', 'desc')
      .limit(limit);
    return payments.map((p) => this.mapToPayment(p));
  }

  /**
   * Get successful payment for an order
   */
  async findSuccessfulPaymentForOrder(orderId: string): Promise<Payment | null> {
    const payment = await db(this.tableName)
      .where({ order_id: orderId, status: PaymentStatus.SUCCEEDED })
      .first();
    if (!payment) {
      return null;
    }
    return this.mapToPayment(payment);
  }

  /**
   * Check if order has any successful payments
   */
  async hasSuccessfulPayment(orderId: string): Promise<boolean> {
    const count = await db(this.tableName)
      .where({ order_id: orderId, status: PaymentStatus.SUCCEEDED })
      .count('id as count')
      .first();
    return !!(count && parseInt(count.count as string, 10) > 0);
  }

  /**
   * Map database row to Payment interface
   */
  private mapToPayment(row: any): Payment {
    return {
      id: row.id,
      order_id: row.order_id,
      provider: row.provider as PaymentProvider,
      provider_reference: row.provider_reference,
      payment_method: row.payment_method,
      status: row.status as PaymentStatus,
      amount: parseFloat(row.amount),
      currency: row.currency,
      refunded_amount: parseFloat(row.refunded_amount || 0),
      failure_message: row.failure_message,
      failure_code: row.failure_code,
      redirect_url: row.redirect_url,
      success_url: row.success_url,
      cancel_url: row.cancel_url,
      metadata: typeof row.metadata === 'string' ? JSON.parse(row.metadata) : row.metadata,
      created_at: new Date(row.created_at),
      updated_at: new Date(row.updated_at),
      completed_at: row.completed_at ? new Date(row.completed_at) : undefined,
    };
  }
}

export const paymentRepository = new PaymentRepository();
