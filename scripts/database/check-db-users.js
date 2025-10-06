const { Client } = require('pg');

// Database connection details
const client = new Client({
  user: 'postgres',
  host: '127.0.0.1',
  database: 'postgres',
  password: 'postgres',
  port: 54322
});

async function checkUsers() {
  try {
    // Connect to the database
    await client.connect();
    console.log('Connected to the database');

    // Check if users table exists
    const tableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'users'
      );
    `);

    if (!tableCheck.rows[0].exists) {
      console.log('Users table does not exist');
      return;
    }

    console.log('Users table exists');

    // Check if there are any users
    const usersResult = await client.query('SELECT COUNT(*) FROM users;');
    console.log(`Total users in database: ${usersResult.rows[0].count}`);

    if (usersResult.rows[0].count > 0) {
      const users = await client.query('SELECT id, name, email, role FROM users LIMIT 10;');
      console.log('Sample users:');
      users.rows.forEach(user => {
        console.log(`- ${user.id}: ${user.name} (${user.email}) - ${user.role}`);
      });
    }
  } catch (error) {
    console.error('Error checking users:', error.message);
  } finally {
    await client.end();
    console.log('Disconnected from database');
  }
}

checkUsers();
