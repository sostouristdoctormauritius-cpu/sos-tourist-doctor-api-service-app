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

// Get Anthony Thompson patient
async function getAnthonyThompson() {
  try {
    console.log('🔍 Finding Anthony Thompson patient...');
    
    const { data: patient, error } = await supabase
      .from('users')
      .select('id, name, email')
      .eq('email', 'anthony.thompson@sospatient.com')
      .single();

    if (error) {
      throw new Error(`Error fetching Anthony Thompson: ${error.message}`);
    }

    if (!patient) {
      throw new Error('Anthony Thompson not found in database');
    }

    console.log(`✅ Found patient: ${patient.name} (${patient.email}) - ID: ${patient.id}`);
    return patient;
  } catch (error) {
    throw new Error(`Exception fetching Anthony Thompson: ${error.message}`);
  }
}

// Get all doctors
async function getDoctors() {
  try {
    console.log('🔍 Fetching all doctors...');
    
    const { data: doctors, error } = await supabase
      .from('users')
      .select('id, name, email')
      .eq('role', 'doctor');

    if (error) {
      throw new Error(`Error fetching doctors: ${error.message}`);
    }

    console.log(`✅ Found ${doctors.length} doctors`);
    return doctors;
  } catch (error) {
    throw new Error(`Exception fetching doctors: ${error.message}`);
  }
}

// Generate appointment dates for the next 30 days
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

// Create appointments for Anthony Thompson with various doctors
async function createAppointmentsForAnthony() {
  console.log('🏥 SOS Tourist Doctor - Creating Appointments for Anthony Thompson');
  console.log('='.repeat(65));
  
  try {
    // Get Anthony Thompson patient
    const patient = await getAnthonyThompson();
    
    // Get all doctors
    const doctors = await getDoctors();
    
    // Generate dates and times
    const dates = generateAppointmentDates();
    const times = generateAppointmentTimes();
    
    console.log(`\n📅 Generated ${dates.length} dates for the next 30 days`);
    console.log(`⏰ Generated ${times.length} time slots per day (9am to 8pm)`);
    
    // Create appointments - one per day for 30 days
    const appointmentsToCreate = [];
    
    console.log('\n📋 Creating 30 appointments for Anthony Thompson...');
    
    for (let i = 0; i < 30; i++) {
      // Rotate doctors so we use different ones
      const doctorIndex = i % doctors.length;
      const doctor = doctors[doctorIndex];
      
      // Get the date
      const date = dates[i];
      const formattedDate = date.toISOString().split('T')[0];
      
      // Select a time (rotate through available times)
      const timeIndex = i % times.length;
      const time = times[timeIndex];
      
      // Calculate end time (1 hour after start time)
      const endHour = (parseInt(time.split(':')[0]) + 1) % 24;
      const endTime = `${endHour.toString().padStart(2, '0')}:00:00`;
      
      const appointment = {
        doctor_id: doctor.id,
        user_id: patient.id,
        date: formattedDate,
        start_time: time,
        end_time: endTime,
        status: 'confirmed',
        consultation_type: 'video'
      };
      
      appointmentsToCreate.push(appointment);
    }
    
    // Insert all appointments
    console.log('\n💾 Inserting appointments into database...');
    
    const { data, error } = await supabase
      .from('appointments')
      .insert(appointmentsToCreate)
      .select();

    if (error) {
      throw new Error(`Error inserting appointments: ${error.message}`);
    }

    console.log(`✅ Successfully created ${data.length} appointments for Anthony Thompson!`);
    
    // Show summary
    console.log('\n📋 Appointment Summary:');
    console.log('┌──────┬────────────────────┬──────────────────────────┬────────────────────┬──────────────┬─────────────────┐');
    console.log('│ Day  │ Date               │ Doctor                   │ Time               │ Type         │ Status          │');
    console.log('├──────┼────────────────────┼──────────────────────────┼────────────────────┼──────────────┼─────────────────┤');
    
    data.forEach((appointment, index) => {
      // Find the doctor name
      const doctor = doctors.find(d => d.id === appointment.doctor_id);
      const doctorName = doctor ? doctor.name : 'Unknown';
      
      console.log(`│ ${String(index + 1).padEnd(4)} │ ${appointment.date.padEnd(18)} │ ${doctorName.padEnd(24)} │ ${appointment.start_time.padEnd(18)} │ ${appointment.consultation_type.padEnd(12)} │ ${appointment.status.padEnd(15)} │`);
    });
    
    console.log('└──────┴────────────────────┴──────────────────────────┴────────────────────┴──────────────┴─────────────────┘');
    
    return data;
    
  } catch (error) {
    console.log('❌ Error creating appointments:', error.message);
    return [];
  }
}

// Run the appointment creation
createAppointmentsForAnthony().then(appointments => {
  if (appointments && appointments.length > 0) {
    console.log(`\n🎉 Successfully created ${appointments.length} appointments for Anthony Thompson!`);
    console.log('\n✅ Process completed successfully');
  } else {
    console.log('\n❌ Failed to create appointments');
  }
});