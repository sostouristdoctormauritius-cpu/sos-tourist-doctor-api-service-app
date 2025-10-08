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

// Try to insert availability data using a different approach
async function insertAvailabilityData() {
  console.log('🏥 SOS Tourist Doctor - Inserting Doctor Availability Data');
  console.log('='.repeat(55));
  
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
    
    // Try inserting in smaller batches
    console.log('\n💾 Inserting availability data into database...');
    
    let insertedCount = 0;
    const batchSize = 50; // Smaller batch size to avoid issues
    
    for (let i = 0; i < availabilityData.length; i += batchSize) {
      const batch = availabilityData.slice(i, i + batchSize);
      
      try {
        // Try a different approach - insert one by one if batch fails
        let batchInserted = 0;
        for (const availability of batch) {
          const { data, error } = await supabase
            .from('availabilities')
            .insert({
              doctor_id: availability.doctor_id,
              date: availability.date,
              start_time: availability.start_time,
              end_time: availability.end_time,
              is_available: availability.is_available
            })
            .select();
            
          if (error) {
            console.log(`❌ Error inserting record: ${error.message}`);
          } else {
            batchInserted++;
          }
        }
        
        insertedCount += batchInserted;
        console.log(`✅ Batch ${Math.floor(i/batchSize) + 1} processed (${batchInserted}/${batch.length} records)`);
        
      } catch (error) {
        console.log(`❌ Exception processing batch ${Math.floor(i/batchSize) + 1}: ${error.message}`);
      }
    }
    
    console.log(`\n🎉 Process completed! Successfully processed ${insertedCount} availability records!`);
    
    return availabilityData;
    
  } catch (error) {
    console.log('❌ Error inserting doctor availability data:', error.message);
    return [];
  }
}

// Run the insertion
insertAvailabilityData();