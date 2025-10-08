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

async function checkDatabaseFunctions() {
  try {
    console.log('🔍 Checking available database functions...');
    
    // Try to get functions information
    const { data, error } = await supabase
      .from('pg_proc')
      .select('proname')
      .limit(10);

    if (error) {
      console.log('❌ Error accessing functions info:', error.message);
      
      // Try a different approach
      console.log('\n🔍 Trying alternative method to check functions...');
      
      // Try calling common function names
      const commonFunctions = [
        'insert_availability',
        'create_availability',
        'add_availability',
        'update_availability'
      ];
      
      for (const funcName of commonFunctions) {
        try {
          const { data, error } = await supabase.rpc(funcName, {});
          if (error) {
            console.log(`   ❌ ${funcName}: ${error.message}`);
          } else {
            console.log(`   ✅ ${funcName}: Function exists`);
          }
        } catch (e) {
          console.log(`   ❌ ${funcName}: Exception - ${e.message}`);
        }
      }
    } else {
      console.log('✅ Successfully accessed functions info');
      if (data && data.length > 0) {
        console.log('📋 Sample functions:');
        data.slice(0, 5).forEach(func => {
          console.log(`   - ${func.proname}`);
        });
      } else {
        console.log('   No functions found');
      }
    }
    
  } catch (error) {
    console.log('❌ Exception checking functions:', error.message);
  }
}

checkDatabaseFunctions();