/**
 * Migration: Create api_keys table
 * Stores API keys for authentication with hashing and metadata
 */

import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('api_keys', (table) => {
    // Primary key
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));

    // Key name/description (for management)
    table.string('name', 255).notNullable();
    table.text('description').nullable();

    // Hashed API key (SHA-256 hash of the actual key)
    table.string('key_hash', 64).notNullable().unique();

    // Key prefix (first 8 chars) for identification (not secret)
    table.string('key_prefix', 8).notNullable();

    // Channel/scope (which channel this key is for)
    table.string('channel', 50).nullable(); // 'woocommerce', 'pos', 'b2b', 'admin', etc.

    // Permissions/scope
    table.boolean('is_active').notNullable().defaultTo(true);
    table.timestamp('expires_at').nullable(); // Optional expiration

    // Usage tracking
    table.integer('usage_count').notNullable().defaultTo(0);
    table.timestamp('last_used_at').nullable();

    // Timestamps
    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
    table.timestamp('updated_at').notNullable().defaultTo(knex.fn.now());

    // Indexes
    table.index('key_hash', 'idx_api_keys_key_hash');
    table.index('channel', 'idx_api_keys_channel');
    table.index('is_active', 'idx_api_keys_is_active');
    table.index('expires_at', 'idx_api_keys_expires_at');
  });

  // Create function to update updated_at timestamp
  await knex.raw(`
    CREATE OR REPLACE FUNCTION update_updated_at_column()
    RETURNS TRIGGER AS $$
    BEGIN
      NEW.updated_at = NOW();
      RETURN NEW;
    END;
    $$ language 'plpgsql';
  `);

  // Create trigger
  await knex.raw(`
    CREATE TRIGGER update_api_keys_updated_at
    BEFORE UPDATE ON api_keys
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw('DROP TRIGGER IF EXISTS update_api_keys_updated_at ON api_keys;');
  await knex.raw('DROP FUNCTION IF EXISTS update_updated_at_column();');
  await knex.schema.dropTableIfExists('api_keys');
}

