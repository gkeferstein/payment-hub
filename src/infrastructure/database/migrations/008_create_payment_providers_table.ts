/**
 * Migration: Create payment_providers table
 * Stores payment provider configurations (Stripe, BTCPay, etc.)
 */

import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('payment_providers', (table) => {
    // Primary key
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));

    // Provider info
    table.string('provider', 50).notNullable(); // 'stripe', 'btcpay', etc.
    table.string('name', 255).notNullable(); // Display name
    table.text('description'); // Optional description

    // Status
    table.boolean('enabled').notNullable().defaultTo(true);

    // API Configuration (encrypted)
    table.text('api_key'); // Encrypted API key
    table.text('api_secret'); // Encrypted secret/private key
    table.text('webhook_secret'); // Encrypted webhook secret
    
    // Additional configuration (JSON)
    table.jsonb('config').defaultTo('{}');
    // Example config for Stripe: { publishable_key, mode: 'test'|'live' }
    // Example config for BTCPay: { server_url, store_id }

    // Test status
    table.timestamp('last_test_at');
    table.string('last_test_status', 50); // 'success', 'failed', 'never_tested'
    table.text('last_test_message'); // Error message if failed

    // Metadata
    table.jsonb('metadata').defaultTo('{}');

    // Timestamps
    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
    table.timestamp('updated_at').notNullable().defaultTo(knex.fn.now());
    table.timestamp('deleted_at'); // Soft delete

    // Indexes
    table.index('provider');
    table.index('enabled');
    table.index(['provider', 'enabled']);
    table.index('deleted_at');

    // Constraints
    table.unique(['provider', 'name']); // Prevent duplicate provider names
  });

  // Add comment
  await knex.raw(`
    COMMENT ON TABLE payment_providers IS 'Payment provider configurations with encrypted credentials';
  `);

  console.log('✅ Created payment_providers table');
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('payment_providers');
  console.log('✅ Dropped payment_providers table');
}














