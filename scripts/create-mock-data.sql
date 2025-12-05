-- Mock Data Script for Order/Payment Matching
-- Run with: docker exec -i order-hub-db psql -U order_hub_user -d order_hub < scripts/create-mock-data.sql

-- Clean up existing mock data first
DELETE FROM payments WHERE order_id IN (SELECT id FROM orders WHERE source_order_id LIKE '%MOCK%');
DELETE FROM order_items WHERE order_id IN (SELECT id FROM orders WHERE source_order_id LIKE '%MOCK%');
DELETE FROM orders WHERE source_order_id LIKE '%MOCK%';

BEGIN;

-- Order 1: Pending order with pending payment
INSERT INTO orders (id, source, source_order_id, status, currency, subtotal, tax_total, shipping_total, discount_total, grand_total, totals, metadata, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'woocommerce',
  'WOO-MOCK-001',
  'pending',
  'EUR',
  228.00,
  43.32,
  0,
  10.00,
  261.32,
  '{"subtotal": 228.00, "tax_total": 43.32, "shipping_total": 0, "discount_total": 10.00, "grand_total": 261.32}',
  '{"customer_email": "test1@example.com", "customer_name": "Max Mustermann"}',
  NOW(),
  NOW()
);

INSERT INTO order_items (order_id, name, sku, quantity, unit_price, tax_rate, tax_amount, total_price, created_at, updated_at)
SELECT 
  id,
  'Premium WordPress Theme',
  'THEME-001',
  1,
  79.00,
  0.19,
  15.01,
  94.01,
  NOW(),
  NOW()
FROM orders WHERE source_order_id = 'WOO-MOCK-001'
UNION ALL
SELECT 
  id,
  'Support Package (1 Year)',
  'SUPPORT-YEAR',
  1,
  149.00,
  0.19,
  28.31,
  177.31,
  NOW(),
  NOW()
FROM orders WHERE source_order_id = 'WOO-MOCK-001';

INSERT INTO payments (order_id, provider, payment_method, status, amount, currency, refunded_amount, metadata, created_at, updated_at)
SELECT 
  id,
  'stripe',
  'card',
  'pending',
  261.32,
  'EUR',
  0,
  '{}',
  NOW(),
  NOW()
FROM orders WHERE source_order_id = 'WOO-MOCK-001';

-- Order 2: Paid order with succeeded payment
INSERT INTO orders (id, source, source_order_id, status, currency, subtotal, tax_total, shipping_total, discount_total, grand_total, totals, metadata, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'pos',
  'POS-MOCK-001',
  'paid',
  'EUR',
  134.70,
  25.59,
  5.90,
  0,
  166.19,
  '{"subtotal": 134.70, "tax_total": 25.59, "shipping_total": 5.90, "discount_total": 0, "grand_total": 166.19}',
  '{"store_location": "Hamburg", "cashier": "Sarah M."}',
  NOW(),
  NOW()
);

INSERT INTO order_items (order_id, name, sku, quantity, unit_price, tax_rate, tax_amount, total_price, created_at, updated_at)
SELECT 
  id,
  'Yoga Mat Premium',
  'YOGA-MAT-001',
  2,
  49.90,
  0.19,
  18.96,
  118.76,
  NOW(),
  NOW()
FROM orders WHERE source_order_id = 'POS-MOCK-001'
UNION ALL
SELECT 
  id,
  'Meditation Cushion',
  'CUSH-001',
  1,
  34.90,
  0.19,
  6.63,
  41.53,
  NOW(),
  NOW()
FROM orders WHERE source_order_id = 'POS-MOCK-001';

INSERT INTO payments (order_id, provider, payment_method, status, amount, currency, refunded_amount, provider_reference, completed_at, metadata, created_at, updated_at)
SELECT 
  id,
  'btcpay',
  'bitcoin',
  'succeeded',
  166.19,
  'EUR',
  0,
  'btcpay_inv_mock_123',
  NOW(),
  '{}',
  NOW(),
  NOW()
FROM orders WHERE source_order_id = 'POS-MOCK-001';

-- Order 3: Order with failed payment
INSERT INTO orders (id, source, source_order_id, status, currency, subtotal, tax_total, shipping_total, discount_total, grand_total, totals, metadata, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'b2b',
  'B2B-MOCK-001',
  'pending',
  'EUR',
  2499.00,
  474.81,
  0,
  249.90,
  2723.91,
  '{"subtotal": 2499.00, "tax_total": 474.81, "shipping_total": 0, "discount_total": 249.90, "grand_total": 2723.91}',
  '{"company": "ACME GmbH", "contract_number": "MOJO-B2B-2024-001"}',
  NOW(),
  NOW()
);

INSERT INTO order_items (order_id, name, sku, quantity, unit_price, tax_rate, tax_amount, total_price, created_at, updated_at)
SELECT 
  id,
  'Bulk License Package (100 Users)',
  'LIC-BULK-100',
  1,
  2499.00,
  0.19,
  474.81,
  2973.81,
  NOW(),
  NOW()
FROM orders WHERE source_order_id = 'B2B-MOCK-001';

INSERT INTO payments (order_id, provider, payment_method, status, amount, currency, refunded_amount, failure_message, failure_code, metadata, created_at, updated_at)
SELECT 
  id,
  'stripe',
  'card',
  'failed',
  2723.91,
  'EUR',
  0,
  'Card declined',
  'card_declined',
  '{}',
  NOW(),
  NOW()
FROM orders WHERE source_order_id = 'B2B-MOCK-001';

-- Order 4: Order with processing payment
INSERT INTO orders (id, source, source_order_id, status, currency, subtotal, tax_total, shipping_total, discount_total, grand_total, totals, metadata, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'woocommerce',
  'WOO-MOCK-002',
  'confirmed',
  'EUR',
  299.00,
  56.81,
  0,
  30.00,
  325.81,
  '{"subtotal": 299.00, "tax_total": 56.81, "shipping_total": 0, "discount_total": 30.00, "grand_total": 325.81}',
  '{"customer_email": "student@example.com"}',
  NOW(),
  NOW()
);

INSERT INTO order_items (order_id, name, sku, quantity, unit_price, tax_rate, tax_amount, total_price, created_at, updated_at)
SELECT 
  id,
  'Online Course Bundle',
  'COURSE-BUNDLE-01',
  1,
  299.00,
  0.19,
  56.81,
  355.81,
  NOW(),
  NOW()
FROM orders WHERE source_order_id = 'WOO-MOCK-002';

INSERT INTO payments (order_id, provider, payment_method, status, amount, currency, refunded_amount, provider_reference, metadata, created_at, updated_at)
SELECT 
  id,
  'stripe',
  'sepa_debit',
  'processing',
  325.81,
  'EUR',
  0,
  'pi_processing_mock_123',
  '{}',
  NOW(),
  NOW()
FROM orders WHERE source_order_id = 'WOO-MOCK-002';

-- Order 5: Order with multiple payments (partial payment)
INSERT INTO orders (id, source, source_order_id, status, currency, subtotal, tax_total, shipping_total, discount_total, grand_total, totals, metadata, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'woocommerce',
  'WOO-MOCK-003',
  'pending',
  'EUR',
  500.00,
  95.00,
  10.00,
  0,
  605.00,
  '{"subtotal": 500.00, "tax_total": 95.00, "shipping_total": 10.00, "discount_total": 0, "grand_total": 605.00}',
  '{"customer_email": "partial@example.com"}',
  NOW(),
  NOW()
);

INSERT INTO order_items (order_id, name, sku, quantity, unit_price, tax_rate, tax_amount, total_price, created_at, updated_at)
SELECT 
  id,
  'Premium Product Bundle',
  'BUNDLE-PREMIUM',
  1,
  500.00,
  0.19,
  95.00,
  595.00,
  NOW(),
  NOW()
FROM orders WHERE source_order_id = 'WOO-MOCK-003';

-- First payment (succeeded, partial)
INSERT INTO payments (order_id, provider, payment_method, status, amount, currency, refunded_amount, provider_reference, completed_at, metadata, created_at, updated_at)
SELECT 
  id,
  'stripe',
  'card',
  'succeeded',
  300.00,
  'EUR',
  0,
  'pi_partial_1',
  NOW(),
  '{}',
  NOW(),
  NOW()
FROM orders WHERE source_order_id = 'WOO-MOCK-003';

-- Second payment (pending, for remaining)
INSERT INTO payments (order_id, provider, payment_method, status, amount, currency, refunded_amount, metadata, created_at, updated_at)
SELECT 
  id,
  'stripe',
  'card',
  'pending',
  305.00,
  'EUR',
  0,
  '{}',
  NOW(),
  NOW()
FROM orders WHERE source_order_id = 'WOO-MOCK-003';

COMMIT;

-- Show summary
SELECT 
  'Orders created: ' || COUNT(*)::text as summary
FROM orders 
WHERE source_order_id LIKE '%MOCK%'
UNION ALL
SELECT 
  'Payments created: ' || COUNT(*)::text as summary
FROM payments 
WHERE order_id IN (SELECT id FROM orders WHERE source_order_id LIKE '%MOCK%');
