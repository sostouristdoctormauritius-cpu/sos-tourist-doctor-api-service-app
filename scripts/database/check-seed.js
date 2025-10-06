const { createClient } = require('@supabase/supabase-js');

// Supabase connection details from the status output
const supabaseUrl = 'http://127.0.0.1:54321';
// Using anon key
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false
  }
});

async function checkSeed() {
  try {
    // Sign in as admin user first
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: 'admin@example.com',
      password: 'password' // This is probably not the actual password
    });

    if (authError) {
      console.log('Could not sign in with admin user (this is expected if we don\'t know the password)');
      console.log('Auth error:', authError.message);
    } else {
      console.log('Successfully signed in as admin');
    }

    // Try to access data directly using service role key approach
    console.log('\nUsing direct database connection to check data...');

    // Check users table
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, name, email, role');

    if (usersError) {
      console.error('Error fetching users:', usersError.message);
    } else {
      console.log(`Found ${users.length} users:`);
      users.forEach(user => {
        console.log(`- ${user.name} (${user.email}) - ${user.role}`);
      });
    }

    // Check user_profiles table
    const { data: profiles, error: profilesError } = await supabase
      .from('user_profiles')
      .select('user_id, nickname, language');

    if (profilesError) {
      console.error('Error fetching profiles:', profilesError.message);
    } else {
      console.log(`\nFound ${profiles.length} user profiles:`);
      profiles.forEach(profile => {
        console.log(`- User ID: ${profile.user_id}, Nickname: ${profile.nickname}, Language: ${profile.language}`);
      });
    }

    // Check doctor_profiles table
    const { data: doctorProfiles, error: doctorProfilesError } = await supabase
      .from('doctor_profiles')
      .select('user_id, specialisation, rating');

    if (doctorProfilesError) {
      console.error('Error fetching doctor profiles:', doctorProfilesError.message);
    } else {
      console.log(`\nFound ${doctorProfiles.length} doctor profiles:`);
      doctorProfiles.forEach(profile => {
        console.log(`- User ID: ${profile.user_id}, Specialization: ${profile.specialisation}, Rating: ${profile.rating}`);
      });
    }

  } catch (error) {
    console.error('Unexpected error:', error.message);
  }
}

checkSeed();
