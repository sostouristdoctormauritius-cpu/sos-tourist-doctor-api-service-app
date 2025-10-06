const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkAuthTables() {
  try {
    console.log('Checking authentication related tables...\n');

    // Check users table
    const { count: usersCount, error: usersError } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true });

    if (usersError) {
      console.error('Error checking users table:', usersError);
    } else {
      console.log(`Users table: ${usersCount} records found`);
    }

    // Check tokens table
    const { count: tokensCount, error: tokensError } = await supabase
      .from('tokens')
      .select('*', { count: 'exact', head: true });

    if (tokensError) {
      console.error('Error checking tokens table:', tokensError);
    } else {
      console.log(`Tokens table: ${tokensCount} records found`);
    }

    console.log('\nAuthentication tables check completed.');
  } catch (error) {
    console.error('Error during authentication tables check:', error);
  }
}

// Run the check
checkAuthTables();
