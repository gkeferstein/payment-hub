/**
 * Migration: Create order_status_history table
 * 
 * Auditing table to track all status changes for orders
 * Critical for compliance and debugging
 */

import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('order_status_history', (table) => {
    // Primary key
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));

    // Order reference
    table
      .uuid('order_id')
      .notNullable()
      .references('id')
      .inTable('orders')
      .onDelete('CASCADE');

    // Status change information
    table.string('old_status', 50);
    table.string('new_status', 50).notNullable();

    // Who/what changed it
    table.string('changed_by', 255); // e.g., 'system', 'webhook:stripe', 'user:admin@example.com'
    table.string('change_reason', 500); // Optional reason for the change

    // Additional context
    table.jsonb('metadata').defaultTo('{}'); // Additional data about the change

    // When it changed
    table.timestamp('changed_at').notNullable().defaultTo(knex.fn.now());

    // Indexes
    table.index('order_id', 'idx_order_status_history_order_id');
    table.index('changed_at', 'idx_order_status_history_changed_at');
    table.index('new_status', 'idx_order_status_history_new_status');
  });

  // Create function to automatically log order status changes
  await knex.raw(`
    CREATE OR REPLACE FUNCTION log_order_status_change()
    RETURNS TRIGGER AS $$
    BEGIN
      IF OLD.status IS DISTINCT FROM NEW.status THEN
        INSERT INTO order_status_history (order_id, old_status, new_status, changed_by, changed_at)
        VALUES (NEW.id, OLD.status, NEW.status, 'trigger', NOW());
      END IF;
      RETURN NEW;
    END;
    $$ language 'plpgsql';
  `);

  await knex.raw(`
    CREATE TRIGGER log_order_status_change_trigger
    AFTER UPDATE ON orders
    FOR EACH ROW
    EXECUTE FUNCTION log_order_status_change();
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw('DROP TRIGGER IF EXISTS log_order_status_change_trigger ON orders');
  await knex.raw('DROP FUNCTION IF EXISTS log_order_status_change');
  await knex.schema.dropTableIfExists('order_status_history');
}



