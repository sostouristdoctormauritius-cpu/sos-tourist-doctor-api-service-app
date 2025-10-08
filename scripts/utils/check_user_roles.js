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

async function checkUserRoles() {
  console.log('🔍 Checking user roles in the database...');
  
  try {
    // Get distinct roles from users table
    const { data: roles, error: rolesError } = await supabase
      .from('users')
      .select('role')
      .group('role');
      
    if (rolesError) {
      console.log('❌ Error fetching roles:', rolesError.message);
      
      // Try a different approach
      const { data: users, error: usersError } = await supabase
        .from('users')
        .select('role')
        .limit(10);
        
      if (usersError) {
        console.log('❌ Error fetching users:', usersError.message);
        return;
      }
      
      // Extract unique roles
      const uniqueRoles = [...new Set(users.map(user => user.role))];
      console.log('✅ Found roles:', uniqueRoles);
    } else {
      console.log('✅ Found roles:', roles.map(role => role.role));
    }
    
  } catch (error) {
    console.log('❌ Exception checking user roles:', error.message);
  }
}

checkUserRoles();