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

async function identifyPatients() {
  console.log('🔍 Identifying patients from appointments...');
  
  try {
    // Get distinct user_ids from appointments (these should be patients)
    const { data: appointments, error: appointmentsError } = await supabase
      .from('appointments')
      .select('user_id');
      
    if (appointmentsError) {
      console.log('❌ Error fetching appointments:', appointmentsError.message);
      return;
    }
    
    // Extract unique user_ids
    const patientIds = [...new Set(appointments.map(appt => appt.user_id))];
    console.log(`✅ Found ${patientIds.length} unique patients from appointments`);
    
    // Get patient details
    console.log('\n📋 Patient details:');
    for (const patientId of patientIds) {
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('id, name, email')
        .eq('id', patientId)
        .single();
        
      if (userError) {
        console.log(`❌ Error fetching user ${patientId}: ${userError.message}`);
      } else {
        console.log(`   - ${user.name} (${user.email}) - ${user.id}`);
      }
    }
    
  } catch (error) {
    console.log('❌ Exception identifying patients:', error.message);
  }
}

identifyPatients();