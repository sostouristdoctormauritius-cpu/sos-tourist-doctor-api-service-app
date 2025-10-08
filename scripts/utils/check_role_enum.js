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

async function checkRoleEnum() {
  console.log('🔍 Checking role enum values...');
  
  try {
    // Try to insert a user with a 'patient' role to see if it's valid
    console.log('\n🧪 Testing if "patient" is a valid role...');
    
    // Get a sample user to use as template
    const { data: sampleUser, error: sampleError } = await supabase
      .from('users')
      .select('*')
      .limit(1);
      
    if (sampleError) {
      console.log('❌ Error getting sample user:', sampleError.message);
      return;
    }
    
    if (!sampleUser || sampleUser.length === 0) {
      console.log('❌ No sample user found');
      return;
    }
    
    const userTemplate = sampleUser[0];
    
    // Try to insert a user with patient role
    const testUser = {
      ...userTemplate,
      id: '00000000-0000-0000-0000-000000000000', // Dummy ID
      email: 'test-patient@sospatient.com',
      name: 'Test Patient',
      role: 'patient'
    };
    
    // Remove any auto-generated fields
    delete testUser.created_at;
    delete testUser.updated_at;
    
    const { data, error } = await supabase
      .from('users')
      .insert(testUser)
      .select();
      
    if (error) {
      console.log('❌ "patient" is not a valid role:', error.message);
      
      // Try to parse the error to see what roles are valid
      if (error.message.includes('invalid input value for enum')) {
        console.log('   The error message suggests the valid enum values are in the message');
      }
    } else {
      console.log('✅ "patient" is a valid role!');
      
      // Clean up
      await supabase
        .from('users')
        .delete()
        .eq('id', '00000000-0000-0000-0000-000000000000');
      console.log('🧹 Cleaned up test user');
    }
    
    // Try to get distinct roles from the users table
    console.log('\n📋 Getting distinct roles from users table...');
    
    // Since we can't use group by, let's get all users and deduplicate in code
    const { data: allUsers, error: allUsersError } = await supabase
      .from('users')
      .select('role');
      
    if (allUsersError) {
      console.log('❌ Error getting all users:', allUsersError.message);
    } else {
      // Extract unique roles
      const roles = [...new Set(allUsers.map(user => user.role))];
      console.log('   Distinct roles:', roles);
    }
    
  } catch (error) {
    console.log('❌ Exception during role enum check:', error.message);
  }
}

checkRoleEnum();