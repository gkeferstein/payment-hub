/**
 * Payment Service
 * Business logic layer for payment operations
 * Handles validation, status transitions, and history tracking
 */

import { paymentRepository, paymentStatusHistoryRepository } from '../repositories';
import { orderRepository } from '../../order/repositories';
import {
  Payment,
  PaymentStatus,
  PaymentProvider,
  PaymentMethod,
  CreatePaymentInput,
  UpdatePaymentInput,
  isValidPaymentStatusTransition,
} from '../models';
import { StripeTerminalAdapter } from '../../../adapters/stripe/stripe-terminal.adapter';

export class PaymentService {
  /**
   * Create a new payment
   * - Validates input
   * - Validates order exists
   * - Calculates amount from order if not provided
   * - Creates payment
   */
  async createPayment(input: CreatePaymentInput): Promise<Payment> {
    this.validateCreatePaymentInput(input);

    const order = await orderRepository.findById(input.order_id);
    if (!order) {
      throw new Error(`Order ${input.order_id} not found`);
    }

    const amount = input.amount || order.grand_total;
    const currency = input.currency || order.currency;

    const payment = await paymentRepository.create({
      ...input,
      amount,
      currency,
    });

    return payment;
  }

  /**
   * Get payment by ID
   */
  async getPaymentById(id: string): Promise<Payment | null> {
    return await paymentRepository.findById(id);
  }

  /**
   * Get all payments for an order
   */
  async getPaymentsByOrderId(orderId: string): Promise<Payment[]> {
    return await paymentRepository.findByOrderId(orderId);
  }

  /**
   * Update payment status
   * - Validates status transition
   * - Updates payment
   * - Logs to history
   */
  async updatePaymentStatus(
    paymentId: string,
    newStatus: PaymentStatus,
    changedBy: string = 'system',
    reason?: string
  ): Promise<void> {
    const payment = await paymentRepository.findById(paymentId);
    if (!payment) {
      throw new Error(`Payment ${paymentId} not found`);
    }

    if (!isValidPaymentStatusTransition(payment.status, newStatus)) {
      throw new Error(`Invalid status transition from ${payment.status} to ${newStatus}`);
    }

    await paymentRepository.updateStatus(paymentId, newStatus);

    if (reason) {
      await paymentStatusHistoryRepository.create({
        payment_id: paymentId,
        old_status: payment.status,
        new_status: newStatus,
        changed_by: changedBy,
        change_reason: reason,
        provider: payment.provider,
        provider_reference: payment.provider_reference,
      });
    }
  }

  /**
   * Update payment
   */
  async updatePayment(paymentId: string, input: UpdatePaymentInput): Promise<Payment | null> {
    return await paymentRepository.update(paymentId, input);
  }

  /**
   * Get payment history
   */
  async getPaymentHistory(paymentId: string) {
    return await paymentStatusHistoryRepository.findByPaymentId(paymentId);
  }

  /**
   * Get payments by status
   */
  async getPaymentsByStatus(status: PaymentStatus, limit: number = 100): Promise<Payment[]> {
    return await paymentRepository.findByStatus(status, limit);
  }

  /**
   * Create a terminal payment
   * - Validates order exists
   * - Creates Stripe Terminal Payment Intent
   * - Generates connection token
   * - Creates payment record in database
   */
  async createTerminalPayment(input: {
    order_id: string;
    amount: number;
    currency: string;
    location_id?: string;
    reader_id?: string;
    metadata?: Record<string, any>;
  }): Promise<Payment> {
    // Validate order exists
    const order = await orderRepository.findById(input.order_id);
    if (!order) {
      throw new Error(`Order ${input.order_id} not found`);
    }

    // Validate amount
    if (input.amount <= 0) {
      throw new Error('amount must be greater than 0');
    }

    // Get Stripe API key
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const stripeApiKey = (process as any).env?.STRIPE_SECRET_KEY;
    if (!stripeApiKey) {
      throw new Error('STRIPE_SECRET_KEY environment variable is not set');
    }

    // Create Stripe Terminal adapter
    const terminalAdapter = new StripeTerminalAdapter(stripeApiKey);

    // Create Terminal Payment Intent
    const terminalResponse = await terminalAdapter.createTerminalPaymentIntent({
      order_id: input.order_id,
      amount: input.amount,
      currency: input.currency,
      location_id: input.location_id,
      reader_id: input.reader_id,
      metadata: {
        ...input.metadata,
        source: 'pos',
        payment_method_type: 'terminal',
      },
    });

    // Create payment record
    const payment = await paymentRepository.create({
      order_id: input.order_id,
      provider: PaymentProvider.STRIPE,
      payment_method: PaymentMethod.TERMINAL_CARD, // Default, can be changed based on actual collection
      amount: input.amount,
      currency: input.currency,
      metadata: {
        ...input.metadata,
        terminal_location_id: input.location_id,
        terminal_reader_id: input.reader_id,
        connection_token: terminalResponse.connection_token,
        connection_token_expires_at: terminalResponse.expires_at.toString(),
        payment_method_type: 'terminal',
      },
    });

    // Update payment with provider_reference (after creation, since it's not in CreatePaymentInput)
    const updatedPayment = await paymentRepository.update(payment.id, {
      provider_reference: terminalResponse.payment_intent_id,
    });

    return updatedPayment || payment;

    return payment;
  }

  /**
   * Get payment summary for an order
   * Returns aggregated payment statistics
   */
  async getPaymentSummaryForOrder(orderId: string): Promise<{
    total_paid: number;
    total_refunded: number;
    payment_count: number;
    has_successful_payment: boolean;
    payments: Payment[];
  }> {
    const payments = await paymentRepository.findByOrderId(orderId);
    
    const successfulPayments = payments.filter((p) => p.status === PaymentStatus.SUCCEEDED);
    const refundedPayments = payments.filter(
      (p) => p.status === PaymentStatus.REFUNDED || p.refunded_amount > 0
    );

    const totalPaid = successfulPayments.reduce((sum, p) => sum + p.amount, 0);
    const totalRefunded = refundedPayments.reduce((sum, p) => sum + p.refunded_amount, 0);

    return {
      total_paid: totalPaid,
      total_refunded: totalRefunded,
      payment_count: payments.length,
      has_successful_payment: successfulPayments.length > 0,
      payments,
    };
  }

  /**
   * Validate create payment input
   */
  private validateCreatePaymentInput(input: CreatePaymentInput): void {
    if (!input.order_id) {
      throw new Error('order_id is required');
    }
    if (!input.provider) {
      throw new Error('provider is required');
    }
    if (input.amount !== undefined && input.amount <= 0) {
      throw new Error('amount must be greater than 0');
    }
  }
}

export const paymentService = new PaymentService();
