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

async function verifyPrescriptions() {
  console.log('🔍 Verifying prescription data...');
  
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
    
    // Get sample prescriptions with patient and doctor information
    const { data: prescriptions, error: prescriptionsError } = await supabase
      .from('prescriptions')
      .select(`
        id,
        patient_id,
        doctor_id,
        appointment_id,
        medications,
        created_at,
        users (name, email)
      `)
      .limit(5);
      
    if (prescriptionsError) {
      console.log('❌ Error fetching prescriptions:', prescriptionsError.message);
      return;
    }
    
    console.log('\n📋 Sample prescriptions with patient/doctor info:');
    for (const prescription of prescriptions) {
      // Get doctor info
      const { data: doctorData, error: doctorError } = await supabase
        .from('users')
        .select('name, email')
        .eq('id', prescription.doctor_id)
        .single();
        
      // Get patient info
      const { data: patientData, error: patientError } = await supabase
        .from('users')
        .select('name, email')
        .eq('id', prescription.patient_id)
        .single();
        
      console.log(`\n   Prescription ID: ${prescription.id}`);
      console.log(`   Date: ${prescription.created_at}`);
      console.log(`   Doctor: ${doctorData ? doctorData.name : 'Unknown'} (${doctorData ? doctorData.email : prescription.doctor_id})`);
      console.log(`   Patient: ${patientData ? patientData.name : 'Unknown'} (${patientData ? patientData.email : prescription.patient_id})`);
      console.log(`   Medications:`);
      
      if (Array.isArray(prescription.medications)) {
        prescription.medications.forEach((med, index) => {
          console.log(`     ${index + 1}. ${med.name} ${med.dosage || ''} - ${med.frequency || 'As directed'}${med.duration ? ` for ${med.duration}` : ''}`);
        });
      } else {
        console.log(`     ${prescription.medications}`);
      }
    }
    
    // Get statistics
    console.log('\n📊 Prescription Statistics:');
    
    // Prescriptions by doctor
    const { data: doctorStats, error: doctorStatsError } = await supabase
      .from('prescriptions')
      .select('doctor_id, count')
      .group('doctor_id')
      .order('count', { ascending: false });
      
    if (!doctorStatsError && doctorStats.length > 0) {
      console.log('   Prescriptions by doctor:');
      for (const stat of doctorStats.slice(0, 5)) {
        const { data: doctor, error: doctorNameError } = await supabase
          .from('users')
          .select('name')
          .eq('id', stat.doctor_id)
          .single();
          
        console.log(`     ${doctor ? doctor.name : stat.doctor_id}: ${stat.count} prescriptions`);
      }
    }
    
    // Prescriptions by patient
    const { data: patientStats, error: patientStatsError } = await supabase
      .from('prescriptions')
      .select('patient_id, count')
      .group('patient_id')
      .order('count', { ascending: false });
      
    if (!patientStatsError && patientStats.length > 0) {
      console.log('   Prescriptions by patient:');
      for (const stat of patientStats.slice(0, 5)) {
        const { data: patient, error: patientNameError } = await supabase
          .from('users')
          .select('name')
          .eq('id', stat.patient_id)
          .single();
          
        console.log(`     ${patient ? patient.name : stat.patient_id}: ${stat.count} prescriptions`);
      }
    }
    
    console.log('\n✅ Verification completed successfully!');
    
  } catch (error) {
    console.log('❌ Exception during verification:', error.message);
  }
}

verifyPrescriptions();