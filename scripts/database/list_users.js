const dbManager = require('../../src/db/dbManager');

async function listUsers() {
  try {
    console.log('Connecting to Supabase database...');

    // Initialize database connection using existing dbManager
    await dbManager.connect();
    console.log('Successfully connected to Supabase database');

    // Query all users from the users table
    console.log('Querying all users...');
    const users = await dbManager.supabaseAdapter.findMany('users', {});

    if (users && users.length > 0) {
      console.log(`\nFound ${users.length} user(s) in the database:\n`);
      console.log('ID\t\t\t\tName\t\t\tEmail\t\t\t\tRole\t\t\tIs Archived');
      console.log('------------------------------------------------------------------------------------------------------------------------');

      users.forEach((user, index) => {
        console.log(`${user.id}\t${user.name || 'N/A'}\t\t\t${user.email || 'N/A'}\t\t\t${user.role || 'N/A'}\t\t\t${user.is_archived || false}`);
      });

      console.log('\n');
    } else {
      console.log('No users found in the database.');
    }

    return users;
  } catch (error) {
    console.error('Error listing users:', error.message);
    if (error.details) {
      console.error('Error details:', error.details);
    }
    throw error;
  } finally {
    // Disconnect from database
    await dbManager.disconnect();
    console.log('Disconnected from database');
  }
}

// If script is run directly, execute the function
if (require.main === module) {
  listUsers()
    .then(() => {
      console.log('User listing completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Failed to list users:', error);
      process.exit(1);
    });
}

module.exports = listUsers;
