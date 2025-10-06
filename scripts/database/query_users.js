#!/usr/bin/env node

/**
 * Script to query users from the database
 */

const dbManager = require('../../src/db/dbManager');

async function queryUsers() {
  try {
    // Initialize database connection
    await dbManager.connect();
    console.log('Connected to database');

    // Get all users using the getUsers function from userService
    const users = await dbManager.supabaseAdapter.findMany('users', {});

    console.log(`Found ${users.length} users:`);
    users.forEach(user => {
      console.log(`- ID: ${user.id}, Name: ${user.name}, Email: ${user.email}, Role: ${user.role}`);
    });

    return users;
  } catch (error) {
    console.error('Error querying users:', error.message);
    throw error;
  } finally {
    // Disconnect from database
    await dbManager.disconnect();
    console.log('Disconnected from database');
  }
}

// If script is run directly, execute the query
if (require.main === module) {
  queryUsers()
    .then(() => {
      console.log('User query completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Failed to query users:', error);
      process.exit(1);
    });
}

module.exports = queryUsers;
