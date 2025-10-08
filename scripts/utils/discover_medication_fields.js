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

async function discoverMedicationFields() {
  console.log('🔍 Discovering medication-related fields...');
  
  // Get an appointment to use for testing
  const { data: appointments, error: appointmentError } = await supabase
    .from('appointments')
    .select('id, user_id, doctor_id')
    .limit(1);
    
  if (appointmentError) {
    console.log('❌ Error getting appointment:', appointmentError.message);
    return;
  }
  
  if (!appointments || appointments.length === 0) {
    console.log('❌ No appointments found');
    return;
  }
  
  const appointment = appointments[0];
  console.log(`   Using appointment ID: ${appointment.id}`);
  
  // Try common medication field names
  const commonFields = [
    { name: 'medication', value: 'Ibuprofen' },
    { name: 'medication_name', value: 'Ibuprofen' },
    { name: 'drug_name', value: 'Ibuprofen' },
    { name: 'name', value: 'Ibuprofen' }
  ];
  
  for (const field of commonFields) {
    console.log(`\n🧪 Test with field: ${field.name}...`);
    
    try {
      const testRecord = {
        patient_id: appointment.user_id,
        doctor_id: appointment.doctor_id,
        appointment_id: appointment.id,
        [field.name]: field.value
      };
      
      const { data, error } = await supabase
        .from('prescriptions')
        .insert(testRecord)
        .select();
        
      if (error) {
        console.log(`❌ Error with ${field.name}:`, error.message);
      } else {
        console.log(`✅ Insert with ${field.name} succeeded`);
        console.log('Inserted record:', data[0]);
        
        // Clean up
        if (data && data.length > 0) {
          await supabase
            .from('prescriptions')
            .delete()
            .eq('id', data[0].id);
          console.log('🧹 Cleaned up test record');
        }
        break; // Found the correct field name
      }
    } catch (error) {
      console.log(`❌ Exception with ${field.name}:`, error.message);
    }
  }
  
  // Try common dosage field names
  const dosageFields = [
    { name: 'dosage', value: '200mg' },
    { name: 'dose', value: '200mg' },
    { name: 'strength', value: '200mg' }
  ];
  
  for (const field of dosageFields) {
    console.log(`\n🧪 Test with dosage field: ${field.name}...`);
    
    try {
      const testRecord = {
        patient_id: appointment.user_id,
        doctor_id: appointment.doctor_id,
        appointment_id: appointment.id,
        medication: 'Ibuprofen',
        [field.name]: field.value
      };
      
      const { data, error } = await supabase
        .from('prescriptions')
        .insert(testRecord)
        .select();
        
      if (error) {
        console.log(`❌ Error with ${field.name}:`, error.message);
      } else {
        console.log(`✅ Insert with ${field.name} succeeded`);
        console.log('Inserted record:', data[0]);
        
        // Clean up
        if (data && data.length > 0) {
          await supabase
            .from('prescriptions')
            .delete()
            .eq('id', data[0].id);
          console.log('🧹 Cleaned up test record');
        }
        break; // Found the correct field name
      }
    } catch (error) {
      console.log(`❌ Exception with ${field.name}:`, error.message);
    }
  }
}

discoverMedicationFields();