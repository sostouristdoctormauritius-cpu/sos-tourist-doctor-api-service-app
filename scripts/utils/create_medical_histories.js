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

// Notes templates for different conditions
const notesTemplates = {
  'Hypertension': [
    'Patient presents with elevated blood pressure readings. Started on ACE inhibitor therapy.',
    'Monitor blood pressure regularly. Lifestyle modifications recommended.',
    'Hypertension well controlled with current medication regimen.',
    'Patient needs to reduce sodium intake and increase physical activity.'
  ],
  'Type 2 Diabetes': [
    'Diagnosed with Type 2 Diabetes. Started on metformin therapy.',
    'Blood glucose levels monitored. Dietary consultation recommended.',
    'Patient educated on carbohydrate counting and blood sugar monitoring.',
    'HbA1c levels within target range. Continue current treatment plan.'
  ],
  'Asthma': [
    'Patient reports intermittent wheezing and shortness of breath.',
    'Prescribed bronchodilator inhaler for as-needed use.',
    'Asthma action plan provided. Follow up in 3 months.',
    'Symptoms well controlled with current inhaler regimen.'
  ],
  'Allergic Rhinitis': [
    'Patient experiences seasonal nasal congestion and sneezing.',
    'Prescribed antihistamine for symptom relief.',
    'Allergy testing recommended to identify specific triggers.',
    'Symptoms improve with antihistamine use. Continue as directed.'
  ],
  'Migraine': [
    'Patient reports recurrent severe headaches with photophobia.',
    'Started on prophylactic medication. Abortive therapy for acute episodes.',
    'Patient keeps headache diary to track triggers and frequency.',
    'Migraine frequency reduced with current treatment regimen.'
  ],
  'Depression': [
    'Patient reports persistent low mood and anhedonia.',
    'Started on SSRI antidepressant. Referral to mental health specialist.',
    'Patient attending regular counseling sessions.',
    'Mood has improved significantly. Continue current treatment.'
  ],
  'Anxiety': [
    'Patient experiences excessive worry and restlessness.',
    'Started on anti-anxiety medication. Cognitive behavioral therapy recommended.',
    'Patient learning relaxation techniques and coping strategies.',
    'Anxiety symptoms well managed with current treatment plan.'
  ],
  'Hyperlipidemia': [
    'Elevated cholesterol levels noted on routine blood work.',
    'Started on statin therapy. Dietary modifications recommended.',
    'Lipid panel improving with medication and lifestyle changes.',
    'Cholesterol levels within target range. Continue current regimen.'
  ],
  'Gastroesophageal Reflux Disease': [
    'Patient reports frequent heartburn and acid reflux.',
    'Prescribed proton pump inhibitor. Lifestyle modifications advised.',
    'Symptoms significantly improved with current medication.',
    'GERD well controlled. Continue PPI as directed.'
  ],
  'Osteoarthritis': [
    'Patient reports joint pain and stiffness, especially in knees.',
    'Prescribed NSAID for pain relief. Physical therapy referral.',
    'Patient using assistive devices as needed for mobility.',
    'Pain well controlled with current treatment regimen.'
  ]
};

// Default notes for conditions not specifically listed
const defaultNotes = [
  'Patient presents with condition. Treatment plan initiated.',
  'Diagnosed with condition. Monitoring progress.',
  'Condition diagnosed. Prescribed appropriate medication.',
  'Follow-up required for condition management.',
  'Patient reports symptoms consistent with condition.'
];

async function createMedicalHistories() {
  console.log('🏥 SOS Tourist Doctor - Creating Medical Histories for Patients');
  console.log('='.repeat(60));
  
  try {
    // Get patients from appointments
    console.log('🔍 Identifying patients from appointments...');
    const { data: appointments, error: appointmentsError } = await supabase
      .from('appointments')
      .select('user_id');
      
    if (appointmentsError) {
      throw new Error(`Error fetching appointments: ${appointmentsError.message}`);
    }
    
    // Extract unique patient IDs
    const patientIds = [...new Set(appointments.map(appt => appt.user_id))];
    console.log(`✅ Found ${patientIds.length} unique patients`);
    
    // Get patient details
    const patients = [];
    for (const patientId of patientIds) {
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('id, name, email')
        .eq('id', patientId)
        .single();
        
      if (!userError && user) {
        patients.push(user);
      }
    }
    
    console.log('\n📋 Patients:');
    patients.forEach((patient, index) => {
      console.log(`   ${index + 1}. ${patient.name} (${patient.email})`);
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
              .limit(1);
              
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
              .limit(1);
              
            if (!appointmentsError && appointments && appointments.length > 0) {
              appointmentId = appointments[0].id;
            }
          }
          
          // Select appropriate notes based on condition
          let notes = '';
          if (notesTemplates[condition]) {
            notes = notesTemplates[condition][Math.floor(Math.random() * notesTemplates[condition].length)];
          } else {
            notes = defaultNotes[Math.floor(Math.random() * defaultNotes.length)];
          }
          
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
        notes
      `)
      .limit(5);
      
    if (sampleError) {
      console.log('❌ Error fetching sample histories:', sampleError.message);
    } else {
      for (const history of sampleHistories) {
        // Get patient name
        const { data: patient, error: patientError } = await supabase
          .from('users')
          .select('name')
          .eq('id', history.patient_id)
          .single();
          
        console.log(`\n   Medical History:`);
        console.log(`   ID: ${history.id}`);
        console.log(`   Patient: ${patient ? patient.name : history.patient_id}`);
        console.log(`   Condition: ${history.condition}`);
        console.log(`   Diagnosis Date: ${history.diagnosis_date}`);
        console.log(`   Notes: ${history.notes}`);
        if (history.doctor_id) {
          // Get doctor name
          const { data: doctor, error: doctorError } = await supabase
            .from('users')
            .select('name')
            .eq('id', history.doctor_id)
            .single();
            
          console.log(`   Doctor: ${doctor ? doctor.name : history.doctor_id}`);
        }
        if (history.appointment_id) {
          console.log(`   Appointment ID: ${history.appointment_id}`);
        }
      }
    }
    
    console.log('\n🎉 Medical histories creation completed!');
    
  } catch (error) {
    console.log('❌ Error creating medical histories:', error.message);
  }
}

createMedicalHistories();