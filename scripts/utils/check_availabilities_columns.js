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

async function checkAvailabilitiesColumns() {
  console.log('🔍 Checking availabilities table structure...');
  
  try {
    // Try to get a single record to see what columns exist
    const { data, error } = await supabase
      .from('availabilities')
      .select('*')
      .limit(1);

    if (error) {
      console.log('❌ Error accessing availabilities table:', error.message);
      
      // Try to get column information from the database metadata
      console.log('\n🔍 Trying alternative method to check columns...');
      
      // Try with a simple select query that might work
      const { data: columnData, error: columnError } = await supabase.rpc('execute_sql', {
        sql: `
          SELECT column_name, data_type, is_nullable
          FROM information_schema.columns 
          WHERE table_name = 'availabilities' 
          AND table_schema = 'public'
          ORDER BY ordinal_position
        `
      });

      if (columnError) {
        console.log('❌ Error getting column info:', columnError.message);
      } else {
        console.log('✅ Successfully retrieved column information:');
        if (columnData && columnData.length > 0) {
          console.log('📋 Columns:');
          columnData.forEach(col => {
            console.log(`   - ${col.column_name} (${col.data_type}) ${col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'}`);
          });
        } else {
          console.log('   No column information found');
        }
      }
    } else {
      console.log('✅ Successfully accessed availabilities table');
      if (data && data.length > 0) {
        console.log('📋 Sample record structure:');
        Object.keys(data[0]).forEach(key => {
          console.log(`   - ${key}: ${data[0][key]}`);
        });
      } else {
        console.log('   Table is empty but accessible');
        console.log('   This confirms the table exists but has no data');
      }
    }
    
  } catch (error) {
    console.log('❌ Exception checking availabilities columns:', error.message);
  }
}

checkAvailabilitiesColumns();