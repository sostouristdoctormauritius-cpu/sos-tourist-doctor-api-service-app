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

async function checkAndUpdateAppointments() {
  console.log('📋 Checking and updating appointment statuses...');
  console.log('='.repeat(50));
  
  try {
    // Get all appointments and their current statuses
    const { data: appointments, error: fetchError } = await supabase
      .from('appointments')
      .select('id, user_id, doctor_id, status, date, start_time');
      
    if (fetchError) {
      console.log('❌ Error fetching appointments:', fetchError.message);
      return;
    }
    
    console.log(`✅ Found ${appointments.length} appointments`);
    
    // Count current status distribution
    const statusCount = {};
    appointments.forEach(appt => {
      statusCount[appt.status] = (statusCount[appt.status] || 0) + 1;
    });
    
    console.log('\n📊 Current status distribution:');
    Object.entries(statusCount).forEach(([status, count]) => {
      console.log(`   ${status}: ${count}`);
    });
    
    // Define possible statuses
    const possibleStatuses = ['scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show'];
    
    // Update appointments to have various statuses
    console.log('\n🔄 Updating appointment statuses...');
    
    // We'll update appointments to have a spread of statuses
    // Let's make about 60% completed, 20% in_progress, 10% cancelled, 5% no_show, 5% confirmed
    let updatedCount = 0;
    
    for (let i = 0; i < appointments.length; i++) {
      const appointment = appointments[i];
      
      // Determine new status based on position
      let newStatus;
      const position = i / appointments.length;
      
      if (position < 0.6) {
        newStatus = 'completed'; // 60% completed
      } else if (position < 0.8) {
        newStatus = 'in_progress'; // 20% in progress
      } else if (position < 0.9) {
        newStatus = 'cancelled'; // 10% cancelled
      } else if (position < 0.95) {
        newStatus = 'no_show'; // 5% no show
      } else {
        newStatus = 'confirmed'; // 5% confirmed
      }
      
      // Only update if status is changing
      if (appointment.status !== newStatus) {
        const { data, error } = await supabase
          .from('appointments')
          .update({ status: newStatus })
          .eq('id', appointment.id);
          
        if (error) {
          console.log(`❌ Error updating appointment ${appointment.id}:`, error.message);
        } else {
          console.log(`   ✅ Updated appointment ${appointment.id} from ${appointment.status} to ${newStatus}`);
          updatedCount++;
        }
      } else {
        console.log(`   ➡️  Appointment ${appointment.id} already has status ${newStatus}`);
      }
    }
    
    console.log(`\n✅ Updated ${updatedCount} appointments`);
    
    // Verify the update
    console.log('\n🔍 Verifying update...');
    const { data: updatedAppointments, error: verifyError } = await supabase
      .from('appointments')
      .select('id, status');
      
    if (verifyError) {
      console.log('❌ Error verifying update:', verifyError.message);
      return;
    }
    
    const updatedStatusCount = {};
    updatedAppointments.forEach(appt => {
      updatedStatusCount[appt.status] = (updatedStatusCount[appt.status] || 0) + 1;
    });
    
    console.log('📊 Updated status distribution:');
    Object.entries(updatedStatusCount).forEach(([status, count]) => {
      console.log(`   ${status}: ${count}`);
    });
    
    // Show some sample appointments
    console.log('\n📋 Sample updated appointments:');
    const { data: sampleAppointments, error: sampleError } = await supabase
      .from('appointments')
      .select(`
        id,
        date,
        start_time,
        status,
        users (name, email)
      `)
      .limit(5);
      
    if (sampleError) {
      console.log('❌ Error fetching sample appointments:', sampleError.message);
    } else {
      sampleAppointments.forEach((appt, index) => {
        console.log(`\n   Appointment ${index + 1}:`);
        console.log(`   ID: ${appt.id}`);
        console.log(`   Date: ${appt.date} at ${appt.start_time}`);
        console.log(`   Status: ${appt.status}`);
        if (appt.users) {
          console.log(`   Patient: ${appt.users.name} (${appt.users.email})`);
        }
      });
    }
    
    console.log('\n🎉 Appointment status update completed!');
    
  } catch (error) {
    console.log('❌ Exception during appointment update:', error.message);
  }
}

checkAndUpdateAppointments();