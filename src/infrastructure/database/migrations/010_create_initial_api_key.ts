/**
 * Migration: Create initial admin API key
 * Creates a default API key for initial setup
 * 
 * IMPORTANT: This key should be changed after first login!
 */

import { Knex } from 'knex';
import * as crypto from 'crypto';

export async function up(knex: Knex): Promise<void> {
  // Check if any API keys exist
  const existing = await knex('api_keys').count('* as count').first();
  
  if (existing && parseInt(existing.count as string) > 0) {
    // Keys already exist, skip
    return;
  }

  // Generate initial admin key
  const plainKey = crypto.randomBytes(32).toString('base64url');
  const keyHash = crypto.createHash('sha256').update(plainKey).digest('hex');
  const keyPrefix = plainKey.substring(0, 8);

  // Insert initial admin key
  await knex('api_keys').insert({
    name: 'Initial Admin Key',
    description: 'Default API key created on setup. Please create a new key and delete this one!',
    key_hash: keyHash,
    key_prefix: keyPrefix,
    channel: 'admin',
    is_active: true,
    usage_count: 0,
  });

  // Log the key (only in migration, not in production!)
  console.log('\n========================================');
  console.log('INITIAL API KEY CREATED:');
  console.log('========================================');
  console.log(`API Key: ${plainKey}`);
  console.log('========================================');
  console.log('⚠️  SAVE THIS KEY - IT WILL NOT BE SHOWN AGAIN!');
  console.log('⚠️  Use this key to login to Admin UI and create new keys');
  console.log('⚠️  Delete this key after creating your own keys');
  console.log('========================================\n');
}

export async function down(knex: Knex): Promise<void> {
  // Remove initial admin key if it exists
  await knex('api_keys')
    .where('name', 'Initial Admin Key')
    .delete();
}

