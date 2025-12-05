/**
 * Migration: Create idempotency_keys table
 * Stores idempotency keys and their responses for duplicate request detection
 */

import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('idempotency_keys', (table) => {
    // Primary key
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));

    // Idempotency key (unique)
    table.string('key', 255).notNullable().unique();

    // Request information
    table.string('endpoint', 500).notNullable();
    table.string('method', 10).notNullable();

    // Response stored as JSON
    table.integer('status_code').notNullable();
    table.jsonb('response_body').notNullable();

    // Timestamps
    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
    table.timestamp('expires_at').notNullable(); // TTL for cleanup

    // Indexes
    table.index('key', 'idx_idempotency_keys_key');
    table.index('expires_at', 'idx_idempotency_keys_expires_at');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('idempotency_keys');
}
