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

// Get doctors from the database
async function getDoctors() {
  try {
    console.log('🔍 Fetching doctors...');
    
    const { data: doctors, error } = await supabase
      .from('users')
      .select('id, name, email')
      .eq('role', 'doctor')
      .limit(10);

    if (error) {
      console.log('❌ Error fetching doctors:', error.message);
      return [];
    }

    console.log(`✅ Found ${doctors.length} doctors:`);
    doctors.forEach((doctor, index) => {
      console.log(`   ${index + 1}. ${doctor.name} (${doctor.email}) - ID: ${doctor.id}`);
    });
    
    return doctors;
  } catch (error) {
    console.log('❌ Exception fetching doctors:', error.message);
    return [];
  }
}

// Get patients from the database
async function getPatients() {
  try {
    console.log('\n🔍 Fetching patients...');
    
    const { data: patients, error } = await supabase
      .from('users')
      .select('id, name, email')
      .eq('role', 'user') // 'user' role represents patients
      .limit(10);

    if (error) {
      console.log('❌ Error fetching patients:', error.message);
      return [];
    }

    console.log(`✅ Found ${patients.length} patients:`);
    patients.forEach((patient, index) => {
      console.log(`   ${index + 1}. ${patient.name} (${patient.email}) - ID: ${patient.id}`);
    });
    
    return patients;
  } catch (error) {
    console.log('❌ Exception fetching patients:', error.message);
    return [];
  }
}

// Check appointment table structure
async function checkAppointmentStructure() {
  try {
    console.log('\n🔍 Checking appointments table structure...');
    
    const { data, error } = await supabase
      .from('appointments')
      .select('*')
      .limit(1);

    if (error) {
      console.log('❌ Error checking appointments table structure:', error.message);
      return [];
    }

    if (data && data.length > 0) {
      console.log('✅ Appointments table columns:');
      Object.keys(data[0]).forEach(key => {
        console.log(`   - ${key}`);
      });
      return Object.keys(data[0]);
    } else {
      console.log('⚠️ Appointments table is empty');
      // Let's check the schema instead
      return [];
    }
  } catch (error) {
    console.log('❌ Exception checking appointments table structure:', error.message);
    return [];
  }
}

// Generate appointment dates
function generateAppointmentDates() {
  const dates = [];
  const today = new Date();
  
  // Generate dates for the next 30 days
  for (let i = 1; i <= 30; i++) {
    const date = new Date();
    date.setDate(today.getDate() + i);
    dates.push(date);
  }
  
  return dates;
}

// Generate appointment times (between 9am and 9pm)
function generateAppointmentTimes() {
  const times = [];
  // Generate times from 9am to 8pm in 1-hour intervals
  for (let hour = 9; hour <= 20; hour++) {
    times.push(`${hour.toString().padStart(2, '0')}:00:00`);
  }
  return times;
}

// Simulate creating appointments
async function simulateAppointments() {
  console.log('🏥 SOS Tourist Doctor - Appointment Simulation');
  console.log('='.repeat(50));
  
  // Get doctors
  const doctors = await getDoctors();
  if (doctors.length === 0) {
    console.log('❌ No doctors found. Cannot create appointments.');
    return;
  }
  
  // Get patients
  const patients = await getPatients();
  if (patients.length === 0) {
    console.log('❌ No patients found. Cannot create appointments.');
    return;
  }
  
  // Check appointment structure
  const appointmentColumns = await checkAppointmentStructure();
  
  // Generate dates and times
  const dates = generateAppointmentDates();
  const times = generateAppointmentTimes();
  
  console.log(`\n📅 Generated ${dates.length} dates for the next 30 days`);
  console.log(`⏰ Generated ${times.length} time slots per day (9am to 8pm)`);
  
  // Simulate creating 3 appointments with different doctors on different days
  console.log('\n📋 Simulating appointment creation:');
  
  const appointmentsToCreate = [];
  
  // Select 3 different doctors
  const selectedDoctors = doctors.slice(0, 3);
  
  // Create one appointment per doctor on different days
  for (let i = 0; i < 3; i++) {
    const doctor = selectedDoctors[i];
    const patient = patients[0]; // Use the first patient for all appointments
    const date = dates[i]; // Use consecutive days
    
    // Format date as YYYY-MM-DD
    const formattedDate = date.toISOString().split('T')[0];
    
    // Select a time (we'll use a different time for each)
    const time = times[i % times.length];
    
    const appointment = {
      doctor_id: doctor.id,
      user_id: patient.id,
      date: formattedDate,
      start_time: time,
      end_time: `${(parseInt(time.split(':')[0]) + 1).toString().padStart(2, '0')}:00:00`,
      status: 'confirmed',
      consultation_type: 'video',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    appointmentsToCreate.push(appointment);
    
    console.log(`\n📝 Appointment ${i + 1}:`);
    console.log(`   Doctor: ${doctor.name}`);
    console.log(`   Patient: ${patient.name}`);
    console.log(`   Date: ${formattedDate}`);
    console.log(`   Time: ${time} - ${appointment.end_time}`);
    console.log(`   Type: ${appointment.consultation_type}`);
    console.log(`   Status: ${appointment.status}`);
  }
  
  console.log('\n✅ Simulation completed successfully!');
  console.log(`\n📋 Summary:`);
  console.log(`   - 3 appointments simulated`);
  console.log(`   - 3 different doctors`);
  console.log(`   - 3 different days`);
  console.log(`   - No time conflicts`);
  console.log(`   - All within 9am-9pm window`);
  
  return appointmentsToCreate;
}

// Run the simulation
simulateAppointments().then(appointments => {
  if (appointments && appointments.length > 0) {
    console.log('\n💾 To actually create these appointments, run the create_appointments.js script.');
  }
});