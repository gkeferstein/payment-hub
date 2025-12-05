/**
 * Migration: Create payment_status_history table
 * 
 * Auditing table to track all status changes for payments
 * Critical for compliance, reconciliation, and debugging
 */

import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('payment_status_history', (table) => {
    // Primary key
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));

    // Payment reference
    table
      .uuid('payment_id')
      .notNullable()
      .references('id')
      .inTable('payments')
      .onDelete('CASCADE');

    // Status change information
    table.string('old_status', 50);
    table.string('new_status', 50).notNullable();

    // Who/what changed it
    table.string('changed_by', 255); // e.g., 'system', 'webhook:stripe', 'user:admin@example.com'
    table.string('change_reason', 500); // Optional reason for the change

    // Provider information (at time of change)
    table.string('provider', 50);
    table.string('provider_reference', 255);

    // Additional context
    table.jsonb('metadata').defaultTo('{}'); // Additional data about the change

    // When it changed
    table.timestamp('changed_at').notNullable().defaultTo(knex.fn.now());

    // Indexes
    table.index('payment_id', 'idx_payment_status_history_payment_id');
    table.index('changed_at', 'idx_payment_status_history_changed_at');
    table.index('new_status', 'idx_payment_status_history_new_status');
    table.index('provider_reference', 'idx_payment_status_history_provider_ref');
  });

  // Create function to automatically log payment status changes
  await knex.raw(`
    CREATE OR REPLACE FUNCTION log_payment_status_change()
    RETURNS TRIGGER AS $$
    BEGIN
      IF OLD.status IS DISTINCT FROM NEW.status THEN
        INSERT INTO payment_status_history (
          payment_id,
          old_status,
          new_status,
          changed_by,
          provider,
          provider_reference,
          changed_at
        )
        VALUES (
          NEW.id,
          OLD.status,
          NEW.status,
          'trigger',
          NEW.provider,
          NEW.provider_reference,
          NOW()
        );
      END IF;
      RETURN NEW;
    END;
    $$ language 'plpgsql';
  `);

  await knex.raw(`
    CREATE TRIGGER log_payment_status_change_trigger
    AFTER UPDATE ON payments
    FOR EACH ROW
    EXECUTE FUNCTION log_payment_status_change();
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw('DROP TRIGGER IF EXISTS log_payment_status_change_trigger ON payments');
  await knex.raw('DROP FUNCTION IF EXISTS log_payment_status_change');
  await knex.schema.dropTableIfExists('payment_status_history');
}



