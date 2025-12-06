/**
 * Migration: Create payments table
 * 
 * Creates the payments table for payment tracking and processing
 * Links payments to orders and tracks provider-specific information
 */

import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('payments', (table) => {
    // Primary key
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));

    // Order reference
    table
      .uuid('order_id')
      .notNullable()
      .references('id')
      .inTable('orders')
      .onDelete('CASCADE');

    // Payment provider information
    table
      .enum('provider', ['stripe', 'btcpay', 'paypal', 'sepa', 'manual'])
      .notNullable();
    
    table.string('provider_reference', 255); // e.g., Stripe Payment Intent ID
    table.string('payment_method', 100); // e.g., 'card', 'sepa_debit', 'btc'

    // Payment status
    table
      .enum('status', [
        'pending',
        'processing',
        'requires_action',
        'succeeded',
        'failed',
        'cancelled',
        'refunded',
      ])
      .notNullable()
      .defaultTo('pending');

    // Amount and currency
    table.decimal('amount', 12, 2).notNullable();
    table.string('currency', 3).notNullable().defaultTo('EUR');

    // Refund information
    table.decimal('refunded_amount', 12, 2).defaultTo(0);

    // Error/failure information
    table.text('failure_message');
    table.string('failure_code', 100);

    // URLs for redirects
    table.text('redirect_url'); // URL to redirect user for payment (e.g., Stripe Checkout)
    table.text('success_url');
    table.text('cancel_url');

    // Additional metadata (provider-specific data)
    table.jsonb('metadata').defaultTo('{}');

    // Timestamps
    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
    table.timestamp('updated_at').notNullable().defaultTo(knex.fn.now());
    table.timestamp('completed_at'); // When payment was completed

    // Indexes
    table.index('order_id', 'idx_payments_order_id');
    table.index('provider', 'idx_payments_provider');
    table.index('provider_reference', 'idx_payments_provider_reference');
    table.index('status', 'idx_payments_status');
    table.index('created_at', 'idx_payments_created_at');
  });

  // Create trigger to update updated_at timestamp
  await knex.raw(`
    CREATE TRIGGER update_payments_updated_at
    BEFORE UPDATE ON payments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw('DROP TRIGGER IF EXISTS update_payments_updated_at ON payments');
  await knex.schema.dropTableIfExists('payments');
}













