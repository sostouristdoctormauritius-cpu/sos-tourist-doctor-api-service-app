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

async function getAvailabilitiesColumns() {
  try {
    console.log('🔍 Getting availabilities table columns...');
    
    // Try to get column information using RPC or raw SQL
    const { data, error } = await supabase.rpc('execute_sql', {
      sql: `
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'availabilities'
      `
    });

    if (error) {
      console.log('❌ Error getting columns via RPC:', error.message);
      
      // Try another approach
      console.log('\n🔍 Trying to access table with select * to infer structure...');
      
      const { data: sampleData, error: sampleError } = await supabase
        .from('availabilities')
        .select('*')
        .limit(1);
        
      if (sampleError) {
        console.log('❌ Error getting sample data:', sampleError.message);
      } else {
        console.log('✅ Successfully accessed availabilities table');
        if (sampleData && sampleData.length > 0) {
          console.log('📋 Columns detected from sample data:');
          Object.keys(sampleData[0]).forEach(key => {
            console.log(`   - ${key}`);
          });
        } else {
          console.log('   Table is empty but accessible');
        }
      }
    } else {
      console.log('✅ Successfully retrieved column information via RPC');
      console.log('📋 Columns:');
      data.forEach(column => {
        console.log(`   - ${column.column_name} (${column.data_type})`);
      });
    }
    
  } catch (error) {
    console.log('❌ Exception getting columns:', error.message);
  }
}

getAvailabilitiesColumns();