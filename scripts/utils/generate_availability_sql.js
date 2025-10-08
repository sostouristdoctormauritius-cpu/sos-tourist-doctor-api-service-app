const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

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

// Get all appointments
async function getAppointments() {
  try {
    console.log('🔍 Fetching all appointments...');
    
    const { data: appointments, error } = await supabase
      .from('appointments')
      .select('id, doctor_id, user_id, date, start_time, end_time, consultation_type, status')
      .order('date', { ascending: true })
      .order('start_time', { ascending: true });

    if (error) {
      throw new Error(`Error fetching appointments: ${error.message}`);
    }

    console.log(`✅ Found ${appointments.length} appointments`);
    return appointments;
  } catch (error) {
    throw new Error(`Exception fetching appointments: ${error.message}`);
  }
}

// Generate time slots for a given date (9am to 9pm)
function generateTimeSlots() {
  const slots = [];
  for (let hour = 9; hour <= 20; hour++) {
    slots.push({
      start_time: `${hour.toString().padStart(2, '0')}:00:00`,
      end_time: `${(hour + 1).toString().padStart(2, '0')}:00:00`
    });
  }
  return slots;
}

// Generate SQL INSERT statements for availability data
async function generateAvailabilitySQL() {
  console.log('🏥 SOS Tourist Doctor - Generating SQL for Doctor Availability Data');
  console.log('='.repeat(65));
  
  try {
    // Get all doctors
    const doctors = await getDoctors();
    
    // Get all appointments
    const appointments = await getAppointments();
    
    console.log('\n📊 Analyzing doctor availability based on appointments...');
    
    // Group appointments by doctor
    const appointmentsByDoctor = {};
    appointments.forEach(appointment => {
      if (!appointmentsByDoctor[appointment.doctor_id]) {
        appointmentsByDoctor[appointment.doctor_id] = [];
      }
      appointmentsByDoctor[appointment.doctor_id].push(appointment);
    });
    
    // Generate availability data
    const availabilityData = [];
    
    // For each doctor, analyze their appointments and generate availability
    for (const doctor of doctors) {
      console.log(`\n👨‍⚕️ Doctor: ${doctor.name}`);
      
      const doctorAppointments = appointmentsByDoctor[doctor.id] || [];
      console.log(`   Appointments: ${doctorAppointments.length}`);
      
      // Group appointments by date
      const appointmentsByDate = {};
      doctorAppointments.forEach(appointment => {
        const date = appointment.date;
        if (!appointmentsByDate[date]) {
          appointmentsByDate[date] = [];
        }
        appointmentsByDate[date].push(appointment);
      });
      
      // Generate availability for the next 30 days
      const today = new Date();
      const timeSlots = generateTimeSlots();
      
      for (let i = 0; i < 30; i++) {
        const date = new Date();
        date.setDate(today.getDate() + i);
        const formattedDate = date.toISOString().split('T')[0];
        
        // Check which slots are booked
        const bookedSlots = (appointmentsByDate[formattedDate] || []).map(appt => ({
          start_time: appt.start_time,
          end_time: appt.end_time
        }));
        
        // Determine available slots (slots not in booked slots)
        const availableSlots = timeSlots.filter(slot => 
          !bookedSlots.some(booked => 
            booked.start_time === slot.start_time && booked.end_time === slot.end_time
          )
        );
        
        // Create availability records for available slots
        availableSlots.forEach(slot => {
          availabilityData.push({
            doctor_id: doctor.id,
            date: formattedDate,
            start_time: slot.start_time,
            end_time: slot.end_time,
            is_available: true
          });
        });
      }
      
      console.log(`   Available time slots generated: ${availabilityData.filter(a => a.doctor_id === doctor.id).length}`);
    }
    
    console.log(`\n📋 Total availability records to be created: ${availabilityData.length}`);
    
    // Generate SQL INSERT statements
    console.log('\n💾 Generating SQL INSERT statements...');
    
    let sqlContent = `-- SOS Tourist Doctor - Availability Data
-- Generated on ${new Date().toISOString()}
-- Total records: ${availabilityData.length}

`;
    
    // Add INSERT statements in batches
    const batchSize = 100;
    for (let i = 0; i < availabilityData.length; i += batchSize) {
      const batch = availabilityData.slice(i, i + batchSize);
      
      sqlContent += `INSERT INTO availabilities (doctor_id, date, start_time, end_time, is_available) VALUES\n`;
      
      batch.forEach((availability, index) => {
        sqlContent += `  ('${availability.doctor_id}', '${availability.date}', '${availability.start_time}', '${availability.end_time}', ${availability.is_available})`;
        if (index < batch.length - 1) {
          sqlContent += ',\n';
        } else {
          sqlContent += ';\n\n';
        }
      });
    }
    
    // Write to file
    const fileName = 'availability_data.sql';
    fs.writeFileSync(fileName, sqlContent);
    
    console.log(`✅ SQL file generated: ${fileName}`);
    console.log(`📝 File contains ${availabilityData.length} INSERT statements`);
    
    // Show sample of generated SQL
    console.log('\n📋 Sample of generated SQL:');
    const lines = sqlContent.split('\n');
    lines.slice(0, 15).forEach(line => {
      console.log(line);
    });
    
    if (lines.length > 15) {
      console.log('   ...');
    }
    
    console.log('\n📋 To insert this data into your database:');
    console.log('   1. Copy the SQL file to your database server');
    console.log('   2. Run: psql -d your_database_name -f availability_data.sql');
    console.log('   OR');
    console.log('   2. Copy and paste the SQL statements into your database client');
    
    return availabilityData;
    
  } catch (error) {
    console.log('❌ Error generating SQL for doctor availability data:', error.message);
    return [];
  }
}

// Run the SQL generation
generateAvailabilitySQL();