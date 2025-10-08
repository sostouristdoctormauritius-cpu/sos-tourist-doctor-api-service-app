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

async function simpleCheckRoles() {
  console.log('🔍 Checking user roles in the database...');
  
  try {
    // Get some users to check their roles
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, name, role')
      .limit(10);
      
    if (usersError) {
      console.log('❌ Error fetching users:', usersError.message);
      return;
    }
    
    // Extract unique roles
    const roles = [...new Set(users.map(user => user.role))];
    console.log('✅ Found roles:', roles);
    
    console.log('\n📋 Sample users:');
    users.forEach((user, index) => {
      console.log(`   ${index + 1}. ${user.name} - ${user.role}`);
    });
    
  } catch (error) {
    console.log('❌ Exception checking user roles:', error.message);
  }
}

simpleCheckRoles();