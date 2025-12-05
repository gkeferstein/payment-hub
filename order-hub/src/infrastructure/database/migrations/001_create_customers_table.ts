/**
 * Migration: Create customers table
 * 
 * Creates the customers table with basic customer information
 */

import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('customers', (table) => {
    // Primary key
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));

    // Customer information
    table.string('email', 255).notNullable();
    table.string('name', 255);
    table.string('phone', 50);

    // Metadata (for additional customer data)
    table.jsonb('metadata').defaultTo('{}');

    // Timestamps
    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
    table.timestamp('updated_at').notNullable().defaultTo(knex.fn.now());

    // Indexes
    table.index('email', 'idx_customers_email');
    table.index('created_at', 'idx_customers_created_at');
  });

  // Create trigger to update updated_at timestamp
  await knex.raw(`
    CREATE OR REPLACE FUNCTION update_updated_at_column()
    RETURNS TRIGGER AS $$
    BEGIN
      NEW.updated_at = NOW();
      RETURN NEW;
    END;
    $$ language 'plpgsql';
  `);

  await knex.raw(`
    CREATE TRIGGER update_customers_updated_at
    BEFORE UPDATE ON customers
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw('DROP TRIGGER IF EXISTS update_customers_updated_at ON customers');
  await knex.schema.dropTableIfExists('customers');
}
