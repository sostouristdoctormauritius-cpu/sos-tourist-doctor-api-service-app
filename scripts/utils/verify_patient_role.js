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

async function verifyPatientRole() {
  console.log('🔍 Verifying patient role setup...');
  console.log('='.repeat(35));
  
  try {
    // Try to create a test patient user
    console.log('\n🧪 Testing patient role creation...');
    
    const testPatient = {
      email: 'test.patient@sospatient.com',
      name: 'Test Patient',
      role: 'patient',
      phone: '+1234567890'
    };
    
    const { data, error } = await supabase
      .from('users')
      .insert(testPatient)
      .select();
      
    if (error) {
      console.log('❌ Patient role is not yet available:', error.message);
      console.log('\n📝 To fix this issue:');
      console.log('   1. Open your Supabase dashboard');
      console.log('   2. Go to the SQL Editor');
      console.log('   3. Run: ALTER TYPE user_role_enum ADD VALUE \'patient\';');
      console.log('   4. Run this script again');
      return;
    }
    
    console.log('✅ Patient role is successfully added!');
    console.log('   Created test patient:');
    console.log(`   - ID: ${data[0].id}`);
    console.log(`   - Name: ${data[0].name}`);
    console.log(`   - Email: ${data[0].email}`);
    console.log(`   - Role: ${data[0].role}`);
    
    // Clean up test patient
    await supabase
      .from('users')
      .delete()
      .eq('id', data[0].id);
    console.log('🧹 Cleaned up test patient');
    
    // List all current roles
    console.log('\n📊 Current roles in the system:');
    const { data: allUsers, error: allUsersError } = await supabase
      .from('users')
      .select('role');
      
    if (allUsersError) {
      console.log('❌ Error fetching users:', allUsersError.message);
    } else {
      const roles = [...new Set(allUsers.map(user => user.role))];
      console.log('   Available roles:', roles);
      
      // Check if 'patient' is among the roles
      if (roles.includes('patient')) {
        console.log('✅ Verification successful: "patient" role is available');
      } else {
        console.log('⚠️  Note: "patient" role was created but may not be in the enum yet');
      }
    }
    
    // Try to query for patients
    console.log('\n📋 Checking for existing patients...');
    const { data: patients, error: patientsError } = await supabase
      .from('users')
      .select('id, name, email, role')
      .eq('role', 'patient');
      
    if (patientsError) {
      console.log('❌ Error querying for patients:', patientsError.message);
    } else {
      console.log(`✅ Found ${patients.length} users with 'patient' role`);
      if (patients.length > 0) {
        console.log('   Patients:');
        patients.forEach((patient, index) => {
          console.log(`     ${index + 1}. ${patient.name} (${patient.email})`);
        });
      }
    }
    
    console.log('\n🎉 Patient role verification completed!');
    
  } catch (error) {
    console.log('❌ Exception during verification:', error.message);
  }
}

verifyPatientRole();