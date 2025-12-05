/**
 * Migration: Create orders table
 * 
 * Creates the orders table - the core table for order management
 * Includes source tracking, status, and totals
 */

import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('orders', (table) => {
    // Primary key
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));

    // Customer reference (optional - orders can exist without customer)
    table.uuid('customer_id').references('id').inTable('customers').onDelete('SET NULL');

    // Source tracking (where the order came from)
    table.string('source', 50).notNullable(); // e.g., 'woo', 'pos', 'b2b'
    table.string('source_order_id', 255).notNullable(); // External order ID

    // Order status
    table
      .enum('status', [
        'pending',
        'confirmed',
        'paid',
        'processing',
        'shipped',
        'delivered',
        'cancelled',
        'refunded',
      ])
      .notNullable()
      .defaultTo('pending');

    // Currency and totals
    table.string('currency', 3).notNullable().defaultTo('EUR'); // ISO 4217
    table.decimal('subtotal', 12, 2).notNullable().defaultTo(0);
    table.decimal('tax_total', 12, 2).notNullable().defaultTo(0);
    table.decimal('shipping_total', 12, 2).notNullable().defaultTo(0);
    table.decimal('discount_total', 12, 2).notNullable().defaultTo(0);
    table.decimal('grand_total', 12, 2).notNullable().defaultTo(0);

    // Totals as JSON (for flexibility)
    table.jsonb('totals').defaultTo('{}');

    // Additional metadata (channel-specific data)
    table.jsonb('metadata').defaultTo('{}');

    // Timestamps
    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
    table.timestamp('updated_at').notNullable().defaultTo(knex.fn.now());

    // Indexes
    table.index('customer_id', 'idx_orders_customer_id');
    table.index('source', 'idx_orders_source');
    table.index('status', 'idx_orders_status');
    table.index('created_at', 'idx_orders_created_at');
    table.index(['source', 'source_order_id'], 'idx_orders_source_order_id');

    // Unique constraint: source + source_order_id must be unique
    table.unique(['source', 'source_order_id'], 'uq_orders_source_order_id');
  });

  // Create trigger to update updated_at timestamp
  await knex.raw(`
    CREATE TRIGGER update_orders_updated_at
    BEFORE UPDATE ON orders
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw('DROP TRIGGER IF EXISTS update_orders_updated_at ON orders');
  await knex.schema.dropTableIfExists('orders');
}




