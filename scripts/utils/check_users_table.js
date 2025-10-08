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

async function checkUsersTable() {
  console.log('🔍 Checking users table structure...');
  
  try {
    // Get information about the role column
    const { data: columns, error: columnsError } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type, is_nullable, column_default')
      .eq('table_name', 'users')
      .eq('column_name', 'role');
      
    if (columnsError) {
      console.log('❌ Error getting role column information:', columnsError.message);
    } else {
      console.log('📋 Role column information:');
      columns.forEach(col => {
        console.log(`   Column: ${col.column_name}`);
        console.log(`   Data Type: ${col.data_type}`);
        console.log(`   Nullable: ${col.is_nullable}`);
        console.log(`   Default: ${col.column_default}`);
      });
    }
    
    // Try to get enum values for the role column if it's an enum
    console.log('\n🔍 Checking role enum values...');
    const { data: enumData, error: enumError } = await supabase.rpc('execute_sql', {
      sql: `
        SELECT enumlabel
        FROM pg_enum e
        JOIN pg_type t ON e.enumtypid = t.oid
        WHERE t.typname = 'user_role_enum'
        ORDER BY e.enumsortorder;
      `
    });
    
    if (enumError) {
      console.log('❌ Error getting enum values:', enumError.message);
      
      // Try alternative method
      const { data: altEnumData, error: altEnumError } = await supabase.rpc('execute_sql', {
        sql: `
          SELECT pg_enum.enumlabel
          FROM pg_enum
          JOIN pg_type ON pg_enum.enumtypid = pg_type.oid
          WHERE pg_type.typname = 'user_role_enum';
        `
      });
      
      if (altEnumError) {
        console.log('❌ Error with alternative method:', altEnumError.message);
      } else {
        console.log('📋 Role enum values (alternative method):');
        if (altEnumData && altEnumData.length > 0) {
          altEnumData.forEach((row, index) => {
            console.log(`   ${index + 1}. ${row.enumlabel}`);
          });
        } else {
          console.log('   No enum values found');
        }
      }
    } else {
      console.log('📋 Role enum values:');
      if (enumData && enumData.length > 0) {
        enumData.forEach((row, index) => {
          console.log(`   ${index + 1}. ${row.enumlabel}`);
        });
      } else {
        console.log('   No enum values found');
      }
    }
    
    // Get sample users to see current roles in use
    console.log('\n📋 Sample users and their roles:');
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, name, role')
      .limit(10);
      
    if (usersError) {
      console.log('❌ Error fetching users:', usersError.message);
    } else {
      users.forEach((user, index) => {
        console.log(`   ${index + 1}. ${user.name} - ${user.role}`);
      });
    }
    
  } catch (error) {
    console.log('❌ Exception during users table check:', error.message);
  }
}

checkUsersTable();