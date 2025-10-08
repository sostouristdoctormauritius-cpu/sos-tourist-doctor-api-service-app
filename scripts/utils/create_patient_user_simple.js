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

async function createPatientUserSimple() {
  console.log('🏥 Creating a patient user with known fields...');
  
  try {
    // Try to create a patient user with the 'user' role
    console.log('\n🧪 Creating a user with "user" role...');
    
    const patientUser = {
      email: 'alice.brown@sospatient.com',
      name: 'Alice Brown',
      role: 'user'
    };
    
    const { data, error } = await supabase
      .from('users')
      .insert(patientUser)
      .select();
      
    if (error) {
      console.log('❌ Error creating user with "user" role:', error.message);
    } else {
      console.log('✅ Successfully created user with "user" role:');
      console.log('   ID:', data[0].id);
      console.log('   Name:', data[0].name);
      console.log('   Email:', data[0].email);
      console.log('   Role:', data[0].role);
      
      // Clean up
      await supabase
        .from('users')
        .delete()
        .eq('id', data[0].id);
      console.log('🧹 Cleaned up test user');
    }
    
    // Try to create a patient user with the 'patient' role
    console.log('\n🧪 Creating a user with "patient" role...');
    
    const patientUser2 = {
      email: 'barbara.garcia@sospatient.com',
      name: 'Barbara Garcia',
      role: 'patient'
    };
    
    const { data: data2, error: error2 } = await supabase
      .from('users')
      .insert(patientUser2)
      .select();
      
    if (error2) {
      console.log('❌ Error creating user with "patient" role:', error2.message);
      console.log('   This confirms that "patient" is not a valid role enum value');
    } else {
      console.log('✅ Successfully created user with "patient" role:');
      console.log('   ID:', data2[0].id);
      console.log('   Name:', data2[0].name);
      console.log('   Email:', data2[0].email);
      console.log('   Role:', data2[0].role);
      
      // Clean up
      await supabase
        .from('users')
        .delete()
        .eq('id', data2[0].id);
      console.log('🧹 Cleaned up test user');
    }
    
    // Let's check what fields actually exist in the users table
    console.log('\n🔍 Checking users table fields...');
    
    const { data: sampleUser, error: sampleError } = await supabase
      .from('users')
      .select('*')
      .limit(1);
      
    if (sampleError) {
      console.log('❌ Error getting sample user:', sampleError.message);
    } else if (sampleUser && sampleUser.length > 0) {
      console.log('📋 Fields in users table:');
      Object.keys(sampleUser[0]).forEach(key => {
        console.log(`   - ${key}`);
      });
    }
    
  } catch (error) {
    console.log('❌ Exception during patient user creation:', error.message);
  }
}

createPatientUserSimple();