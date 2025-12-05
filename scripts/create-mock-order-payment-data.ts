/**
 * Script to create mock orders with payments for testing Order/Payment Matching
 * Run with: ts-node scripts/create-mock-order-payment-data.ts
 */

import { db } from '../src/infrastructure/database';
import { OrderStatus } from '../src/domains/order/models';
import { PaymentStatus, PaymentProvider } from '../src/domains/payment/models';

async function createMockData() {
  console.log('🎨 Creating mock orders with payments...\n');

  try {
    // Order 1: Pending order with pending payment
    const [order1] = await db('orders')
      .insert({
        source: 'woocommerce',
        source_order_id: 'WOO-MOCK-001',
        status: OrderStatus.PENDING,
        currency: 'EUR',
        subtotal: 228.00,
        tax_total: 43.32,
        shipping_total: 0,
        discount_total: 10.00,
        grand_total: 261.32,
        totals: JSON.stringify({
          subtotal: 228.00,
          tax_total: 43.32,
          shipping_total: 0,
          discount_total: 10.00,
          grand_total: 261.32,
        }),
        metadata: JSON.stringify({
          customer_email: 'test1@example.com',
          customer_name: 'Max Mustermann',
        }),
      })
      .returning('*');

    await db('order_items').insert([
      {
        order_id: order1.id,
        name: 'Premium WordPress Theme',
        sku: 'THEME-001',
        quantity: 1,
        unit_price: 79.00,
        tax_rate: 19,
        tax_amount: 15.01,
        total_price: 94.01,
      },
      {
        order_id: order1.id,
        name: 'Support Package (1 Year)',
        sku: 'SUPPORT-YEAR',
        quantity: 1,
        unit_price: 149.00,
        tax_rate: 19,
        tax_amount: 28.31,
        total_price: 177.31,
      },
    ]);

    const [payment1] = await db('payments')
      .insert({
        order_id: order1.id,
        provider: PaymentProvider.STRIPE,
        payment_method: 'card',
        status: PaymentStatus.PENDING,
        amount: 261.32,
        currency: 'EUR',
        refunded_amount: 0,
        metadata: JSON.stringify({}),
      })
      .returning('*');

    console.log(`✅ Order 1: ${order1.id} (Pending) - Payment: ${payment1.id} (Pending/Stripe)`);

    // Order 2: Paid order with succeeded payment
    const [order2] = await db('orders')
      .insert({
        source: 'pos',
        source_order_id: 'POS-MOCK-001',
        status: OrderStatus.PAID,
        currency: 'EUR',
        subtotal: 134.70,
        tax_total: 25.59,
        shipping_total: 5.90,
        discount_total: 0,
        grand_total: 166.19,
        totals: JSON.stringify({
          subtotal: 134.70,
          tax_total: 25.59,
          shipping_total: 5.90,
          discount_total: 0,
          grand_total: 166.19,
        }),
        metadata: JSON.stringify({
          store_location: 'Hamburg',
          cashier: 'Sarah M.',
        }),
      })
      .returning('*');

    await db('order_items').insert([
      {
        order_id: order2.id,
        name: 'Yoga Mat Premium',
        sku: 'YOGA-MAT-001',
        quantity: 2,
        unit_price: 49.90,
        tax_rate: 19,
        tax_amount: 18.96,
        total_price: 118.76,
      },
      {
        order_id: order2.id,
        name: 'Meditation Cushion',
        sku: 'CUSH-001',
        quantity: 1,
        unit_price: 34.90,
        tax_rate: 19,
        tax_amount: 6.63,
        total_price: 41.53,
      },
    ]);

    const [payment2] = await db('payments')
      .insert({
        order_id: order2.id,
        provider: PaymentProvider.BTCPAY,
        payment_method: 'bitcoin',
        status: PaymentStatus.SUCCEEDED,
        amount: 166.19,
        currency: 'EUR',
        refunded_amount: 0,
        provider_reference: 'btcpay_inv_mock_123',
        completed_at: new Date(),
        metadata: JSON.stringify({}),
      })
      .returning('*');

    console.log(`✅ Order 2: ${order2.id} (Paid) - Payment: ${payment2.id} (Succeeded/BTCPay)`);

    // Order 3: Order with failed payment
    const [order3] = await db('orders')
      .insert({
        source: 'b2b',
        source_order_id: 'B2B-MOCK-001',
        status: OrderStatus.PENDING,
        currency: 'EUR',
        subtotal: 2499.00,
        tax_total: 474.81,
        shipping_total: 0,
        discount_total: 249.90,
        grand_total: 2723.91,
        totals: JSON.stringify({
          subtotal: 2499.00,
          tax_total: 474.81,
          shipping_total: 0,
          discount_total: 249.90,
          grand_total: 2723.91,
        }),
        metadata: JSON.stringify({
          company: 'ACME GmbH',
          contract_number: 'MOJO-B2B-2024-001',
        }),
      })
      .returning('*');

    await db('order_items').insert([
      {
        order_id: order3.id,
        name: 'Bulk License Package (100 Users)',
        sku: 'LIC-BULK-100',
        quantity: 1,
        unit_price: 2499.00,
        tax_rate: 19,
        tax_amount: 474.81,
        total_price: 2973.81,
      },
    ]);

    const [payment3] = await db('payments')
      .insert({
        order_id: order3.id,
        provider: PaymentProvider.STRIPE,
        payment_method: 'card',
        status: PaymentStatus.FAILED,
        amount: 2723.91,
        currency: 'EUR',
        refunded_amount: 0,
        failure_message: 'Card declined',
        failure_code: 'card_declined',
        metadata: JSON.stringify({}),
      })
      .returning('*');

    console.log(`✅ Order 3: ${order3.id} (Pending) - Payment: ${payment3.id} (Failed/Stripe)`);

    // Order 4: Order with processing payment
    const [order4] = await db('orders')
      .insert({
        source: 'woocommerce',
        source_order_id: 'WOO-MOCK-002',
        status: OrderStatus.CONFIRMED,
        currency: 'EUR',
        subtotal: 299.00,
        tax_total: 56.81,
        shipping_total: 0,
        discount_total: 30.00,
        grand_total: 325.81,
        totals: JSON.stringify({
          subtotal: 299.00,
          tax_total: 56.81,
          shipping_total: 0,
          discount_total: 30.00,
          grand_total: 325.81,
        }),
        metadata: JSON.stringify({
          customer_email: 'student@example.com',
        }),
      })
      .returning('*');

    await db('order_items').insert([
      {
        order_id: order4.id,
        name: 'Online Course Bundle',
        sku: 'COURSE-BUNDLE-01',
        quantity: 1,
        unit_price: 299.00,
        tax_rate: 19,
        tax_amount: 56.81,
        total_price: 355.81,
      },
    ]);

    const [payment4] = await db('payments')
      .insert({
        order_id: order4.id,
        provider: PaymentProvider.STRIPE,
        payment_method: 'sepa_debit',
        status: PaymentStatus.PROCESSING,
        amount: 325.81,
        currency: 'EUR',
        refunded_amount: 0,
        provider_reference: 'pi_processing_mock_123',
        metadata: JSON.stringify({}),
      })
      .returning('*');

    console.log(`✅ Order 4: ${order4.id} (Confirmed) - Payment: ${payment4.id} (Processing/SEPA)`);

    // Order 5: Order with multiple payments (partial payment scenario)
    const [order5] = await db('orders')
      .insert({
        source: 'woocommerce',
        source_order_id: 'WOO-MOCK-003',
        status: OrderStatus.PENDING,
        currency: 'EUR',
        subtotal: 500.00,
        tax_total: 95.00,
        shipping_total: 10.00,
        discount_total: 0,
        grand_total: 605.00,
        totals: JSON.stringify({
          subtotal: 500.00,
          tax_total: 95.00,
          shipping_total: 10.00,
          discount_total: 0,
          grand_total: 605.00,
        }),
        metadata: JSON.stringify({
          customer_email: 'partial@example.com',
        }),
      })
      .returning('*');

    await db('order_items').insert([
      {
        order_id: order5.id,
        name: 'Premium Product Bundle',
        sku: 'BUNDLE-PREMIUM',
        quantity: 1,
        unit_price: 500.00,
        tax_rate: 19,
        tax_amount: 95.00,
        total_price: 595.00,
      },
    ]);

    // First payment (succeeded, partial)
    const [payment5a] = await db('payments')
      .insert({
        order_id: order5.id,
        provider: PaymentProvider.STRIPE,
        payment_method: 'card',
        status: PaymentStatus.SUCCEEDED,
        amount: 300.00,
        currency: 'EUR',
        refunded_amount: 0,
        provider_reference: 'pi_partial_1',
        completed_at: new Date(),
        metadata: JSON.stringify({}),
      })
      .returning('*');

    // Second payment (pending, for remaining)
    const [payment5b] = await db('payments')
      .insert({
        order_id: order5.id,
        provider: PaymentProvider.STRIPE,
        payment_method: 'card',
        status: PaymentStatus.PENDING,
        amount: 305.00,
        currency: 'EUR',
        refunded_amount: 0,
        metadata: JSON.stringify({}),
      })
      .returning('*');

    console.log(`✅ Order 5: ${order5.id} (Pending, Partial Payment)`);
    console.log(`   - Payment 5a: ${payment5a.id} (Succeeded, 300€)`);
    console.log(`   - Payment 5b: ${payment5b.id} (Pending, 305€)`);

    console.log('\n✅ Mock data created successfully!');
    console.log('\n📊 Summary:');
    console.log(`   - 5 Orders created`);
    console.log(`   - 6 Payments created`);
    console.log(`   - All payments linked to orders via FK`);
    console.log('\n🎯 Test the matching in UI:');
    console.log(`   - Open Order ${order2.id} (should show succeeded payment)`);
    console.log(`   - Open Order ${order5.id} (should show 2 payments, partial payment)`);
  } catch (error) {
    console.error('❌ Error creating mock data:', error);
    throw error;
  }
}

// Run script
createMockData()
  .then(() => {
    console.log('\n✅ Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Failed:', error);
    process.exit(1);
  });


