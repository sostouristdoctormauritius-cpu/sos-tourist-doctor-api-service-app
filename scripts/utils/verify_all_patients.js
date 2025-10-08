const { createClient } = require('@supabase/supabase-js');

// Supabase configuration with service role key to bypass RLS
const supabaseUrl = 'https://rsbcbiyvkjqsdtlqwibk.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJzYmNiaXl2a2pxc2R0bHF3aWJrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTY4NTI2NiwiZXhwIjoyMDc1MjYxMjY2fQ.uXwokqlWkfj--W64476PTG4OJCpE_sQjlbiArsSOvUo';

// Create Supabase client with service role key to bypass RLS
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false
  }
});

async function verifyAllPatients() {
  console.log('🔍 Verifying all users are now patients...');
  console.log('='.repeat(40));
  
  try {
    // Get all users
    const { data: users, error } = await supabase
      .from('users')
      .select('id, name, email, role')
      .order('name');
      
    if (error) {
      console.log('❌ Error fetching users:', error.message);
      return;
    }
    
    console.log(`✅ Found ${users.length} users in the system`);
    
    // Check if all users have patient role
    const nonPatientUsers = users.filter(user => user.role !== 'patient');
    
    if (nonPatientUsers.length === 0) {
      console.log('🎉 All users have been successfully updated to patient role!');
    } else {
      console.log(`⚠️  Found ${nonPatientUsers.length} users with non-patient roles:`);
      nonPatientUsers.forEach(user => {
        console.log(`   - ${user.name} (${user.email}) - ${user.role}`);
      });
    }
    
    // Show role distribution
    const roleCounts = {};
    users.forEach(user => {
      roleCounts[user.role] = (roleCounts[user.role] || 0) + 1;
    });
    
    console.log('\n📊 Final role distribution:');
    Object.entries(roleCounts).forEach(([role, count]) => {
      console.log(`   ${role}: ${count}`);
    });
    
    // Show sample of patients
    console.log('\n📋 Sample patients:');
    const patientUsers = users.filter(user => user.role === 'patient');
    patientUsers.slice(0, 10).forEach((user, index) => {
      console.log(`   ${index + 1}. ${user.name} (${user.email})`);
    });
    
    if (patientUsers.length > 10) {
      console.log(`   ... and ${patientUsers.length - 10} more patients`);
    }
    
    // Test that we can still query for patients
    console.log('\n🧪 Testing patient queries...');
    
    const { count, error: countError } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'patient');
      
    if (countError) {
      console.log('❌ Error counting patients:', countError.message);
    } else {
      console.log(`✅ Successfully queried patients: ${count} patients found`);
    }
    
    console.log('\n✅ Verification completed successfully!');
    
  } catch (error) {
    console.log('❌ Exception during verification:', error.message);
  }
}

verifyAllPatients();