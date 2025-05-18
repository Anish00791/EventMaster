// Script to run the session table migration
import fs from 'fs';
import path from 'path';
import { Pool } from 'pg';
import 'dotenv-esm/config';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Get database connection string from environment variables
const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error('DATABASE_URL is not defined in environment variables');
  process.exit(1);
}

// Create a PostgreSQL connection pool
const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: { rejectUnauthorized: false } // Enable SSL with self-signed certificates
});

// Read the SQL migration file
const sqlFilePath = path.join(__dirname, 'create-session-table.sql');
const sqlQuery = fs.readFileSync(sqlFilePath, 'utf8');

async function runMigration() {
  const client = await pool.connect();
  try {
    console.log('Running session table migration...');
    await client.query(sqlQuery);
    console.log('Session table migration completed successfully!');
  } catch (err) {
    console.error('Error running migration:', err);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

runMigration();
