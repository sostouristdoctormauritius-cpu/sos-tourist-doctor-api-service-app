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

async function testMedicalHistories() {
  console.log('🔍 Testing medical histories insert...');
  
  try {
    // Try with required fields
    const testRecord = {
      patient_id: '5d73e2f3-fe56-56cd-97ea-d26a4be724ea', // Barbara Garcia
      condition: 'Hypertension'
    };
    
    const { data, error } = await supabase
      .from('medical_histories')
      .insert(testRecord)
      .select();
      
    if (error) {
      console.log('❌ Error with required fields:', error.message);
    } else {
      console.log('✅ Insert with required fields succeeded');
      console.log('Inserted record:', data[0]);
      
      // Clean up
      if (data && data.length > 0) {
        await supabase
          .from('medical_histories')
          .delete()
          .eq('id', data[0].id);
        console.log('🧹 Cleaned up test record');
      }
    }
  } catch (error) {
    console.log('❌ Exception with required fields:', error.message);
  }
  
  // Try with additional fields
  console.log('\n🧪 Test with additional fields...');
  
  try {
    const testRecord = {
      patient_id: '5d73e2f3-fe56-56cd-97ea-d26a4be724ea', // Barbara Garcia
      condition: 'Diabetes',
      diagnosis_date: '2020-05-15',
      notes: 'Type 2 diabetes, well controlled with medication'
    };
    
    const { data, error } = await supabase
      .from('medical_histories')
      .insert(testRecord)
      .select();
      
    if (error) {
      console.log('❌ Error with additional fields:', error.message);
    } else {
      console.log('✅ Insert with additional fields succeeded');
      console.log('Inserted record:', data[0]);
      
      // Clean up
      if (data && data.length > 0) {
        await supabase
          .from('medical_histories')
          .delete()
          .eq('id', data[0].id);
        console.log('🧹 Cleaned up test record');
      }
    }
  } catch (error) {
    console.log('❌ Exception with additional fields:', error.message);
  }
}

testMedicalHistories();