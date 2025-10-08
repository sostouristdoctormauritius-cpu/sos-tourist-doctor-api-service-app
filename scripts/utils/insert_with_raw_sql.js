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

async function insertWithRawSQL() {
  console.log('🔍 Attempting to insert using raw SQL...');
  
  try {
    // Try to use raw SQL to insert a single test record
    console.log('\n🧪 Inserting test record with raw SQL...');
    
    const sqlQuery = `
      INSERT INTO availabilities (doctor_id, date, start_time, end_time, is_available)
      VALUES ('41cdfb01-a6e8-5b44-80b4-c232c4723817', '2025-11-01', '09:00:00', '10:00:00', true)
      RETURNING *
    `;
    
    // Try to execute the raw SQL
    const { data, error } = await supabase.rpc('execute_sql', {
      sql: sqlQuery
    });

    if (error) {
      console.log('❌ Failed with raw SQL:', error.message);
      
      // Try a different RPC function name that might exist
      console.log('\n🧪 Trying alternative RPC function names...');
      
      const alternativeFunctions = [
        'execute_sql',
        'execute_query',
        'run_sql',
        'sql'
      ];
      
      for (const funcName of alternativeFunctions) {
        try {
          const { data: altData, error: altError } = await supabase.rpc(funcName, {
            sql: sqlQuery
          });
          
          if (altError) {
            console.log(`   ❌ ${funcName}: ${altError.message}`);
          } else {
            console.log(`   ✅ ${funcName}: Success!`);
            console.log('   Inserted record:', altData);
            break;
          }
        } catch (e) {
          console.log(`   ❌ ${funcName}: Exception - ${e.message}`);
        }
      }
    } else {
      console.log('✅ Success with raw SQL!');
      console.log('Inserted record:', data);
    }
    
  } catch (error) {
    console.log('❌ Exception during raw SQL insert:', error.message);
  }
}

insertWithRawSQL();