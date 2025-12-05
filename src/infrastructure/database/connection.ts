/**
 * Database Connection
 * PostgreSQL connection using Knex.js with connection pooling
 */

import knex, { Knex } from 'knex';
import path from 'path';

// Load knexfile from project root
// In dist, we're at dist/infrastructure/database/connection.js
// knexfile.js is at project root
// eslint-disable-next-line @typescript-eslint/no-var-requires
const config = require(path.resolve(__dirname, '../../../knexfile'));

const environment = process.env.NODE_ENV || 'development';
const knexConfig = config[environment as keyof typeof config];

if (!knexConfig) {
  throw new Error(`No database configuration found for environment: ${environment}`);
}

// Create Knex instance with connection pooling
export const db: Knex = knex(knexConfig);

/**
 * Test database connection
 * @returns Promise<boolean> - true if connection successful
 */
export async function testConnection(): Promise<boolean> {
  try {
    await db.raw('SELECT 1');
    return true;
  } catch (error) {
    console.error('Database connection failed:', error);
    return false;
  }
}

/**
 * Close database connection
 * Should be called on application shutdown
 */
export async function closeConnection(): Promise<void> {
  try {
    await db.destroy();
    console.log('Database connection closed');
  } catch (error) {
    console.error('Error closing database connection:', error);
    throw error;
  }
}

