const { Client } = require('pg');

// Database connection details
const client = new Client({
  user: 'postgres',
  host: '127.0.0.1',
  database: 'postgres',
  password: 'postgres',
  port: 54322
});

async function checkDatabase() {
  try {
    // Connect to the database
    await client.connect();
    console.log('Connected to the database');

    // Check if the seed_database procedure exists
    const procedureResult = await client.query(
      'SELECT proname FROM pg_proc WHERE proname = \'seed_database\';'
    );

    console.log('Procedure exists:', procedureResult.rows.length > 0);

    if (procedureResult.rows.length > 0) {
      console.log('Procedure found, calling it...');
      // Call the seed procedure
      await client.query('CALL seed_database();');
      console.log('Seed procedure executed');
    } else {
      console.log('Seed procedure does not exist');
    }

    // Check users table
    const usersResult = await client.query('SELECT COUNT(*) FROM users;');
    console.log(`Users count: ${usersResult.rows[0].count}`);

    // Show some users if they exist
    if (usersResult.rows[0].count > 0) {
      const users = await client.query('SELECT id, name, email, role FROM users LIMIT 5;');
      console.log('Sample users:');
      users.rows.forEach(user => {
        console.log(`- ${user.name} (${user.email}) - ${user.role}`);
      });
    }

    // Check user_profiles table
    const profilesResult = await client.query('SELECT COUNT(*) FROM user_profiles;');
    console.log(`User profiles count: ${profilesResult.rows[0].count}`);

    // Check doctor_profiles table
    const doctorProfilesResult = await client.query('SELECT COUNT(*) FROM doctor_profiles;');
    console.log(`Doctor profiles count: ${doctorProfilesResult.rows[0].count}`);

  } catch (err) {
    console.error('Database error:', err);
  } finally {
    await client.end();
  }
}

checkDatabase();
