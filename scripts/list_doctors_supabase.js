const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: './.env' });

/**
 * List all doctors using Supabase direct connection
 */
async function listAllDoctorsSupabase() {
  try {
    console.log('🏥 SOS Tourist Doctor - List Doctors via Supabase Direct');
    console.log('═'.repeat(60));
    console.log(`⏰ Started at: ${new Date().toISOString()}`);
    console.log('');

    // Get Supabase credentials from environment
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('❌ Missing Supabase credentials in .env file');
      console.error('Please ensure SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set');
      return;
    }

    console.log('🔗 Connecting to Supabase...');
    console.log(`📡 URL: ${supabaseUrl}`);

    // Create Supabase client with service role key for admin access
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false
      }
    });

    console.log('✅ Connected to Supabase successfully');

    // Query users table for doctors
    console.log('\n👨‍⚕️ Querying doctors from users table...');

    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*')
      .eq('role', 'doctor')
      .eq('is_archived', false);

    if (usersError) {
      console.error('❌ Error querying users:', usersError);
      throw usersError;
    }

    console.log(`📊 Found ${users?.length || 0} doctors in the database`);

    if (!users || users.length === 0) {
      console.log('\n⚠️ No doctors found in the database');
      return;
    }

    console.log('\n👨‍⚕️ Doctor Details:');
    console.log('─'.repeat(100));

    users.forEach((doctor, index) => {
      console.log(`${index + 1}. 🏥 ${doctor.name || 'Unnamed Doctor'}`);
      console.log(`   📧 Email: ${doctor.email}`);
      console.log(`   📱 Phone: ${doctor.phone || 'Not provided'}`);
      console.log(`   🏷️ Role: ${doctor.role}`);
      console.log(`   🆔 User ID: ${doctor.id}`);

      // Check if doctor has profile information
      if (doctor.doctor_profile) {
        const profile = doctor.doctor_profile;
        console.log(`   👁️ Listed: ${profile.is_listed ? '✅ Yes' : '❌ No'}`);

        if (profile.specialisation) {
          console.log(`   🩺 Specialization: ${profile.specialisation}`);
        }

        if (profile.supportedLanguages && Array.isArray(profile.supportedLanguages)) {
          console.log(`   🌐 Languages: ${profile.supportedLanguages.join(', ')}`);
        }
      } else {
        console.log(`   👁️ Listed: ❌ No profile data`);
      }

      console.log('');
    });

    // Try to get additional statistics
    console.log('\n📊 Additional Statistics:');
    console.log('─'.repeat(40));

    // Count total doctors
    const { count: totalDoctors, error: countError } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'doctor')
      .eq('is_archived', false);

    if (!countError) {
      console.log(`👥 Total Doctors: ${totalDoctors}`);
    }

    // Count listed vs unlisted doctors
    const { data: listedDoctors, error: listedError } = await supabase
      .from('users')
      .select('id')
      .eq('role', 'doctor')
      .eq('is_archived', false)
      .eq('doctor_profile->is_listed', true);

    if (!listedError && listedDoctors) {
      console.log(`✅ Listed Doctors: ${listedDoctors.length}`);
      console.log(`❌ Unlisted Doctors: ${(users?.length || 0) - listedDoctors.length}`);
    }

    console.log('\n✨ Query completed successfully!');
    return users;

  } catch (error) {
    console.error('\n❌ Error:', error.message);

    if (error.message.includes('permission denied')) {
      console.error('\n💡 Permission denied. Please check:');
      console.error('   1. SUPABASE_SERVICE_ROLE_KEY is correct');
      console.error('   2. The key has the necessary permissions');
      console.error('   3. Row Level Security (RLS) policies allow access');
    } else if (error.message.includes('JWT')) {
      console.error('\n💡 Authentication error. Please check:');
      console.error('   1. SUPABASE_URL is correct');
      console.error('   2. SUPABASE_SERVICE_ROLE_KEY is valid');
    } else {
      console.error('Stack trace:', error.stack);
    }

    throw error;
  }
}

// Main execution
async function main() {
  try {
    await listAllDoctorsSupabase();
  } catch (error) {
    console.error('\n💥 Script failed:', error.message);
    process.exit(1);
  }
}

// Export for use in other scripts
module.exports = {
  listAllDoctorsSupabase
};

// If script is run directly, execute main function
if (require.main === module) {
  main()
    .then(() => {
      console.log('\n🎉 Execution completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Execution failed:', error.message);
      process.exit(1);
    });
}
