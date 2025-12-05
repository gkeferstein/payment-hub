/**
 * Validate Database Schema
 * Checks if all required tables exist
 */

import { db } from '../infrastructure/database/connection';

const REQUIRED_TABLES = [
  'customers',
  'orders',
  'order_items',
  'payments',
  'order_status_history',
  'payment_status_history',
  'idempotency_keys',
  'payment_providers',
];

async function validateSchema(): Promise<void> {
  try {
    console.log('Validating database schema...\n');
    
    for (const tableName of REQUIRED_TABLES) {
      const exists = await db.schema.hasTable(tableName);
      
      if (exists) {
        console.log(`✅ ${tableName}`);
      } else {
        console.log(`❌ ${tableName} - MISSING!`);
      }
    }
    
    console.log('\n✅ Schema validation complete');
    process.exit(0);
  } catch (error: any) {
    console.error('❌ Schema validation failed:', error.message);
    process.exit(1);
  }
}

validateSchema();
