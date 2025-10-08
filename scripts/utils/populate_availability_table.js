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

// Function to insert a single availability record
async function insertAvailabilityRecord(record) {
  try {
    const { data, error } = await supabase
      .from('availabilities')
      .insert(record);

    if (error) {
      console.log(`❌ Error inserting record: ${error.message}`);
      return false;
    }
    
    return true;
  } catch (error) {
    console.log(`❌ Exception inserting record: ${error.message}`);
    return false;
  }
}

// Get all doctors
async function getDoctors() {
  try {
    const { data: doctors, error } = await supabase
      .from('users')
      .select('id, name')
      .eq('role', 'doctor');

    if (error) {
      throw new Error(`Error fetching doctors: ${error.message}`);
    }

    return doctors;
  } catch (error) {
    throw new Error(`Exception fetching doctors: ${error.message}`);
  }
}

// Get all appointments
async function getAppointments() {
  try {
    const { data: appointments, error } = await supabase
      .from('appointments')
      .select('doctor_id, date, start_time, end_time');

    if (error) {
      throw new Error(`Error fetching appointments: ${error.message}`);
    }

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

// Main function to populate availability table
async function populateAvailabilityTable() {
  console.log('🏥 SOS Tourist Doctor - Populating Availability Table');
  console.log('='.repeat(55));
  
  try {
    // Get all doctors
    const doctors = await getDoctors();
    console.log(`✅ Found ${doctors.length} doctors`);
    
    // Get all appointments
    const appointments = await getAppointments();
    console.log(`✅ Found ${appointments.length} appointments`);
    
    // Group appointments by doctor and date for easier lookup
    const bookedSlots = {};
    appointments.forEach(appt => {
      const key = `${appt.doctor_id}-${appt.date}`;
      if (!bookedSlots[key]) {
        bookedSlots[key] = [];
      }
      bookedSlots[key].push({
        start_time: appt.start_time,
        end_time: appt.end_time
      });
    });
    
    // Generate availability data
    console.log('\n📊 Generating availability data...');
    
    const timeSlots = generateTimeSlots();
    let insertedCount = 0;
    let totalCount = 0;
    
    // Generate availability for the next 30 days for each doctor
    const today = new Date();
    
    for (const doctor of doctors) {
      console.log(`\n👨‍⚕️ Processing ${doctor.name}...`);
      let doctorInsertedCount = 0;
      
      for (let i = 0; i < 30; i++) {
        const date = new Date();
        date.setDate(today.getDate() + i);
        const formattedDate = date.toISOString().split('T')[0];
        
        // Create a key to check for booked slots
        const key = `${doctor.id}-${formattedDate}`;
        const doctorDateAppointments = bookedSlots[key] || [];
        
        // Check each time slot
        for (const slot of timeSlots) {
          // Check if this slot is already booked
          const isBooked = doctorDateAppointments.some(appt => 
            appt.start_time === slot.start_time && appt.end_time === slot.end_time
          );
          
          if (!isBooked) {
            // Slot is available, insert it
            const availabilityRecord = {
              doctor_id: doctor.id,
              date: formattedDate,
              start_time: slot.start_time,
              end_time: slot.end_time,
              is_available: true
            };
            
            const success = await insertAvailabilityRecord(availabilityRecord);
            if (success) {
              insertedCount++;
              doctorInsertedCount++;
            }
            totalCount++;
          }
        }
      }
      
      console.log(`   Inserted ${doctorInsertedCount} availability records`);
    }
    
    console.log(`\n🎉 Process completed!`);
    console.log(`📊 Total records processed: ${totalCount}`);
    console.log(`✅ Successfully inserted: ${insertedCount}`);
    console.log(`❌ Failed inserts: ${totalCount - insertedCount}`);
    
  } catch (error) {
    console.log(`❌ Error populating availability table: ${error.message}`);
  }
}

// Run the population script
populateAvailabilityTable();