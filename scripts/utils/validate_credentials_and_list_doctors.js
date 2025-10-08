async function listAllUsers() {
  try {
    console.log('\n👥 Fetching all users from the database...');
    
    // Query all users
    const { data: users, error } = await supabase
      .from('users')
      .select(`
        id,
        name,
        email,
        phone,
        role,
        created_at
      `)
      .limit(20);

    if (error) {
      console.error('❌ Error fetching users:', error.message);
      return;
    }

    console.log(`\n✅ Found ${users.length} users in the database:`);
    console.log('═'.repeat(80));

    users.forEach((user, index) => {
      console.log(`${index + 1}. 👤 ${user.name || 'Unnamed User'}`);
      console.log(`   🆔 ID: ${user.id}`);
      console.log(`   📧 Email: ${user.email}`);
      console.log(`   📱 Phone: ${user.phone || 'Not provided'}`);
      console.log(`   🏷️ Role: ${user.role}`);
      console.log(`   📅 Created: ${new Date(user.created_at).toLocaleDateString()}`);
      console.log('');
    });
  } catch (error) {
    console.error('❌ Exception while fetching users:', error.message);
  }
}
const { createClient } = require('@supabase/supabase-js');

// Supabase configuration from the .env file
const supabaseUrl = 'https://rsbcbiyvkjqsdtlqwibk.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJzYmNiaXl2a2pxc2R0bHF3aWJrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTY4NTI2NiwiZXhwIjoyMDc1MjYxMjY2fQ.uXwokqlWkfj--W64476PTG4OJCpE_sQjlbiArsSOvUo';

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false
  }
});

async function validateCredentials() {
  try {
    console.log('Validating Supabase credentials...');
    
    // Test credentials by fetching a small amount of data
    const { data, error } = await supabase
      .from('users')
      .select('id')
      .limit(1);

    if (error) {
      console.error('❌ Credential validation failed:', error.message);
      return false;
    }

    console.log('✅ Credentials validated successfully!');
    return true;
  } catch (error) {
    console.error('❌ Exception during credential validation:', error.message);
    return false;
  }
}

async function testAdminCredentials() {
  try {
    console.log('\nTesting admin credentials: admin1@sosdoctor.com | Admin123!');
    
    // Try to sign in with the provided credentials
    const { data, error } = await supabase.auth.signInWithPassword({
      email: 'admin1@sosdoctor.com',
      password: 'Admin123!'
    });

    if (error) {
      console.log('❌ Admin authentication failed:', error.message);
      return false;
    }

    console.log('✅ Admin authentication successful!');
    console.log('User ID:', data.user.id);
    return true;
  } catch (error) {
    console.log('❌ Exception during admin authentication:', error.message);
    return false;
  }
}

async function listAllDoctors() {
  try {
    console.log('\n🏥 Fetching all doctors from the database...');
    
    // Query users table for doctors with their profiles
    const { data: doctors, error } = await supabase
      .from('users')
      .select(`
        id,
        name,
        email,
        phone,
        role,
        created_at,
        doctor_profiles(
          specialisation,
          rating,
          rating_count,
          bio,
          is_listed,
          supported_languages
        )
      `)
      .eq('role', 'doctor')
      .eq('is_archived', false);

    if (error) {
      console.error('❌ Error fetching doctors:', error.message);
      return;
    }

    console.log(`\n✅ Found ${doctors.length} doctors in the database:`);
    console.log('═'.repeat(80));

    doctors.forEach((doctor, index) => {
      console.log(`${index + 1}. 👨‍⚕️ ${doctor.name || 'Unnamed Doctor'}`);
      console.log(`   🆔 ID: ${doctor.id}`);
      console.log(`   📧 Email: ${doctor.email}`);
      console.log(`   📱 Phone: ${doctor.phone || 'Not provided'}`);
      console.log(`   🏷️ Role: ${doctor.role}`);
      console.log(`   📅 Created: ${new Date(doctor.created_at).toLocaleDateString()}`);
      
      // Check if doctor has profile information
      if (doctor.doctor_profiles) {
        const profile = doctor.doctor_profiles;
        console.log(`   🩺 Specialization: ${profile.specialisation || 'Not specified'}`);
        console.log(`   ⭐ Rating: ${profile.rating || 'No ratings'} (${profile.rating_count || 0} reviews)`);
        console.log(`   📋 Listed: ${profile.is_listed ? '✅ Yes' : '❌ No'}`);
        
        if (profile.supported_languages && profile.supported_languages.length > 0) {
          console.log(`   🌐 Languages: ${profile.supported_languages.join(', ')}`);
        }
        
        if (profile.bio) {
          console.log(`   💬 Bio: ${profile.bio.substring(0, 50)}${profile.bio.length > 50 ? '...' : ''}`);
        }
      } else {
        console.log(`   ❌ No doctor profile data`);
      }
      
      console.log('');
    });
  } catch (error) {
    console.error('❌ Exception while fetching doctors:', error.message);
  }
}

async function main() {
  console.log('SOS Tourist Doctor - Database Validation and Doctor Listing');
  console.log('='.repeat(60));
  
  // First validate credentials
  const isValid = await validateCredentials();
  
  if (!isValid) {
    console.log('\n❌ Cannot proceed due to credential validation failure');
    return;
  }
  
  // Test admin credentials
  await testAdminCredentials();
  
  // List all doctors
  await listAllDoctors();
  
  // List all users
  await listAllUsers();
  
  console.log('\n✅ Process completed');
}

// Run the script
main();