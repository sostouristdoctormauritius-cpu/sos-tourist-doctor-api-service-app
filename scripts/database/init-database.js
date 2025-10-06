const { Client } = require('pg');
const fs = require('fs').promises;
const path = require('path');

// Database connection details
const client = new Client({
  user: 'postgres',
  host: '127.0.0.1',
  database: 'postgres',
  password: 'postgres',
  port: 54322
});

async function initDatabase() {
  try {
    // Connect to the database
    await client.connect();
    console.log('Connected to the database');

    // Read and execute the initial schema migration
    console.log('Applying initial schema...');
    const schemaSqlPath = path.join(__dirname, 'supabase', 'migrations', '20250809000000_initial_schema.sql');
    const schemaSql = await fs.readFile(schemaSqlPath, 'utf8');
    await client.query(schemaSql);
    console.log('Schema applied successfully');

    // Read and execute the seed file to create the seeding procedure
    console.log('Creating seed procedure...');
    const seedSqlPath = path.join(__dirname, 'supabase', 'seed.sql');
    const seedSql = await fs.readFile(seedSqlPath, 'utf8');
    await client.query(seedSql);
    console.log('Seed procedure created successfully');

    // Call the seed procedure to populate the database
    console.log('Seeding database...');
    await client.query('CALL seed_database();');
    console.log('Database seeded successfully');

    // Verify users were created
    const usersResult = await client.query('SELECT id, name, email, role FROM users;');
    console.log(`Total users in database: ${usersResult.rows.length}`);

    if (usersResult.rows.length > 0) {
      console.log('Users in database:');
      usersResult.rows.forEach(user => {
        console.log(`- ${user.id}: ${user.name} (${user.email}) - ${user.role}`);
      });
    }
  } catch (error) {
    console.error('Database initialization error:', error.message);
    console.error('Error stack:', error.stack);
  } finally {
    await client.end();
    console.log('Disconnected from database');
  }
}

initDatabase();
