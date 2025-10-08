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

// Common medications with their details
const commonMedications = [
  {
    name: 'Ibuprofen',
    dosage: '200mg',
    frequency: 'Twice daily',
    duration: '7 days',
    description: 'Nonsteroidal anti-inflammatory drug used for treating pain and fever'
  },
  {
    name: 'Paracetamol',
    dosage: '500mg',
    frequency: 'Every 6 hours',
    duration: '5 days',
    description: 'Analgesic and antipyretic medication used to treat pain and fever'
  },
  {
    name: 'Amoxicillin',
    dosage: '500mg',
    frequency: 'Three times daily',
    duration: '10 days',
    description: 'Penicillin antibiotic used to treat bacterial infections'
  },
  {
    name: 'Lisinopril',
    dosage: '10mg',
    frequency: 'Once daily',
    duration: '30 days',
    description: 'ACE inhibitor used to treat high blood pressure and heart failure'
  },
  {
    name: 'Atorvastatin',
    dosage: '20mg',
    frequency: 'Once daily',
    duration: '30 days',
    description: 'Statin used to treat high cholesterol and reduce cardiovascular risk'
  },
  {
    name: 'Metformin',
    dosage: '500mg',
    frequency: 'Twice daily',
    duration: '30 days',
    description: 'Biguanide used to treat type 2 diabetes'
  },
  {
    name: 'Omeprazole',
    dosage: '20mg',
    frequency: 'Once daily before breakfast',
    duration: '14 days',
    description: 'Proton pump inhibitor used to treat gastroesophageal reflux disease'
  },
  {
    name: 'Levothyroxine',
    dosage: '50mcg',
    frequency: 'Once daily on empty stomach',
    duration: '30 days',
    description: 'Thyroid hormone used to treat hypothyroidism'
  },
  {
    name: 'Albuterol',
    dosage: '100mcg',
    frequency: 'As needed for breathing difficulties',
    duration: '30 days',
    description: 'Bronchodilator used to treat asthma and COPD'
  },
  {
    name: 'Cetirizine',
    dosage: '10mg',
    frequency: 'Once daily',
    duration: '7 days',
    description: 'Antihistamine used to treat allergies'
  }
];

// Conditions that might be associated with appointments
const conditions = [
  'Common cold',
  'Seasonal allergies',
  'Mild headache',
  'Muscle pain',
  'Joint pain',
  'Stomach ache',
  'Acute bronchitis',
  'Urinary tract infection',
  'Hypertension',
  'Type 2 diabetes',
  'High cholesterol',
  'Asthma',
  'Hypothyroidism',
  'Gastroesophageal reflux disease',
  'Mild anxiety',
  'Minor depression',
  'Skin rash',
  'Insect bite reaction',
  'Mild fever',
  'Sinus congestion'
];

// Generate prescription data based on appointments
async function generatePrescriptions() {
  console.log('🏥 SOS Tourist Doctor - Generating Prescription Data');
  console.log('='.repeat(50));
  
  try {
    // Get all appointments
    console.log('🔍 Fetching appointments...');
    const { data: appointments, error: appointmentsError } = await supabase
      .from('appointments')
      .select('id, user_id, doctor_id, consultation_type, date')
      .order('date', { ascending: true });
      
    if (appointmentsError) {
      throw new Error(`Error fetching appointments: ${appointmentsError.message}`);
    }
    
    console.log(`✅ Found ${appointments.length} appointments`);
    
    // Generate prescriptions for a subset of appointments (not all appointments result in prescriptions)
    // We'll generate prescriptions for about 70% of appointments
    const prescriptionAppointments = appointments.filter(() => Math.random() < 0.7);
    console.log(`📋 Generating prescriptions for ${prescriptionAppointments.length} appointments`);
    
    // Create prescription data
    const prescriptionData = [];
    
    for (const appointment of prescriptionAppointments) {
      // Randomly select 1-3 medications for this prescription
      const numMedications = Math.floor(Math.random() * 3) + 1; // 1-3 medications
      const medications = [];
      
      // Select unique medications
      const selectedIndices = new Set();
      while (medications.length < numMedications && medications.length < commonMedications.length) {
        const index = Math.floor(Math.random() * commonMedications.length);
        if (!selectedIndices.has(index)) {
          selectedIndices.add(index);
          medications.push(commonMedications[index]);
        }
      }
      
      // Randomly select a condition
      const condition = conditions[Math.floor(Math.random() * conditions.length)];
      
      prescriptionData.push({
        patient_id: appointment.user_id,
        doctor_id: appointment.doctor_id,
        appointment_id: appointment.id,
        medications: medications,
        condition: condition
      });
    }
    
    console.log(`\n📋 Generated ${prescriptionData.length} prescriptions`);
    
    // Display sample prescriptions
    console.log('\n📋 Sample prescriptions:');
    prescriptionData.slice(0, 3).forEach((prescription, index) => {
      console.log(`\n   Prescription ${index + 1}:`);
      console.log(`   Patient ID: ${prescription.patient_id}`);
      console.log(`   Doctor ID: ${prescription.doctor_id}`);
      console.log(`   Appointment ID: ${prescription.appointment_id}`);
      console.log(`   Condition: ${prescription.condition}`);
      console.log(`   Medications:`);
      prescription.medications.forEach((med, medIndex) => {
        console.log(`     ${medIndex + 1}. ${med.name} ${med.dosage} - ${med.frequency} for ${med.duration}`);
      });
    });
    
    // Insert prescriptions into database
    console.log('\n💾 Inserting prescriptions into database...');
    let insertedCount = 0;
    
    for (const prescription of prescriptionData) {
      try {
        const { data, error } = await supabase
          .from('prescriptions')
          .insert({
            patient_id: prescription.patient_id,
            doctor_id: prescription.doctor_id,
            appointment_id: prescription.appointment_id,
            medications: prescription.medications
          })
          .select();
          
        if (error) {
          console.log(`❌ Error inserting prescription: ${error.message}`);
        } else {
          insertedCount++;
        }
      } catch (error) {
        console.log(`❌ Exception inserting prescription: ${error.message}`);
      }
    }
    
    console.log(`\n✅ Successfully inserted ${insertedCount} prescriptions`);
    console.log(`❌ Failed to insert ${prescriptionData.length - insertedCount} prescriptions`);
    
    // Verify insertion
    console.log('\n🔍 Verifying insertion...');
    const { count, error: countError } = await supabase
      .from('prescriptions')
      .select('*', { count: 'exact', head: true });
      
    if (countError) {
      console.log('❌ Error counting prescriptions:', countError.message);
    } else {
      console.log(`✅ Total prescriptions in database: ${count}`);
    }
    
    console.log('\n🎉 Prescription generation completed!');
    
  } catch (error) {
    console.log('❌ Error generating prescriptions:', error.message);
  }
}

generatePrescriptions();