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

async function correctedPopulateMedications() {
  console.log('💊 SOS Tourist Doctor - Populating Medications Table (Corrected)');
  console.log('='.repeat(55));
  
  try {
    // Get all prescriptions with their medications data
    console.log('🔍 Fetching prescriptions...');
    const { data: prescriptions, error: prescriptionsError } = await supabase
      .from('prescriptions')
      .select('id, medications');
      
    if (prescriptionsError) {
      throw new Error(`Error fetching prescriptions: ${prescriptionsError.message}`);
    }
    
    console.log(`✅ Found ${prescriptions.length} prescriptions`);
    
    // Extract individual medications from prescriptions and insert into medications table
    let totalMedicationsInserted = 0;
    
    console.log('\n💾 Extracting and inserting individual medications...');
    
    for (const prescription of prescriptions) {
      // Check if medications is an array (JSON) or a string
      if (Array.isArray(prescription.medications)) {
        // It's an array of medications
        for (const medication of prescription.medications) {
          try {
            const medicationRecord = {
              prescription_id: prescription.id,
              name: medication.name,
              dosage: medication.dosage || medication.strength || 'As directed',
              duration: medication.duration || 'As directed',
              strength: medication.strength || medication.dosage || 'As directed'
            };
            
            // Handle ideal_times properly as an array
            if (medication.frequency) {
              // Convert string to array if it's not already
              if (typeof medication.frequency === 'string') {
                medicationRecord.ideal_times = [medication.frequency]; // Wrap string in array
              } else if (Array.isArray(medication.frequency)) {
                medicationRecord.ideal_times = medication.frequency;
              }
            }
            
            const { data, error } = await supabase
              .from('medications')
              .insert(medicationRecord)
              .select();
              
            if (error) {
              console.log(`❌ Error inserting medication ${medication.name}: ${error.message}`);
            } else {
              totalMedicationsInserted++;
            }
          } catch (error) {
            console.log(`❌ Exception inserting medication ${medication.name}: ${error.message}`);
          }
        }
      } else if (typeof prescription.medications === 'string') {
        // It's a string, create a simple medication record
        try {
          const medicationRecord = {
            prescription_id: prescription.id,
            name: prescription.medications,
            dosage: 'As directed',
            duration: 'As directed',
            strength: 'As directed'
          };
          
          const { data, error } = await supabase
            .from('medications')
            .insert(medicationRecord)
            .select();
            
          if (error) {
            console.log(`❌ Error inserting medication string: ${error.message}`);
          } else {
            totalMedicationsInserted++;
          }
        } catch (error) {
          console.log(`❌ Exception inserting medication string: ${error.message}`);
        }
      }
      // Small delay to prevent overwhelming the database
      await new Promise(resolve => setTimeout(resolve, 10));
    }
    
    console.log(`\n✅ Successfully inserted ${totalMedicationsInserted} medications`);
    
    // Verify insertion
    console.log('\n🔍 Verifying insertion...');
    const { count, error: countError } = await supabase
      .from('medications')
      .select('*', { count: 'exact', head: true });
      
    if (countError) {
      console.log('❌ Error counting medications:', countError.message);
    } else {
      console.log(`✅ Total medications in database: ${count}`);
    }
    
    // Show sample medications
    console.log('\n📋 Sample medications from database:');
    const { data: sampleMedications, error: sampleError } = await supabase
      .from('medications')
      .select('id, prescription_id, name, dosage, duration, strength, ideal_times')
      .limit(5);
      
    if (sampleError) {
      console.log('❌ Error fetching sample medications:', sampleError.message);
    } else {
      sampleMedications.forEach((med, index) => {
        console.log(`\n   Medication ${index + 1}:`);
        console.log(`   ID: ${med.id}`);
        console.log(`   Prescription ID: ${med.prescription_id}`);
        console.log(`   Name: ${med.name}`);
        console.log(`   Dosage: ${med.dosage}`);
        console.log(`   Duration: ${med.duration}`);
        console.log(`   Strength: ${med.strength}`);
        if (med.ideal_times) {
          console.log(`   Ideal Times: ${Array.isArray(med.ideal_times) ? med.ideal_times.join(', ') : med.ideal_times}`);
        }
      });
    }
    
    console.log('\n🎉 Medications table population completed!');
    
  } catch (error) {
    console.log('❌ Error populating medications table:', error.message);
  }
}

correctedPopulateMedications();