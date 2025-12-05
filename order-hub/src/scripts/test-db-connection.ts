/**
 * Test Database Connection
 * Simple script to verify database connectivity
 */

import { db } from '../infrastructure/database/connection';

async function testConnection(): Promise<void> {
  try {
    console.log('Testing database connection...');
    
    const result = await db.raw('SELECT NOW() as current_time');
    
    console.log('✅ Database connection successful!');
    console.log(`Current time: ${result.rows[0].current_time}`);
    
    process.exit(0);
  } catch (error: any) {
    console.error('❌ Database connection failed:', error.message);
    process.exit(1);
  }
}

testConnection();
