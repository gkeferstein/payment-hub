/**
 * Migration: Create channel_configs table
 * 
 * Stores channel configuration settings persistently in the database
 * Replaces in-memory storage with database persistence
 */

import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('channel_configs', (table) => {
    // Primary key
    table.string('channel', 50).primary(); // 'woocommerce', 'pos', 'b2b'
    
    // Configuration flags
    table.boolean('use_payment_hub').notNullable().defaultTo(false);
    table.boolean('shadow_mode').notNullable().defaultTo(true);
    table.boolean('callback_enabled').notNullable().defaultTo(false);
    
    // Timestamps
    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
    table.timestamp('updated_at').notNullable().defaultTo(knex.fn.now());
    
    // Indexes
    table.index('channel', 'idx_channel_configs_channel');
  });
  
  // Insert default configurations
  await knex('channel_configs').insert([
    {
      channel: 'woocommerce',
      use_payment_hub: false,
      shadow_mode: true,
      callback_enabled: false,
    },
    {
      channel: 'pos',
      use_payment_hub: false,
      shadow_mode: true,
      callback_enabled: false,
    },
    {
      channel: 'b2b',
      use_payment_hub: false,
      shadow_mode: true,
      callback_enabled: false,
    },
  ]);
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('channel_configs');
}
