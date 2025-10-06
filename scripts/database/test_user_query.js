const dbManager = require('../../src/db/dbManager');

async function testUserQuery() {
  try {
    console.log('Connecting to Supabase database...');

    // Initialize database connection using existing dbManager
    await dbManager.connect();
    console.log('Successfully connected to Supabase database');

    // Test the specific query that's used in authenticateUser
    console.log('Testing getUserByEmail query for admin@example.com...');
    const user = await dbManager.findOne('users', {
      email: 'admin@example.com',
      is_archived: false
    });

    console.log('Query result:', user);

    if (user) {
      console.log('User found:');
      console.log('ID:', user.id);
      console.log('Email:', user.email);
      console.log('Role:', user.role);
      console.log('Is Archived:', user.is_archived);
    } else {
      console.log('User not found with the query');

      // Let's try without the is_archived filter
      console.log('Trying without is_archived filter...');
      const user2 = await dbManager.findOne('users', {
        email: 'admin@example.com'
      });

      if (user2) {
        console.log('User found without is_archived filter:');
        console.log('ID:', user2.id);
        console.log('Email:', user2.email);
        console.log('Role:', user2.role);
        console.log('Is Archived:', user2.is_archived);
      } else {
        console.log('User still not found even without is_archived filter');
      }
    }

    return user;
  } catch (error) {
    console.error('Error testing user query:', error.message);
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
  testUserQuery()
    .then(() => {
      console.log('User query test completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Failed to test user query:', error);
      process.exit(1);
    });
}

module.exports = testUserQuery;
