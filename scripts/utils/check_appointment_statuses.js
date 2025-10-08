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

async function checkAppointmentStatuses() {
  console.log('🔍 Checking valid appointment status enum values...');
  
  try {
    // Try to insert appointments with different status values to see which ones work
    const testStatuses = ['scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show'];
    
    console.log('\n🧪 Testing status values:');
    
    for (const status of testStatuses) {
      // Get a sample appointment to use as template
      const { data: sampleAppointment, error: sampleError } = await supabase
        .from('appointments')
        .select('*')
        .limit(1);
        
      if (sampleError) {
        console.log(`❌ Error getting sample appointment:`, sampleError.message);
        continue;
      }
      
      if (!sampleAppointment || sampleAppointment.length === 0) {
        console.log('❌ No sample appointment found');
        continue;
      }
      
      const appointmentTemplate = sampleAppointment[0];
      
      // Try to insert with this status
      const testAppointment = {
        ...appointmentTemplate,
        id: '00000000-0000-0000-0000-000000000000', // Dummy ID
        status: status
      };
      
      // Remove auto-generated fields
      delete testAppointment.created_at;
      delete testAppointment.updated_at;
      
      const { data, error } = await supabase
        .from('appointments')
        .insert(testAppointment)
        .select();
        
      if (error) {
        console.log(`   ❌ "${status}" - Invalid:`, error.message.includes('enum') ? 'Not in enum' : error.message);
      } else {
        console.log(`   ✅ "${status}" - Valid`);
        
        // Clean up
        await supabase
          .from('appointments')
          .delete()
          .eq('id', '00000000-0000-0000-0000-000000000000');
      }
    }
    
    // Check current appointments to see what statuses exist
    console.log('\n📋 Current appointment statuses in database:');
    const { data: appointments, error: fetchError } = await supabase
      .from('appointments')
      .select('status');
      
    if (fetchError) {
      console.log('❌ Error fetching appointments:', fetchError.message);
      return;
    }
    
    // Get unique statuses
    const statuses = [...new Set(appointments.map(appt => appt.status))];
    console.log('   Existing statuses:', statuses);
    
  } catch (error) {
    console.log('❌ Exception during status check:', error.message);
  }
}

checkAppointmentStatuses();