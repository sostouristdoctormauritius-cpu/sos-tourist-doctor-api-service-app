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

async function insertMinimalPrescription() {
  console.log('🔍 Inserting minimal prescription to examine structure...');
  
  try {
    // Get an appointment to use
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
    
    // Insert minimal record with required fields only
    const minimalRecord = {
      patient_id: appointment.user_id,
      doctor_id: appointment.doctor_id,
      appointment_id: appointment.id
    };
    
    const { data, error } = await supabase
      .from('prescriptions')
      .insert(minimalRecord)
      .select();
      
    if (error) {
      console.log('❌ Error inserting minimal record:', error.message);
      return;
    }
    
    console.log('✅ Minimal record inserted successfully');
    console.log('Inserted record:', data[0]);
    
    // Clean up
    if (data && data.length > 0) {
      await supabase
        .from('prescriptions')
        .delete()
        .eq('id', data[0].id);
      console.log('🧹 Cleaned up test record');
    }
    
  } catch (error) {
    console.log('❌ Exception inserting minimal record:', error.message);
  }
}

insertMinimalPrescription();