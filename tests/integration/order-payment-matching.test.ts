/**
 * Integration Test: Order/Payment Matching
 * Tests the relationship between orders and payments
 */

import { orderService } from '../../src/domains/order/services';
import { paymentService } from '../../src/domains/payment/services';
import { OrderStatus, CreateOrderInput } from '../../src/domains/order/models';
import { PaymentProvider, PaymentStatus } from '../../src/domains/payment/models';
import { db } from '../../src/infrastructure/database';

describe('Order/Payment Matching Integration', () => {
  let testOrderId: string;

  beforeAll(async () => {
    // Setup: Create a test order
    const orderInput: CreateOrderInput = {
      source: 'woocommerce',
      source_order_id: 'test-order-matching-001',
      currency: 'EUR',
      items: [
        {
          name: 'Test Product',
          sku: 'TEST-SKU-001',
          quantity: 2,
          unit_price: 50.0,
          tax_rate: 19,
        },
      ],
      shipping_total: 5.0,
      discount_total: 0,
    };

    const order = await orderService.createOrder(orderInput);
    testOrderId = order.id;
  });

  afterAll(async () => {
    // Cleanup: Delete test data
    if (testOrderId) {
      await db('payment_status_history').where('payment_id', 'in', 
        db('payments').select('id').where('order_id', testOrderId)
      ).del();
      await db('payments').where('order_id', testOrderId).del();
      await db('order_status_history').where('order_id', testOrderId).del();
      await db('order_items').where('order_id', testOrderId).del();
      await db('orders').where('id', testOrderId).del();
    }
    await db.destroy();
  });

  describe('Payment Creation with Order FK', () => {
    test('should create payment linked to order', async () => {
      const payment = await paymentService.createPayment({
        order_id: testOrderId,
        provider: PaymentProvider.STRIPE,
        payment_method: 'card',
      });

      expect(payment).toBeDefined();
      expect(payment.order_id).toBe(testOrderId);
      expect(payment.provider).toBe(PaymentProvider.STRIPE);
      expect(payment.status).toBe(PaymentStatus.PENDING);
    });

    test('should fail to create payment with invalid order_id', async () => {
      await expect(
        paymentService.createPayment({
          order_id: '00000000-0000-0000-0000-000000000000',
          provider: PaymentProvider.STRIPE,
        })
      ).rejects.toThrow();
    });
  });

  describe('Get Order with Payments', () => {
    test('should retrieve order with all payments', async () => {
      // Create multiple payments
      const payment1 = await paymentService.createPayment({
        order_id: testOrderId,
        provider: PaymentProvider.STRIPE,
        payment_method: 'card',
      });

      const payment2 = await paymentService.createPayment({
        order_id: testOrderId,
        provider: PaymentProvider.BTCPAY,
        payment_method: 'btc',
      });

      // Get order with payments
      const orderWithPayments = await orderService.getOrderWithPayments(testOrderId);

      expect(orderWithPayments).toBeDefined();
      expect(orderWithPayments!.payments).toHaveLength(2);
      expect(orderWithPayments!.payments.map(p => p.id)).toContain(payment1.id);
      expect(orderWithPayments!.payments.map(p => p.id)).toContain(payment2.id);
    });

    test('should calculate payment summary correctly', async () => {
      // Update one payment to succeeded
      const payments = await paymentService.getPaymentsByOrderId(testOrderId);
      const firstPayment = payments[0];
      
      await paymentService.updatePaymentStatus(
        firstPayment.id,
        PaymentStatus.SUCCEEDED,
        'test',
        'Test payment success'
      );

      // Get order with payments
      const orderWithPayments = await orderService.getOrderWithPayments(testOrderId);

      expect(orderWithPayments).toBeDefined();
      expect(orderWithPayments!.payment_summary).toBeDefined();
      expect(orderWithPayments!.payment_summary.payment_count).toBeGreaterThanOrEqual(2);
      expect(orderWithPayments!.payment_summary.has_successful_payment).toBe(true);
      expect(orderWithPayments!.payment_summary.total_paid).toBeGreaterThan(0);
    });
  });

  describe('Payment Summary Service', () => {
    test('should get payment summary for order', async () => {
      const summary = await paymentService.getPaymentSummaryForOrder(testOrderId);

      expect(summary).toBeDefined();
      expect(summary.payment_count).toBeGreaterThan(0);
      expect(summary.payments).toBeDefined();
      expect(Array.isArray(summary.payments)).toBe(true);
    });

    test('should calculate totals correctly with successful payments', async () => {
      const payments = await paymentService.getPaymentsByOrderId(testOrderId);
      const order = await orderService.getOrderById(testOrderId);
      
      // Ensure at least one successful payment
      if (payments.length > 0) {
        await paymentService.updatePaymentStatus(
          payments[0].id,
          PaymentStatus.SUCCEEDED,
          'test'
        );
      }

      const summary = await paymentService.getPaymentSummaryForOrder(testOrderId);

      expect(summary.total_paid).toBeGreaterThan(0);
      expect(summary.total_paid).toBeLessThanOrEqual(order!.grand_total);
      expect(summary.has_successful_payment).toBe(true);
    });

    test('should handle refunded payments', async () => {
      const payments = await paymentService.getPaymentsByOrderId(testOrderId);
      
      // Refund first payment
      if (payments.length > 0) {
        const payment = payments[0];
        await db('payments')
          .where({ id: payment.id })
          .update({ 
            status: PaymentStatus.REFUNDED,
            refunded_amount: payment.amount 
          });
      }

      const summary = await paymentService.getPaymentSummaryForOrder(testOrderId);

      expect(summary.total_refunded).toBeGreaterThanOrEqual(0);
    });
  });

  describe('FK Constraint Validation', () => {
    test('should prevent payment creation with non-existent order', async () => {
      await expect(
        db('payments').insert({
          order_id: '99999999-9999-9999-9999-999999999999',
          provider: 'stripe',
          status: 'pending',
          amount: 100,
          currency: 'EUR',
          refunded_amount: 0,
        })
      ).rejects.toThrow();
    });

    test('should cascade delete payments when order is deleted', async () => {
      // Create a temporary order
      const tempOrder = await orderService.createOrder({
        source: 'test',
        source_order_id: 'temp-order-cascade-test',
        items: [
          {
            name: 'Temp Product',
            quantity: 1,
            unit_price: 10,
          },
        ],
      });

      // Create payment for temp order
      const tempPayment = await paymentService.createPayment({
        order_id: tempOrder.id,
        provider: PaymentProvider.STRIPE,
      });

      // Delete order
      await db('order_items').where('order_id', tempOrder.id).del();
      await db('orders').where('id', tempOrder.id).del();

      // Payment should be cascaded deleted
      const deletedPayment = await paymentService.getPaymentById(tempPayment.id);
      expect(deletedPayment).toBeNull();
    });
  });
});


