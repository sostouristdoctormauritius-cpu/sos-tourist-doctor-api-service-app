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

async function furtherDiscoverPrescriptions() {
  console.log('🔍 Further discovering prescriptions table structure...');
  
  // We know it has patient_id, let's try with just that and see what else is required
  console.log('\n🧪 Test with only patient_id...');
  
  try {
    const testRecord = {
      patient_id: '5d73e2f3-fe56-56cd-97ea-d26a4be724ea' // Barbara Garcia
    };
    
    const { data, error } = await supabase
      .from('prescriptions')
      .insert(testRecord)
      .select();
      
    if (error) {
      console.log('❌ Error with patient_id only:', error.message);
      // Look for other required fields in the error
    } else {
      console.log('✅ Insert with patient_id only succeeded');
      console.log('Inserted record:', data[0]);
      
      // Clean up
      if (data && data.length > 0) {
        await supabase
          .from('prescriptions')
          .delete()
          .eq('id', data[0].id);
        console.log('🧹 Cleaned up test record');
      }
    }
  } catch (error) {
    console.log('❌ Exception with patient_id only:', error.message);
  }
  
  // Try with patient_id and doctor_id
  console.log('\n🧪 Test with patient_id and doctor_id...');
  
  try {
    const testRecord = {
      patient_id: '5d73e2f3-fe56-56cd-97ea-d26a4be724ea', // Barbara Garcia
      doctor_id: '41cdfb01-a6e8-5b44-80b4-c232c4723817' // Dr. Alice Johnson
    };
    
    const { data, error } = await supabase
      .from('prescriptions')
      .insert(testRecord)
      .select();
      
    if (error) {
      console.log('❌ Error with patient_id and doctor_id:', error.message);
    } else {
      console.log('✅ Insert with patient_id and doctor_id succeeded');
      console.log('Inserted record:', data[0]);
      
      // Clean up
      if (data && data.length > 0) {
        await supabase
          .from('prescriptions')
          .delete()
          .eq('id', data[0].id);
        console.log('🧹 Cleaned up test record');
      }
    }
  } catch (error) {
    console.log('❌ Exception with patient_id and doctor_id:', error.message);
  }
  
  // Try with patient_id, doctor_id, and medication_name
  console.log('\n🧪 Test with patient_id, doctor_id, and medication_name...');
  
  try {
    const testRecord = {
      patient_id: '5d73e2f3-fe56-56cd-97ea-d26a4be724ea', // Barbara Garcia
      doctor_id: '41cdfb01-a6e8-5b44-80b4-c232c4723817', // Dr. Alice Johnson
      medication_name: 'Amoxicillin'
    };
    
    const { data, error } = await supabase
      .from('prescriptions')
      .insert(testRecord)
      .select();
      
    if (error) {
      console.log('❌ Error with medication_name:', error.message);
    } else {
      console.log('✅ Insert with medication_name succeeded');
      console.log('Inserted record:', data[0]);
      
      // Clean up
      if (data && data.length > 0) {
        await supabase
          .from('prescriptions')
          .delete()
          .eq('id', data[0].id);
        console.log('🧹 Cleaned up test record');
      }
    }
  } catch (error) {
    console.log('❌ Exception with medication_name:', error.message);
  }
  
  // Try with appointment_id instead of separate IDs
  console.log('\n🧪 Test with appointment_id...');
  
  try {
    // Get an appointment ID
    const { data: appointments, error: appointmentError } = await supabase
      .from('appointments')
      .select('id')
      .limit(1);
      
    if (appointmentError) {
      console.log('❌ Error getting appointment:', appointmentError.message);
      return;
    }
    
    if (!appointments || appointments.length === 0) {
      console.log('❌ No appointments found');
      return;
    }
    
    const appointmentId = appointments[0].id;
    console.log(`   Using appointment ID: ${appointmentId}`);
    
    const testRecord = {
      appointment_id: appointmentId,
      medication_name: 'Ciprofloxacin'
    };
    
    const { data, error } = await supabase
      .from('prescriptions')
      .insert(testRecord)
      .select();
      
    if (error) {
      console.log('❌ Error with appointment_id:', error.message);
    } else {
      console.log('✅ Insert with appointment_id succeeded');
      console.log('Inserted record:', data[0]);
      
      // Clean up
      if (data && data.length > 0) {
        await supabase
          .from('prescriptions')
          .delete()
          .eq('id', data[0].id);
        console.log('🧹 Cleaned up test record');
      }
    }
  } catch (error) {
    console.log('❌ Exception with appointment_id:', error.message);
  }
}

furtherDiscoverPrescriptions();