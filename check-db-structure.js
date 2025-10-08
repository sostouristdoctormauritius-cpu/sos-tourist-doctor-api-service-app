require('dotenv').config();

const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkUsersTable() {
  try {
    // Get a sample user to see the structure
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .limit(1);

    if (error) {
      console.error('Error fetching users:', error);
      return;
    }

    console.log('Users table structure:');
    console.log(JSON.stringify(data, null, 2));
    
    // Also check if there are any doctors
    const { data: doctors, error: doctorsError } = await supabase
      .from('users')
      .select('*')
      .eq('role', 'doctor')
      .limit(3);

    if (doctorsError) {
      console.error('Error fetching doctors:', doctorsError);
      return;
    }

    console.log('\nSample doctors:');
    console.log(JSON.stringify(doctors, null, 2));
  } catch (err) {
    console.error('Unexpected error:', err);
  }
}

checkUsersTable();