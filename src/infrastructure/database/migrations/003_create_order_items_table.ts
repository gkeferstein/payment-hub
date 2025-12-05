/**
 * Migration: Create order_items table
 * 
 * Creates the order_items table for line items within an order
 */

import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('order_items', (table) => {
    // Primary key
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));

    // Order reference
    table
      .uuid('order_id')
      .notNullable()
      .references('id')
      .inTable('orders')
      .onDelete('CASCADE');

    // Item information
    table.string('name', 500).notNullable();
    table.string('sku', 255);
    table.text('description');

    // Quantity and pricing
    table.integer('quantity').notNullable().defaultTo(1);
    table.decimal('unit_price', 12, 2).notNullable().defaultTo(0);
    table.decimal('total_price', 12, 2).notNullable().defaultTo(0);

    // Tax information
    table.decimal('tax_rate', 5, 4).notNullable().defaultTo(0); // e.g., 0.1900 for 19%
    table.decimal('tax_amount', 12, 2).notNullable().defaultTo(0);

    // Additional metadata (product-specific data)
    table.jsonb('metadata').defaultTo('{}');

    // Timestamps
    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
    table.timestamp('updated_at').notNullable().defaultTo(knex.fn.now());

    // Indexes
    table.index('order_id', 'idx_order_items_order_id');
    table.index('sku', 'idx_order_items_sku');
  });

  // Create trigger to update updated_at timestamp
  await knex.raw(`
    CREATE TRIGGER update_order_items_updated_at
    BEFORE UPDATE ON order_items
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw('DROP TRIGGER IF EXISTS update_order_items_updated_at ON order_items');
  await knex.schema.dropTableIfExists('order_items');
}




