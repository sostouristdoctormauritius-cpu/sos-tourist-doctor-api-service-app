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

async function discoverPrescriptions() {
  console.log('🔍 Discovering prescriptions table structure...');
  
  // Try inserting an empty record to see what fields are required
  console.log('\n🧪 Test 1: Inserting empty record...');
  
  try {
    const { data, error } = await supabase
      .from('prescriptions')
      .insert({})
      .select();
      
    if (error) {
      console.log('❌ Error with empty insert:', error.message);
      // Parse error to understand required fields
    } else {
      console.log('✅ Empty insert succeeded');
      
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
    console.log('❌ Exception with empty insert:', error.message);
  }
  
  // Try with common fields that prescriptions tables usually have
  console.log('\n🧪 Test 2: Inserting with common prescription fields...');
  
  try {
    const testRecord = {
      patient_id: '5d73e2f3-fe56-56cd-97ea-d26a4be724ea', // Barbara Garcia
      doctor_id: '41cdfb01-a6e8-5b44-80b4-c232c4723817', // Dr. Alice Johnson
      medication_name: 'Ibuprofen',
      dosage: '200mg',
      frequency: 'Twice daily',
      duration: '7 days'
    };
    
    const { data, error } = await supabase
      .from('prescriptions')
      .insert(testRecord)
      .select();
      
    if (error) {
      console.log('❌ Error with common fields:', error.message);
    } else {
      console.log('✅ Insert with common fields succeeded');
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
    console.log('❌ Exception with common fields:', error.message);
  }
  
  // Try with appointment_id instead of separate doctor/patient IDs
  console.log('\n🧪 Test 3: Inserting with appointment_id...');
  
  try {
    // First get an appointment ID
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
    
    const testRecord = {
      appointment_id: appointment.id,
      medication_name: 'Paracetamol',
      dosage: '500mg',
      frequency: 'Every 6 hours',
      duration: '5 days'
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

discoverPrescriptions();