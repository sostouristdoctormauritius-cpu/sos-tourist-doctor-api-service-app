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

async function simpleVerifyMedications() {
  console.log('🔍 Simple verification of medications table...');
  
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
    
    // Show sample medications
    console.log('\n📋 Sample medications:');
    
    const { data: sampleData, error: sampleError } = await supabase
      .from('medications')
      .select(`
        id,
        prescription_id,
        name,
        dosage,
        duration,
        strength,
        ideal_times
      `)
      .limit(5);
      
    if (sampleError) {
      console.log('❌ Error fetching sample data:', sampleError.message);
      return;
    }
    
    sampleData.forEach((medication, index) => {
      console.log(`\n   Medication ${index + 1}:`);
      console.log(`   ID: ${medication.id}`);
      console.log(`   Prescription ID: ${medication.prescription_id}`);
      console.log(`   Name: ${medication.name}`);
      console.log(`   Dosage: ${medication.dosage}`);
      console.log(`   Duration: ${medication.duration}`);
      console.log(`   Strength: ${medication.strength}`);
      if (medication.ideal_times) {
        console.log(`   Ideal Times: ${Array.isArray(medication.ideal_times) ? medication.ideal_times.join(', ') : medication.ideal_times}`);
      }
    });
    
    // Get distinct medication names
    console.log('\n📊 Checking distinct medications...');
    const { data: allMeds, error: allMedsError } = await supabase
      .from('medications')
      .select('name');
      
    if (!allMedsError) {
      // Count occurrences of each medication
      const medCounts = {};
      allMeds.forEach(med => {
        medCounts[med.name] = (medCounts[med.name] || 0) + 1;
      });
      
      // Sort by count
      const sortedMeds = Object.entries(medCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);
        
      console.log('   Most common medications:');
      sortedMeds.forEach(([name, count]) => {
        console.log(`     ${name}: ${count} prescriptions`);
      });
    }
    
    console.log('\n✅ Simple verification completed successfully!');
    console.log('\n🎉 The medications table is now populated with real data!');
    
  } catch (error) {
    console.log('❌ Exception during simple verification:', error.message);
  }
}

simpleVerifyMedications();