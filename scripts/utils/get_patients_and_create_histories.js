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

// Common medical conditions
const commonConditions = [
  'Hypertension',
  'Type 2 Diabetes',
  'Asthma',
  'Allergic Rhinitis',
  'Migraine',
  'Depression',
  'Anxiety',
  'Hyperlipidemia',
  'Gastroesophageal Reflux Disease',
  'Osteoarthritis',
  'Hypothyroidism',
  'Urinary Tract Infection',
  'Sinusitis',
  'Back Pain',
  'Allergies',
  'Seasonal Allergies',
  'Common Cold',
  'Influenza',
  'Bronchitis',
  'Eczema'
];

// Common medications
const commonMedications = [
  'Lisinopril',
  'Metformin',
  'Albuterol',
  'Cetirizine',
  'Sumatriptan',
  'Sertraline',
  'Loratadine',
  'Atorvastatin',
  'Omeprazole',
  'Ibuprofen',
  'Acetaminophen',
  'Levothyroxine',
  'Amoxicillin',
  'Prednisone',
  'Fluticasone'
];

// Common allergies
const commonAllergies = [
  'Penicillin',
  'Peanuts',
  'Shellfish',
  'Latex',
  'Dust Mites',
  'Pollen',
  'Mold',
  'Pet Dander',
  'Eggs',
  'Milk',
  'Soy',
  'Wheat',
  'Tree Nuts',
  'Fish',
  'Sulfa Drugs'
];

// Family history conditions
const familyHistoryConditions = [
  'Heart Disease',
  'Diabetes',
  'Cancer',
  'Stroke',
  'Alzheimer\'s Disease',
  'High Blood Pressure',
  'High Cholesterol',
  'Obesity',
  'Depression',
  'Asthma'
];

async function getPatientsAndCreateHistories() {
  console.log('🏥 SOS Tourist Doctor - Creating Medical Histories for Patients');
  console.log('='.repeat(60));
  
  try {
    // Get all patients (users with role 'patient')
    console.log('🔍 Fetching patients...');
    const { data: patients, error: patientsError } = await supabase
      .from('users')
      .select('id, name, email')
      .eq('role', 'patient');
      
    if (patientsError) {
      throw new Error(`Error fetching patients: ${patientsError.message}`);
    }
    
    console.log(`✅ Found ${patients.length} patients`);
    
    // Display patients
    console.log('\n📋 Patients:');
    patients.forEach((patient, index) => {
      console.log(`   ${index + 1}. ${patient.name} (${patient.email}) - ${patient.id}`);
    });
    
    // Create medical histories for each patient
    console.log('\n💾 Creating medical histories...');
    let totalHistoriesCreated = 0;
    
    for (const patient of patients) {
      console.log(`\n👨‍⚕️ Creating history for ${patient.name}...`);
      
      // Generate a random number of conditions (1-4) for each patient
      const numConditions = Math.floor(Math.random() * 4) + 1;
      const patientConditions = [];
      
      // Select unique conditions
      const selectedIndices = new Set();
      while (patientConditions.length < numConditions && patientConditions.length < commonConditions.length) {
        const index = Math.floor(Math.random() * commonConditions.length);
        if (!selectedIndices.has(index)) {
          selectedIndices.add(index);
          patientConditions.push(commonConditions[index]);
        }
      }
      
      // Create medical history records for each condition
      for (const condition of patientConditions) {
        try {
          // Randomly decide if we should link to a doctor and appointment
          let doctorId = null;
          let appointmentId = null;
          
          // 70% chance to link to a doctor
          if (Math.random() < 0.7) {
            // Get a random doctor
            const { data: doctors, error: doctorsError } = await supabase
              .from('users')
              .select('id')
              .eq('role', 'doctor')
              .limit(1)
              .offset(Math.floor(Math.random() * 10)); // Random offset (assuming we have at least 10 doctors)
              
            if (!doctorsError && doctors && doctors.length > 0) {
              doctorId = doctors[0].id;
            }
          }
          
          // 50% chance to link to an appointment
          if (Math.random() < 0.5) {
            // Get a random appointment for this patient
            const { data: appointments, error: appointmentsError } = await supabase
              .from('appointments')
              .select('id')
              .eq('user_id', patient.id)
              .limit(1)
              .offset(Math.floor(Math.random() * 5)); // Random offset
              
            if (!appointmentsError && appointments && appointments.length > 0) {
              appointmentId = appointments[0].id;
            }
          }
          
          // Generate notes based on condition
          const notesTemplates = [
            `Patient presents with ${condition.toLowerCase()}. Treatment plan initiated.`,
            `Diagnosed with ${condition.toLowerCase()}. Monitoring progress.`,
            `${condition} diagnosed. Prescribed appropriate medication.`,
            `Follow-up required for ${condition.toLowerCase()} management.`,
            `Patient reports symptoms consistent with ${condition.toLowerCase()}.`
          ];
          
          const notes = notesTemplates[Math.floor(Math.random() * notesTemplates.length)];
          
          // Generate diagnosis date (within the last 10 years)
          const diagnosisDate = new Date();
          diagnosisDate.setFullYear(diagnosisDate.getFullYear() - Math.floor(Math.random() * 10));
          diagnosisDate.setMonth(Math.floor(Math.random() * 12));
          diagnosisDate.setDate(Math.floor(Math.random() * 28) + 1);
          const diagnosisDateString = diagnosisDate.toISOString().split('T')[0];
          
          // Create medical history record
          const medicalHistoryRecord = {
            patient_id: patient.id,
            doctor_id: doctorId,
            appointment_id: appointmentId,
            condition: condition,
            diagnosis_date: diagnosisDateString,
            notes: notes
          };
          
          const { data, error } = await supabase
            .from('medical_histories')
            .insert(medicalHistoryRecord)
            .select();
            
          if (error) {
            console.log(`❌ Error creating history for ${condition}: ${error.message}`);
          } else {
            totalHistoriesCreated++;
          }
        } catch (error) {
          console.log(`❌ Exception creating history for ${condition}: ${error.message}`);
        }
      }
      
      console.log(`   Created ${patientConditions.length} medical history records`);
    }
    
    console.log(`\n✅ Successfully created ${totalHistoriesCreated} medical history records`);
    
    // Verify insertion
    console.log('\n🔍 Verifying insertion...');
    const { count, error: countError } = await supabase
      .from('medical_histories')
      .select('*', { count: 'exact', head: true });
      
    if (countError) {
      console.log('❌ Error counting medical histories:', countError.message);
    } else {
      console.log(`✅ Total medical histories in database: ${count}`);
    }
    
    // Show sample medical histories
    console.log('\n📋 Sample medical histories from database:');
    const { data: sampleHistories, error: sampleError } = await supabase
      .from('medical_histories')
      .select(`
        id,
        patient_id,
        doctor_id,
        appointment_id,
        condition,
        diagnosis_date,
        notes,
        users (name)
      `)
      .limit(3);
      
    if (sampleError) {
      console.log('❌ Error fetching sample histories:', sampleError.message);
    } else {
      sampleHistories.forEach((history, index) => {
        console.log(`\n   Medical History ${index + 1}:`);
        console.log(`   ID: ${history.id}`);
        console.log(`   Patient ID: ${history.patient_id}`);
        console.log(`   Condition: ${history.condition}`);
        console.log(`   Diagnosis Date: ${history.diagnosis_date}`);
        console.log(`   Notes: ${history.notes}`);
        if (history.doctor_id) {
          console.log(`   Doctor ID: ${history.doctor_id}`);
        }
        if (history.appointment_id) {
          console.log(`   Appointment ID: ${history.appointment_id}`);
        }
      });
    }
    
    console.log('\n🎉 Medical histories creation completed!');
    
  } catch (error) {
    console.log('❌ Error creating medical histories:', error.message);
  }
}

getPatientsAndCreateHistories();