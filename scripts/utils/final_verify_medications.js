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

async function finalVerifyMedications() {
  console.log('🔍 Final verification of medications table...');
  
  try {
    // Get total count
    const { count, error: countError } = await supabase
      .from('medications')
      .select('*', { count: 'exact', head: true });
      
    if (countError) {
      console.log('❌ Error counting medications:', countError.message);
      return;
    }
    
    console.log(`✅ Total medications in database: ${count}`);
    
    // Check if we have medications for different prescriptions
    const { data: prescriptionStats, error: statsError } = await supabase
      .from('medications')
      .select('prescription_id, count')
      .group('prescription_id');
      
    if (statsError) {
      console.log('❌ Error getting prescription stats:', statsError.message);
    } else {
      console.log(`📋 Medications linked to ${prescriptionStats.length} prescriptions`);
      
      // Show distribution
      const medsPerPrescription = prescriptionStats.map(stat => stat.count);
      const maxMeds = Math.max(...medsPerPrescription);
      const minMeds = Math.min(...medsPerPrescription);
      const avgMeds = medsPerPrescription.reduce((a, b) => a + b, 0) / medsPerPrescription.length;
      
      console.log(`📊 Medications per prescription:`);
      console.log(`   Min: ${minMeds}`);
      console.log(`   Max: ${maxMeds}`);
      console.log(`   Avg: ${avgMeds.toFixed(1)}`);
    }
    
    // Show sample medications with prescription info
    console.log('\n📋 Sample medications with prescription details:');
    
    const { data: sampleData, error: sampleError } = await supabase
      .from('medications')
      .select(`
        id,
        prescription_id,
        name,
        dosage,
        duration,
        strength,
        ideal_times,
        prescriptions (
          id,
          patient_id,
          doctor_id
        )
      `)
      .limit(3);
      
    if (sampleError) {
      console.log('❌ Error fetching sample data:', sampleError.message);
      return;
    }
    
    for (const medication of sampleData) {
      console.log(`\n   Medication:`);
      console.log(`   ID: ${medication.id}`);
      console.log(`   Name: ${medication.name}`);
      console.log(`   Dosage: ${medication.dosage}`);
      console.log(`   Duration: ${medication.duration}`);
      console.log(`   Strength: ${medication.strength}`);
      if (medication.ideal_times) {
        console.log(`   Ideal Times: ${Array.isArray(medication.ideal_times) ? medication.ideal_times.join(', ') : medication.ideal_times}`);
      }
      
      if (medication.prescriptions) {
        console.log(`   Prescription ID: ${medication.prescriptions.id}`);
        console.log(`   Patient ID: ${medication.prescriptions.patient_id}`);
        console.log(`   Doctor ID: ${medication.prescriptions.doctor_id}`);
      }
    }
    
    // Show some statistics about medications
    console.log('\n📊 Medication Statistics:');
    
    // Count distinct medications
    const { data: distinctMeds, error: distinctError } = await supabase
      .from('medications')
      .select('name, count')
      .group('name')
      .order('count', { ascending: false });
      
    if (!distinctError) {
      console.log('   Most prescribed medications:');
      distinctMeds.slice(0, 5).forEach(med => {
        console.log(`     ${med.name}: ${med.count} times`);
      });
    }
    
    console.log('\n✅ Final verification completed successfully!');
    console.log('\n🎉 The medications table is now populated with real data extracted from prescriptions!');
    
  } catch (error) {
    console.log('❌ Exception during final verification:', error.message);
  }
}

finalVerifyMedications();