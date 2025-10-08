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

async function checkPrescriptionsStructure() {
  console.log('🔍 Checking prescriptions table structure...');
  
  try {
    // Try to get column information from information_schema
    const { data: columns, error: columnsError } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type, is_nullable')
      .eq('table_name', 'prescriptions')
      .eq('table_schema', 'public')
      .order('ordinal_position');

    if (columnsError) {
      console.log('❌ Error getting column information:', columnsError.message);
      
      // Try alternative method - check if table exists by selecting from it
      console.log('\n🧪 Trying alternative method...');
      
      const { data: sampleData, error: sampleError } = await supabase
        .from('prescriptions')
        .select('*')
        .limit(1);
        
      if (sampleError) {
        console.log('❌ Error accessing prescriptions table:', sampleError.message);
      } else {
        console.log('✅ Successfully accessed prescriptions table');
        if (sampleData && sampleData.length > 0) {
          console.log('📋 Sample record structure:');
          Object.keys(sampleData[0]).forEach(key => {
            console.log(`   - ${key}`);
          });
        } else {
          console.log('   Table is empty but accessible');
        }
      }
    } else {
      console.log('✅ Successfully retrieved column information:');
      if (columns && columns.length > 0) {
        console.log('📋 Columns in prescriptions table:');
        columns.forEach(col => {
          console.log(`   - ${col.column_name} (${col.data_type}) ${col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'}`);
        });
      } else {
        console.log('   No column information found');
      }
    }
    
  } catch (error) {
    console.log('❌ Exception during exploration:', error.message);
  }
}

checkPrescriptionsStructure();