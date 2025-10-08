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

async function exploreAvailabilitiesTable() {
  try {
    console.log('🔍 Exploring availabilities table structure...');
    
    // Try to get any data from the table to understand its structure
    const { data, error } = await supabase
      .from('availabilities')
      .select('*')
      .limit(5);

    if (error) {
      console.log('❌ Error accessing availabilities table:', error.message);
      return;
    }

    console.log('✅ Successfully accessed availabilities table');
    
    if (data && data.length > 0) {
      console.log(`📋 Found ${data.length} records in the table`);
      console.log('📋 Sample record structure:');
      Object.keys(data[0]).forEach(key => {
        console.log(`   - ${key}: ${data[0][key]}`);
      });
    } else {
      console.log('   Table is empty');
      
      // Try to insert a minimal record to see what fields are required
      console.log('\n🔍 Testing minimal insert...');
      
      // Try with just doctor_id
      const testRecord = {
        doctor_id: '41cdfb01-a6e8-5b44-80b4-c232c4723817' // Dr. Alice Johnson
      };
      
      const { data: insertData, error: insertError } = await supabase
        .from('availabilities')
        .insert(testRecord)
        .select();
        
      if (insertError) {
        console.log('❌ Error with minimal insert:', insertError.message);
      } else {
        console.log('✅ Minimal insert successful');
        console.log('Inserted record:', insertData);
        
        // Clean up
        if (insertData && insertData.length > 0) {
          await supabase
            .from('availabilities')
            .delete()
            .eq('id', insertData[0].id);
        }
      }
    }
    
  } catch (error) {
    console.log('❌ Exception exploring availabilities table:', error.message);
  }
}

exploreAvailabilitiesTable();