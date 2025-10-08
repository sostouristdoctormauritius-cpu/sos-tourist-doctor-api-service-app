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

async function testRequiredMedications() {
  console.log('🔍 Testing medications insert with required fields only...');
  
  try {
    // Get a prescription ID
    const { data: prescriptions, error: prescriptionError } = await supabase
      .from('prescriptions')
      .select('id')
      .limit(1);
      
    if (prescriptionError) {
      console.log('❌ Error getting prescription:', prescriptionError.message);
      return;
    }
    
    if (!prescriptions || prescriptions.length === 0) {
      console.log('❌ No prescriptions found');
      return;
    }
    
    const prescriptionId = prescriptions[0].id;
    console.log(`   Using prescription ID: ${prescriptionId}`);
    
    // Try with only required fields based on previous errors
    const testRecord = {
      prescription_id: prescriptionId,
      name: 'Ibuprofen',
      dosage: '200mg',
      duration: '7 days'
    };
    
    const { data, error } = await supabase
      .from('medications')
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
          .from('medications')
          .delete()
          .eq('id', data[0].id);
        console.log('🧹 Cleaned up test record');
      }
    }
  } catch (error) {
    console.log('❌ Exception with required fields:', error.message);
  }
}

testRequiredMedications();