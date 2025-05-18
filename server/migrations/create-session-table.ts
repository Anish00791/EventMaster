import 'dotenv/config';
import { pool } from '../db';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory path in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
  }
}

runMigration().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});