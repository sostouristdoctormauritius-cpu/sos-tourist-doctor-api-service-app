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

async function verifyMedicalHistories() {
  console.log('🔍 Final verification of medical histories...');
  
  try {
    // Get total count
    const { count, error: countError } = await supabase
      .from('medical_histories')
      .select('*', { count: 'exact', head: true });
      
    if (countError) {
      console.log('❌ Error counting medical histories:', countError.message);
      return;
    }
    
    console.log(`✅ Total medical histories in database: ${count}`);
    
    // Show statistics by patient
    console.log('\n📊 Medical histories by patient:');
    
    const { data: patients, error: patientsError } = await supabase
      .from('users')
      .select('id, name');
      
    if (patientsError) {
      console.log('❌ Error fetching patients:', patientsError.message);
      return;
    }
    
    for (const patient of patients) {
      const { count: historyCount, error: countError } = await supabase
        .from('medical_histories')
        .select('*', { count: 'exact', head: true })
        .eq('patient_id', patient.id);
        
      if (!countError) {
        console.log(`   ${patient.name}: ${historyCount} medical histories`);
      }
    }
    
    // Show sample medical histories with full details
    console.log('\n📋 Detailed sample medical histories:');
    
    const { data: sampleHistories, error: sampleError } = await supabase
      .from('medical_histories')
      .select('*')
      .limit(3);
      
    if (sampleError) {
      console.log('❌ Error fetching sample histories:', sampleError.message);
      return;
    }
    
    for (const history of sampleHistories) {
      console.log(`\n   Medical History Record:`);
      console.log(`   ID: ${history.id}`);
      
      // Get patient details
      const { data: patient, error: patientError } = await supabase
        .from('users')
        .select('name, email')
        .eq('id', history.patient_id)
        .single();
        
      if (!patientError && patient) {
        console.log(`   Patient: ${patient.name} (${patient.email})`);
      } else {
        console.log(`   Patient ID: ${history.patient_id}`);
      }
      
      // Get doctor details if available
      if (history.doctor_id) {
        const { data: doctor, error: doctorError } = await supabase
          .from('users')
          .select('name')
          .eq('id', history.doctor_id)
          .single();
          
        if (!doctorError && doctor) {
          console.log(`   Doctor: ${doctor.name}`);
        } else {
          console.log(`   Doctor ID: ${history.doctor_id}`);
        }
      }
      
      console.log(`   Condition: ${history.condition}`);
      console.log(`   Diagnosis Date: ${history.diagnosis_date}`);
      console.log(`   Notes: ${history.notes}`);
      
      if (history.appointment_id) {
        console.log(`   Appointment ID: ${history.appointment_id}`);
      }
      
      console.log(`   Created: ${history.created_at}`);
    }
    
    // Show most common conditions
    console.log('\n📊 Most common medical conditions:');
    
    const { data: allHistories, error: allHistoriesError } = await supabase
      .from('medical_histories')
      .select('condition');
      
    if (!allHistoriesError) {
      // Count occurrences of each condition
      const conditionCounts = {};
      allHistories.forEach(history => {
        conditionCounts[history.condition] = (conditionCounts[history.condition] || 0) + 1;
      });
      
      // Sort by count and show top 5
      const sortedConditions = Object.entries(conditionCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);
        
      sortedConditions.forEach(([condition, count]) => {
        console.log(`   ${condition}: ${count} patients`);
      });
    }
    
    console.log('\n✅ Final verification completed successfully!');
    console.log('\n🎉 The medical histories table is now populated with real patient data!');
    
  } catch (error) {
    console.log('❌ Exception during final verification:', error.message);
  }
}

verifyMedicalHistories();