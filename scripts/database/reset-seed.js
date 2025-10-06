const { Client } = require('pg');
const fs = require('fs').promises;
const path = require('path');

// Load environment variables
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

// Database configuration
const dbConfig = {
  user: process.env.POSTGRES_USER,
  host: process.env.POSTGRES_HOST,
  database: process.env.POSTGRES_DB,
  password: process.env.POSTGRES_PASSWORD,
  port: process.env.POSTGRES_PORT
};

// Create database client
const client = new Client(dbConfig);

async function resetAndSeedDatabase() {
  try {
    // Connect to the database
    await client.connect();
    console.log('Connected to the database');

    // Reset database by deleting all data
    console.log('Resetting database...');

    // Disable foreign key checks
    await client.query('SET session_replication_role = replica;');
    console.log('Foreign key checks disabled');

    // Delete all data from tables (in correct order to respect foreign key constraints)
    const tables = [
      'tokens',
      'doctor_notes',
      'medications',
      'prescriptions',
      'invoices',
      'appointments',
      'availabilities',
      'doctor_profiles',
      'user_profiles',
      'app_configs',
      'users'
    ];

    for (const table of tables) {
      await client.query(`DELETE FROM ${table};`);
      console.log(`Deleted all records from ${table}`);
    }

    // Re-enable foreign key checks
    await client.query('SET session_replication_role = origin;');
    console.log('Foreign key checks enabled');

    // Read and execute the seed SQL file
    const seedSqlPath = path.resolve(__dirname, '../../docs/database/complete_schema_with_seed.sql');
    const seedSql = await fs.readFile(seedSqlPath, 'utf8');

    console.log('Executing seed script...');
    await client.query(seedSql);
    console.log('Seed script executed successfully');
    console.log('Database seeded successfully!');

    console.log('Database reset and seeding completed successfully');

  } catch (error) {
    console.error('Error resetting and seeding database:', error);
    process.exit(1);
  } finally {
    if (client) {
      await client.end();
      console.log('Database connection closed');
    }
  }
}

// Run the reset and seed function
resetAndSeedDatabase();
