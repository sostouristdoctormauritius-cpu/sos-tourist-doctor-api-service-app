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

async function discoverAvailabilitiesStructure() {
  console.log('🔍 Discovering actual structure of availabilities table...');
  
  try {
    // Try to get column information using a different approach
    const { data, error } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type, is_nullable')
      .eq('table_name', 'availabilities')
      .eq('table_schema', 'public')
      .order('ordinal_position');

    if (error) {
      console.log('❌ Error getting column information:', error.message);
      
      // Try alternative method - insert a minimal record and see what happens
      console.log('\n🧪 Trying to insert minimal record to understand structure...');
      
      // Try with no fields first
      const { data: testData, error: testError } = await supabase
        .from('availabilities')
        .insert({})
        .select();
        
      if (testError) {
        console.log('Error with empty insert:', testError.message);
        // Try to parse the error message to understand required fields
      } else {
        console.log('Empty insert succeeded');
      }
    } else {
      console.log('✅ Successfully retrieved column information:');
      if (data && data.length > 0) {
        console.log('📋 Columns in availabilities table:');
        data.forEach(col => {
          console.log(`   - ${col.column_name} (${col.data_type}) ${col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'}`);
        });
      } else {
        console.log('   No column information found - table might be empty or have no columns');
      }
    }
    
    // Try to get a sample record if any exist
    console.log('\n🔍 Checking for existing records...');
    const { data: sampleData, error: sampleError } = await supabase
      .from('availabilities')
      .select('*')
      .limit(1);
      
    if (sampleError) {
      console.log('❌ Error getting sample data:', sampleError.message);
    } else {
      if (sampleData && sampleData.length > 0) {
        console.log('📋 Sample record structure:');
        Object.keys(sampleData[0]).forEach(key => {
          console.log(`   - ${key}: ${sampleData[0][key]} (type: ${typeof sampleData[0][key]})`);
        });
      } else {
        console.log('   No existing records found');
      }
    }
    
  } catch (error) {
    console.log('❌ Exception during discovery:', error.message);
  }
}

discoverAvailabilitiesStructure();