const { createClient } = require('@supabase/supabase-js');
const config = require('../config/config');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../../../.env') });

async function testConnection() {
  try {
    console.log('Testing Supabase connection...');

    // Create Supabase client using service role key directly from .env
    const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

    // Test connection by fetching users
    const { data, error } = await supabase
      .from('users')
      .select('id')
      .limit(1);

    if (error) {
      console.error('Error connecting to Supabase:', error);
      throw error;
    }

    console.log('Successfully connected to Supabase!');
    console.log(`Found ${data.length} users in the database.`);

    // Test fetching some sample data
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, name, email, role')
      .limit(5);

    if (usersError) {
      console.error('Error fetching users:', usersError);
      throw usersError;
    }

    console.log('Sample users:');
    users.forEach(user => {
      console.log(`- ${user.name} (${user.email}) - ${user.role}`);
    });

    // Test fetching appointments
    const { data: appointments, error: appointmentsError } = await supabase
      .from('appointments')
      .select('id')
      .limit(1);

    if (appointmentsError) {
      console.error('Error fetching appointments:', appointmentsError);
      throw appointmentsError;
    }

    console.log(`Found ${appointments.length} appointments in the database.`);

    console.log('✅ Supabase connection and schema test completed successfully!');
  } catch (err) {
    console.error('Failed to connect to Supabase:', err);
    throw err;
  }
}

// Run test if script is called directly
if (require.main === module) {
  testConnection()
    .then(() => {
      console.log('Supabase connection test completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Supabase connection test failed:', error);
      process.exit(1);
    });
}

module.exports = testConnection;
