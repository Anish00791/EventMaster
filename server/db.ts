import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from '@shared/schema';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not defined in environment variables');
}

const DATABASE_URL = process.env.DATABASE_URL;

// Create a PostgreSQL connection pool with more resilient settings
const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000, // How long a client is allowed to remain idle before being closed
  connectionTimeoutMillis: 2000, // How long to wait for a connection
  maxUses: 7500, // Maximum number of times a connection can be used before being closed
});

// Add connection error handling
pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

// Test the connection with retry logic
async function testConnection(retries = 3, delay = 1000) {
  for (let i = 0; i < retries; i++) {
    try {
      const client = await pool.connect();
      console.log('Successfully connected to the database');
      client.release();
      return;
    } catch (err) {
      console.error(`Connection attempt ${i + 1} failed:`, err);
      if (i === retries - 1) {
        console.error('Connection string:', DATABASE_URL.replace(/:[^:@]*@/, ':****@')); // Hide password in logs
        throw err;
      }
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}

// Initialize connection
testConnection().catch(err => {
  console.error('Failed to connect to the database after retries:', err);
  process.exit(1);
});

// Create a Drizzle ORM instance
export const db = drizzle(pool, { schema });

// Export the pool for direct query access if needed
export { pool };