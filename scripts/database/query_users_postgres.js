const { Client } = require('pg');

async function queryUsers() {
  const client = new Client({
    user: 'postgres',
    host: 'localhost',
    database: 'postgres',
    password: 'postgres',
    port: 54322
  });

  try {
    console.log('Connecting to PostgreSQL database...');
    await client.connect();
    console.log('Connected successfully!');

    // Query users
    console.log('Querying users...');
    const res = await client.query(`
      SELECT id, name, email, role, is_email_verified, created_at
      FROM users
      ORDER BY created_at DESC
      LIMIT 5
    `);

    console.log(`Found ${res.rows.length} users:`);
    res.rows.forEach((user, index) => {
      console.log(`${index + 1}. ${user.name} (${user.email}) - ${user.role}`);
    });

  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await client.end();
    console.log('Database connection closed');
  }
}

queryUsers();
