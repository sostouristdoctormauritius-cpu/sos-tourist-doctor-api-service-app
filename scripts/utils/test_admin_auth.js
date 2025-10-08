const { createClient } = require('@supabase/supabase-js');

// Supabase configuration from the .env file
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

// Create Supabase client with anon key for authentication
const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false
  }
});

async function testAdminAuthentication() {
  try {
    console.log('Testing admin authentication with credentials: admin1@sosdoctor.com | Admin123!');
    
    // Try to sign in with the provided credentials
    const { data, error } = await supabase.auth.signInWithPassword({
      email: 'admin1@sosdoctor.com',
      password: 'Admin123!'
    });

    if (error) {
      console.log('❌ Admin authentication failed:', error.message);
      console.log('Error code:', error.status);
      return false;
    }

    console.log('✅ Admin authentication successful!');
    console.log('User ID:', data.user.id);
    console.log('Email:', data.user.email);
    console.log('Role:', data.user.user_metadata?.role || 'Not specified');
    
    // Test access to a protected resource
    console.log('\nTesting access to users table...');
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, name, email, role')
      .limit(5);

    if (usersError) {
      console.log('❌ Error accessing users table:', usersError.message);
    } else {
      console.log('✅ Successfully accessed users table');
      console.log('Sample users:');
      users.forEach(user => {
        console.log(`  - ${user.name} (${user.email}) - ${user.role}`);
      });
    }
    
    return true;
  } catch (error) {
    console.log('❌ Exception during admin authentication:', error.message);
    return false;
  }
}

async function testServiceRoleAccess() {
  console.log('\nTesting with service role key for comparison...');

  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  // Create Supabase client with service role key
  const supabaseService = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false
    }
  });
  
  // Test access to users table
  console.log('Testing access to users table with service role key...');
  const { data: users, error: usersError } = await supabaseService
    .from('users')
    .select('id, name, email, role')
    .limit(5);

  if (usersError) {
    console.log('❌ Error accessing users table with service role key:', usersError.message);
  } else {
    console.log('✅ Successfully accessed users table with service role key');
    console.log('Sample users:');
    users.forEach(user => {
      console.log(`  - ${user.name} (${user.email}) - ${user.role}`);
    });
  }
}

async function main() {
  console.log('SOS Tourist Doctor - Admin Authentication Test');
  console.log('='.repeat(50));
  
  // Test admin authentication
  await testAdminAuthentication();
  
  // Test service role access for comparison
  await testServiceRoleAccess();
  
  console.log('\n✅ Authentication tests completed');
}

// Run the script
main();
