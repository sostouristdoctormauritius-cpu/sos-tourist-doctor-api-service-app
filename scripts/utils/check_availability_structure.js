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

async function checkAvailabilityTableStructure() {
  try {
    console.log('🔍 Checking availability table structure...');
    
    // Try to insert a minimal availability record to see what's required
    const testAvailability = {
      doctor_id: '41cdfb01-a6e8-5b44-80b4-c232c4723817', // Dr. Alice Johnson
      date: '2025-10-08',
      start_time: '09:00:00',
      end_time: '10:00:00'
    };
    
    const { data, error } = await supabase
      .from('availability')
      .insert(testAvailability)
      .select();

    if (error) {
      console.log('❌ Error inserting test availability:', error.message);
      console.log('Details:', error);
      return;
    }

    console.log('✅ Successfully inserted test availability:', data);
    
    // Delete the test availability
    if (data && data.length > 0) {
      const { error: deleteError } = await supabase
        .from('availability')
        .delete()
        .eq('id', data[0].id);
        
      if (deleteError) {
        console.log('❌ Error deleting test availability:', deleteError.message);
      } else {
        console.log('✅ Test availability deleted successfully');
      }
    }
    
    // Try to get column information
    console.log('\n🔍 Getting column information...');
    const { data: columns, error: columnsError } = await supabase
      .from('availability')
      .select('*')
      .limit(0);

    if (columnsError) {
      console.log('❌ Error getting column information:', columnsError.message);
    } else {
      console.log('✅ Successfully accessed availability table');
      console.log('📋 Columns detected:');
      // This should give us column names even if no data
      if (columns && columns.length === 0) {
        // Try a different approach
        const { data: sample, error: sampleError } = await supabase
          .from('availability')
          .select('*')
          .limit(1);
          
        if (!sampleError && sample && sample.length > 0) {
          Object.keys(sample[0]).forEach(key => {
            console.log(`   - ${key}`);
          });
        } else {
          console.log('   No data available to determine columns');
        }
      }
    }
    
  } catch (error) {
    console.log('❌ Exception inserting test availability:', error.message);
  }
}

checkAvailabilityTableStructure();