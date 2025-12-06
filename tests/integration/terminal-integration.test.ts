/**
 * Integration Test: Stripe Terminal Integration
 * Tests Terminal payment flow: Payment Intent creation, Webhook handling
 */

import { orderService } from '../../src/domains/order/services';
import { paymentService } from '../../src/domains/payment/services';
import { OrderStatus, CreateOrderInput } from '../../src/domains/order/models';
import { PaymentProvider, PaymentMethod, PaymentStatus } from '../../src/domains/payment/models';
import { db } from '../../src/infrastructure/database';

describe('Stripe Terminal Integration', () => {
  let testOrderId: string;

  beforeAll(async () => {
    // Setup: Create a test order
    const orderInput: CreateOrderInput = {
      source: 'pos',
      source_order_id: 'POS-TERMINAL-TEST-001',
      currency: 'EUR',
      items: [
        {
          name: 'Test Product Terminal',
          sku: 'TEST-TERMINAL-001',
          quantity: 1,
          unit_price: 50.0,
          tax_rate: 0.19,
        },
      ],
      shipping_total: 0,
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

  describe('Terminal Payment Creation', () => {
    test('should create terminal payment with Payment Intent', async () => {
      // Skip if Stripe API key is not configured
      if (!process.env.STRIPE_SECRET_KEY) {
        console.log('Skipping test: STRIPE_SECRET_KEY not configured');
        return;
      }

      const payment = await paymentService.createTerminalPayment({
        order_id: testOrderId,
        amount: 59.50,
        currency: 'EUR',
        location_id: 'tml_test_location',
        reader_id: 'tmr_test_reader',
      });

      expect(payment).toBeDefined();
      expect(payment.order_id).toBe(testOrderId);
      expect(payment.provider).toBe(PaymentProvider.STRIPE);
      expect(payment.payment_method).toBe(PaymentMethod.TERMINAL_CARD);
      expect(payment.status).toBe(PaymentStatus.PENDING);
      expect(payment.provider_reference).toBeDefined();
      expect(payment.provider_reference).toMatch(/^pi_/); // Stripe Payment Intent ID format
      expect(payment.metadata?.connection_token).toBeDefined();
      expect(payment.metadata?.terminal_location_id).toBe('tml_test_location');
      expect(payment.metadata?.terminal_reader_id).toBe('tmr_test_reader');
    });

    test('should fail if order does not exist', async () => {
      await expect(
        paymentService.createTerminalPayment({
          order_id: '00000000-0000-0000-0000-000000000000',
          amount: 100.0,
          currency: 'EUR',
        })
      ).rejects.toThrow('Order');
    });

    test('should fail if Stripe API key is not configured', async () => {
      const originalKey = process.env.STRIPE_SECRET_KEY;
      delete (process.env as any).STRIPE_SECRET_KEY;

      await expect(
        paymentService.createTerminalPayment({
          order_id: testOrderId,
          amount: 100.0,
          currency: 'EUR',
        })
      ).rejects.toThrow('STRIPE_SECRET_KEY');

      if (originalKey) {
        process.env.STRIPE_SECRET_KEY = originalKey;
      }
    });
  });

  describe('Terminal Payment Metadata', () => {
    test('should store connection token in metadata', async () => {
      if (!process.env.STRIPE_SECRET_KEY) {
        console.log('Skipping test: STRIPE_SECRET_KEY not configured');
        return;
      }

      const payment = await paymentService.createTerminalPayment({
        order_id: testOrderId,
        amount: 25.0,
        currency: 'EUR',
      });

      expect(payment.metadata?.connection_token).toBeDefined();
      expect(payment.metadata?.connection_token_expires_at).toBeDefined();
      expect(payment.metadata?.payment_method_type).toBe('terminal');
    });
  });

  describe('Terminal Payment Status Updates', () => {
    test('should update payment status when webhook received', async () => {
      if (!process.env.STRIPE_SECRET_KEY) {
        console.log('Skipping test: STRIPE_SECRET_KEY not configured');
        return;
      }

      // Create terminal payment
      const payment = await paymentService.createTerminalPayment({
        order_id: testOrderId,
        amount: 30.0,
        currency: 'EUR',
      });

      // Simulate webhook: payment_intent.succeeded
      // Note: In real scenario, this would come from Stripe webhook
      await paymentService.updatePaymentStatus(
        payment.id,
        PaymentStatus.SUCCEEDED,
        'system',
        'Terminal payment succeeded via webhook'
      );

      const updatedPayment = await paymentService.getPaymentById(payment.id);
      expect(updatedPayment?.status).toBe(PaymentStatus.SUCCEEDED);
    });
  });
});










