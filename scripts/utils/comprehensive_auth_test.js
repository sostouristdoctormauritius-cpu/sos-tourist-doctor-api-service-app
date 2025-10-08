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
    console.log('🔐 Testing admin authentication with credentials: admin1@sosdoctor.com | Admin123!');
    
    // Try to sign in with the provided credentials
    const { data, error } = await supabase.auth.signInWithPassword({
      email: 'admin1@sosdoctor.com',
      password: 'Admin123!'
    });

    if (error) {
      console.log('❌ Admin authentication failed:', error.message);
      console.log('Error code:', error.status);
      return { success: false, data: null };
    }

    console.log('✅ Admin authentication successful!');
    console.log('User ID:', data.user.id);
    console.log('Email:', data.user.email);
    console.log('Role in metadata:', data.user.user_metadata?.role || 'Not specified');
    
    return { success: true, data: data };
  } catch (error) {
    console.log('❌ Exception during admin authentication:', error.message);
    return { success: false, data: null };
  }
}

async function testAuthenticatedAccess() {
  console.log('\n🔍 Testing authenticated access to various tables...');
  
  // Test access to doctors
  console.log('\nTesting access to doctors...');
  try {
    const { data: doctors, error: doctorsError } = await supabase
      .from('users')
      .select('id, name, email, role')
      .eq('role', 'doctor')
      .limit(3);

    if (doctorsError) {
      console.log('❌ Error accessing doctors:', doctorsError.message);
    } else {
      console.log('✅ Successfully accessed doctors table');
      console.log('Sample doctors:');
      doctors.forEach(doctor => {
        console.log(`  - ${doctor.name} (${doctor.email})`);
      });
    }
  } catch (error) {
    console.log('❌ Exception accessing doctors:', error.message);
  }
  
  // Test access to appointments
  console.log('\nTesting access to appointments...');
  try {
    const { data: appointments, error: appointmentsError } = await supabase
      .from('appointments')
      .select('id, user_id, doctor_id, status')
      .limit(3);

    if (appointmentsError) {
      console.log('❌ Error accessing appointments:', appointmentsError.message);
    } else {
      console.log('✅ Successfully accessed appointments table');
      console.log('Sample appointments:');
      appointments.forEach(app => {
        console.log(`  - Appointment ${app.id} (Status: ${app.status})`);
      });
    }
  } catch (error) {
    console.log('❌ Exception accessing appointments:', error.message);
  }
}

async function getUserRole(userId) {
  try {
    console.log('\n🔍 Checking user role in database...');
    
    const { data: user, error } = await supabase
      .from('users')
      .select('role')
      .eq('id', userId)
      .single();

    if (error) {
      console.log('❌ Error fetching user role:', error.message);
      return null;
    }

    console.log(`✅ User role in database: ${user.role}`);
    return user.role;
  } catch (error) {
    console.log('❌ Exception fetching user role:', error.message);
    return null;
  }
}

async function main() {
  console.log('SOS Tourist Doctor - Comprehensive Admin Authentication Test');
  console.log('='.repeat(60));
  
  // Test admin authentication
  const authResult = await testAdminAuthentication();
  
  if (!authResult.success) {
    console.log('\n❌ Cannot proceed with access tests due to authentication failure');
    return;
  }
  
  // Get user role
  const role = await getUserRole(authResult.data.user.id);
  
  // Test authenticated access
  await testAuthenticatedAccess();
  
  console.log('\n✅ Comprehensive authentication tests completed');
  console.log(`\n📝 Summary:`);
  console.log(`   Authenticated as: admin1@sosdoctor.com`);
  console.log(`   User ID: ${authResult.data.user.id}`);
  console.log(`   Role in Auth: ${authResult.data.user.user_metadata?.role || 'Not specified'}`);
  console.log(`   Role in DB: ${role || 'Not found'}`);
}

// Run the script
main();
