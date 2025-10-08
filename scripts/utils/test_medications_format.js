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

async function testMedicationsFormat() {
  console.log('🔍 Testing medications column format...');
  
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
    
    // Test 1: Try with string value
    console.log('\n🧪 Test 1: Medications as string...');
    
    const testRecord1 = {
      patient_id: appointment.user_id,
      doctor_id: appointment.doctor_id,
      appointment_id: appointment.id,
      medications: 'Ibuprofen 200mg'
    };
    
    const { data: data1, error: error1 } = await supabase
      .from('prescriptions')
      .insert(testRecord1)
      .select();
      
    if (error1) {
      console.log('❌ Error with string format:', error1.message);
    } else {
      console.log('✅ String format succeeded');
      console.log('Inserted record:', data1[0]);
      
      // Clean up
      if (data1 && data1.length > 0) {
        await supabase
          .from('prescriptions')
          .delete()
          .eq('id', data1[0].id);
        console.log('🧹 Cleaned up test record');
      }
    }
    
    // Test 2: Try with JSON object
    console.log('\n🧪 Test 2: Medications as JSON object...');
    
    const testRecord2 = {
      patient_id: appointment.user_id,
      doctor_id: appointment.doctor_id,
      appointment_id: appointment.id,
      medications: {
        name: 'Ibuprofen',
        dosage: '200mg',
        frequency: 'Twice daily',
        duration: '7 days'
      }
    };
    
    const { data: data2, error: error2 } = await supabase
      .from('prescriptions')
      .insert(testRecord2)
      .select();
      
    if (error2) {
      console.log('❌ Error with JSON object format:', error2.message);
    } else {
      console.log('✅ JSON object format succeeded');
      console.log('Inserted record:', data2[0]);
      
      // Clean up
      if (data2 && data2.length > 0) {
        await supabase
          .from('prescriptions')
          .delete()
          .eq('id', data2[0].id);
        console.log('🧹 Cleaned up test record');
      }
    }
    
    // Test 3: Try with JSON array
    console.log('\n🧪 Test 3: Medications as JSON array...');
    
    const testRecord3 = {
      patient_id: appointment.user_id,
      doctor_id: appointment.doctor_id,
      appointment_id: appointment.id,
      medications: [
        {
          name: 'Ibuprofen',
          dosage: '200mg',
          frequency: 'Twice daily',
          duration: '7 days'
        }
      ]
    };
    
    const { data: data3, error: error3 } = await supabase
      .from('prescriptions')
      .insert(testRecord3)
      .select();
      
    if (error3) {
      console.log('❌ Error with JSON array format:', error3.message);
    } else {
      console.log('✅ JSON array format succeeded');
      console.log('Inserted record:', data3[0]);
      
      // Clean up
      if (data3 && data3.length > 0) {
        await supabase
          .from('prescriptions')
          .delete()
          .eq('id', data3[0].id);
        console.log('🧹 Cleaned up test record');
      }
    }
    
  } catch (error) {
    console.log('❌ Exception during testing:', error.message);
  }
}

testMedicationsFormat();