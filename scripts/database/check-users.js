const { createClient } = require('@supabase/supabase-js');

// Use the same configuration as in the .env file
const supabaseUrl = 'http://127.0.0.1:54321';
const supabaseServiceKey = 'your_supabase_service_role_key_here';

console.log('Connecting to Supabase at:', supabaseUrl);

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false
  }
});

async function checkUsers() {
  try {
    console.log('Checking for users...');

    const { data, error } = await supabase
      .from('users')
      .select('id, name, email, role')
      .limit(10);

    if (error) {
      console.error('Error fetching users:', error);
      return;
    }

    console.log(`Found ${data.length} users:`);
    data.forEach(user => {
      console.log(`- ${user.id}: ${user.name} (${user.email}) - ${user.role}`);
    });
  } catch (error) {
    console.error('Error:', error.message);
  }
}

checkUsers();
