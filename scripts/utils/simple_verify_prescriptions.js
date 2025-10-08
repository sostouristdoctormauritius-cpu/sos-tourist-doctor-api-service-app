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

async function simpleVerifyPrescriptions() {
  console.log('🔍 Simple verification of prescription data...');
  
  try {
    // Get total count
    const { count, error: countError } = await supabase
      .from('prescriptions')
      .select('*', { count: 'exact', head: true });
      
    if (countError) {
      console.log('❌ Error counting prescriptions:', countError.message);
      return;
    }
    
    console.log(`✅ Total prescriptions in database: ${count}`);
    
    // Get sample prescriptions
    const { data: prescriptions, error: prescriptionsError } = await supabase
      .from('prescriptions')
      .select('id, patient_id, doctor_id, appointment_id, medications, created_at')
      .limit(3);
      
    if (prescriptionsError) {
      console.log('❌ Error fetching prescriptions:', prescriptionsError.message);
      return;
    }
    
    console.log('\n📋 Sample prescriptions:');
    prescriptions.forEach((prescription, index) => {
      console.log(`\n   Prescription ${index + 1}:`);
      console.log(`   ID: ${prescription.id}`);
      console.log(`   Patient ID: ${prescription.patient_id}`);
      console.log(`   Doctor ID: ${prescription.doctor_id}`);
      console.log(`   Appointment ID: ${prescription.appointment_id}`);
      console.log(`   Created: ${prescription.created_at}`);
      console.log(`   Medications:`);
      
      if (Array.isArray(prescription.medications)) {
        prescription.medications.forEach((med, medIndex) => {
          console.log(`     ${medIndex + 1}. ${med.name} ${med.dosage || ''}`);
          if (med.frequency) console.log(`        Frequency: ${med.frequency}`);
          if (med.duration) console.log(`        Duration: ${med.duration}`);
        });
      } else {
        console.log(`     ${prescription.medications}`);
      }
    });
    
    console.log('\n✅ Simple verification completed successfully!');
    
  } catch (error) {
    console.log('❌ Exception during verification:', error.message);
  }
}

simpleVerifyPrescriptions();