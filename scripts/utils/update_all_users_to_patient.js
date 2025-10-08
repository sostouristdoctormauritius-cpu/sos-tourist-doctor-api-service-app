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

async function updateAllUsersToPatient() {
  console.log('🏥 Updating all users to patient role...');
  console.log('='.repeat(40));
  
  try {
    // First, check if 'patient' is a valid role
    console.log('🔍 Checking if "patient" is a valid role...');
    
    const testUser = {
      email: 'test-validation@sospatient.com',
      name: 'Test Validation',
      role: 'patient'
    };
    
    const { data: testData, error: testError } = await supabase
      .from('users')
      .insert(testUser)
      .select();
      
    if (testError) {
      console.log('❌ "patient" is not a valid role:', testError.message);
      console.log('\n📝 Please follow these steps:');
      console.log('   1. Open your Supabase dashboard');
      console.log('   2. Go to the SQL Editor');
      console.log('   3. Run: ALTER TYPE user_role_enum ADD VALUE \'patient\';');
      console.log('   4. Run this script again');
      return;
    }
    
    // Clean up test user
    await supabase
      .from('users')
      .delete()
      .eq('id', testData[0].id);
    console.log('✅ "patient" role is valid');
    
    // Get current users and their roles
    console.log('\n📋 Current users and roles:');
    const { data: currentUsers, error: fetchError } = await supabase
      .from('users')
      .select('id, name, email, role');
      
    if (fetchError) {
      console.log('❌ Error fetching current users:', fetchError.message);
      return;
    }
    
    console.log(`Found ${currentUsers.length} users:`);
    const roleCount = {};
    currentUsers.forEach(user => {
      roleCount[user.role] = (roleCount[user.role] || 0) + 1;
      console.log(`   - ${user.name} (${user.email}) - ${user.role}`);
    });
    
    console.log('\n📊 Role distribution before update:');
    Object.entries(roleCount).forEach(([role, count]) => {
      console.log(`   ${role}: ${count}`);
    });
    
    // Update all users to patient role
    console.log('\n🔄 Updating all users to patient role...');
    
    // We need to update each user individually since we can't do a bulk update
    // of the role field due to enum constraints
    let updatedCount = 0;
    for (const user of currentUsers) {
      // Skip users that are already patients
      if (user.role === 'patient') {
        console.log(`   Skipping ${user.name} (already patient)`);
        continue;
      }
      
      const { data, error } = await supabase
        .from('users')
        .update({ role: 'patient' })
        .eq('id', user.id);
        
      if (error) {
        console.log(`❌ Error updating ${user.name}:`, error.message);
      } else {
        console.log(`   ✅ Updated ${user.name} from ${user.role} to patient`);
        updatedCount++;
      }
    }
    
    console.log(`\n✅ Successfully updated ${updatedCount} users to patient role`);
    
    // Verify the update
    console.log('\n🔍 Verifying update...');
    const { data: updatedUsers, error: verifyError } = await supabase
      .from('users')
      .select('id, name, email, role');
      
    if (verifyError) {
      console.log('❌ Error verifying update:', verifyError.message);
      return;
    }
    
    const updatedRoleCount = {};
    updatedUsers.forEach(user => {
      updatedRoleCount[user.role] = (updatedRoleCount[user.role] || 0) + 1;
    });
    
    console.log('📊 Role distribution after update:');
    Object.entries(updatedRoleCount).forEach(([role, count]) => {
      console.log(`   ${role}: ${count}`);
    });
    
    if (updatedRoleCount['patient'] === updatedUsers.length) {
      console.log('\n🎉 All users successfully updated to patient role!');
    } else {
      console.log('\n⚠️  Some users may not have been updated. Please check the logs above.');
    }
    
  } catch (error) {
    console.log('❌ Exception during update process:', error.message);
  }
}

updateAllUsersToPatient();