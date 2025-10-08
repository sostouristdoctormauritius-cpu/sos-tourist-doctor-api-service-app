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

async function exploreMedications() {
  console.log('🔍 Exploring medications table structure...');
  
  try {
    // Try to access the medications table
    const { data: sampleData, error: sampleError } = await supabase
      .from('medications')
      .select('*')
      .limit(1);

    if (sampleError) {
      console.log('❌ Error accessing medications table:', sampleError.message);
      
      // Try to check if the table exists by attempting to insert a minimal record
      console.log('\n🧪 Testing medications table existence...');
      
      const { data: testData, error: testError } = await supabase
        .from('medications')
        .insert({})
        .select();
        
      if (testError) {
        console.log('❌ Error with test insert:', testError.message);
        // Try to parse error to understand required fields
      } else {
        console.log('✅ Test insert succeeded');
        if (testData && testData.length > 0) {
          console.log('📋 Test record structure:');
          Object.keys(testData[0]).forEach(key => {
            console.log(`   - ${key}`);
          });
        }
      }
    } else {
      console.log('✅ Successfully accessed medications table');
      if (sampleData && sampleData.length > 0) {
        console.log('📋 Sample record structure:');
        Object.keys(sampleData[0]).forEach(key => {
          console.log(`   - ${key}`);
        });
      } else {
        console.log('   Table is empty but accessible');
      }
    }
    
  } catch (error) {
    console.log('❌ Exception during exploration:', error.message);
  }
}

exploreMedications();