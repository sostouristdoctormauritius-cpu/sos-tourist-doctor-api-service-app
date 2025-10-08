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

// Generate availability data with correct structure
async function generateCorrectAvailabilityData() {
  console.log('🏥 SOS Tourist Doctor - Generating Correct Availability Data');
  console.log('='.repeat(60));
  
  try {
    // Get all doctors
    const doctors = await getDoctors();
    
    // Get all appointments
    const appointments = await getAppointments();
    
    console.log('\n📊 Analyzing doctor availability based on appointments...');
    
    // Group appointments by doctor
    const appointmentsByDoctor = {};
    appointments.forEach(appointment => {
      // Note: doctor_id in appointments table corresponds to user_id in availabilities table
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
            user_id: doctor.id, // doctor's user ID
            start_date: formattedDate,
            end_date: formattedDate,
            start_time: slot.start_time,
            end_time: slot.end_time,
            consultation_types: ['video', 'chat'] // Include both types
          });
        });
      }
      
      console.log(`   Available time slots generated: ${availabilityData.filter(a => a.user_id === doctor.id).length}`);
    }
    
    console.log(`\n📋 Total availability records to be created: ${availabilityData.length}`);
    
    // Generate SQL INSERT statements
    console.log('\n💾 Generating SQL INSERT statements...');
    
    let sqlContent = `-- SOS Tourist Doctor - Availability Data
-- Generated on ${new Date().toISOString()}
-- Total records: ${availabilityData.length}

-- Table structure:
-- user_id (UUID) - References the doctor's user ID
-- start_date (DATE) - Start date of availability
-- end_date (DATE) - End date of availability
-- start_time (TIME) - Start time of the slot
-- end_time (TIME) - End time of the slot
-- consultation_types (TEXT[]) - Array of consultation types

`;
    
    // Add INSERT statements in batches
    const batchSize = 100;
    for (let i = 0; i < availabilityData.length; i += batchSize) {
      const batch = availabilityData.slice(i, i + batchSize);
      
      sqlContent += `INSERT INTO availabilities (user_id, start_date, end_date, start_time, end_time, consultation_types) VALUES\n`;
      
      batch.forEach((availability, index) => {
        sqlContent += `  ('${availability.user_id}', '${availability.start_date}', '${availability.end_date}', '${availability.start_time}', '${availability.end_time}', ARRAY['video', 'chat'])`;
        if (index < batch.length - 1) {
          sqlContent += ',\n';
        } else {
          sqlContent += ';\n\n';
        }
      });
    }
    
    // Write to file
    const fileName = 'corrected_availability_data.sql';
    fs.writeFileSync(fileName, sqlContent);
    
    console.log(`✅ SQL file generated: ${fileName}`);
    console.log(`📝 File contains ${availabilityData.length} INSERT statements`);
    
    // Show sample of generated SQL
    console.log('\n📋 Sample of generated SQL:');
    const lines = sqlContent.split('\n');
    lines.slice(0, 20).forEach(line => {
      console.log(line);
    });
    
    if (lines.length > 20) {
      console.log('   ...');
    }
    
    // Try to insert a few records directly to test
    console.log('\n🧪 Testing direct insertion of sample records...');
    
    const sampleRecords = availabilityData.slice(0, 3);
    let insertedCount = 0;
    
    for (const record of sampleRecords) {
      try {
        const { data, error } = await supabase
          .from('availabilities')
          .insert({
            user_id: record.user_id,
            start_date: record.start_date,
            end_date: record.end_date,
            start_time: record.start_time,
            end_time: record.end_time,
            consultation_types: record.consultation_types
          })
          .select();
          
        if (error) {
          console.log(`❌ Error inserting record: ${error.message}`);
        } else {
          insertedCount++;
          // Clean up immediately
          if (data && data.length > 0) {
            await supabase
              .from('availabilities')
              .delete()
              .eq('id', data[0].id);
          }
        }
      } catch (error) {
        console.log(`❌ Exception inserting record: ${error.message}`);
      }
    }
    
    console.log(`✅ Successfully tested ${insertedCount}/${sampleRecords.length} sample records`);
    
    console.log('\n🎉 Availability data generation completed successfully!');
    console.log('\n📋 To insert all data into your database:');
    console.log('   1. Use the Supabase SQL Editor and run the corrected_availability_data.sql file');
    console.log('   2. Or connect to your database directly and execute the file');
    
    return availabilityData;
    
  } catch (error) {
    console.log('❌ Error generating correct availability data:', error.message);
    return [];
  }
}

// Run the generation
generateCorrectAvailabilityData();