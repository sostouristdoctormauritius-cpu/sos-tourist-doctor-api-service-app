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

async function checkConsultationTypes() {
  try {
    console.log('🔍 Checking valid consultation types...');
    
    // Try to get enum values
    const { data, error } = await supabase
      .from('pg_type')
      .select('*')
      .eq('typname', 'consultation_type_enum');

    if (error) {
      console.log('Error checking enum:', error.message);
    } else {
      console.log('Enum data:', data);
    }
    
    // Try a different approach - insert a test appointment with different types
    const testTypes = ['video', 'chat', 'voice', 'home_visit', 'in_person'];
    console.log('\n🧪 Testing valid consultation types...');
    
    for (const type of testTypes) {
      try {
        const testAppointment = {
          user_id: '3838cb73-f01a-509c-8dbb-b7c64c57ac78', // John Doe
          doctor_id: '41cdfb01-a6e8-5b44-80b4-c232c4723817', // Dr. Alice Johnson
          date: '2025-10-08',
          start_time: '09:00:00',
          end_time: '10:00:00',
          status: 'confirmed',
          consultation_type: type
        };
        
        const { error: insertError } = await supabase
          .from('appointments')
          .insert(testAppointment);
          
        if (insertError) {
          console.log(`❌ "${type}" - Invalid (${insertError.message})`);
        } else {
          console.log(`✅ "${type}" - Valid`);
          // Delete the test appointment if it was created
          await supabase
            .from('appointments')
            .delete()
            .eq('user_id', testAppointment.user_id)
            .eq('doctor_id', testAppointment.doctor_id)
            .eq('date', testAppointment.date)
            .eq('start_time', testAppointment.start_time);
        }
      } catch (e) {
        console.log(`❌ "${type}" - Error (${e.message})`);
      }
    }
    
  } catch (error) {
    console.log('Exception:', error.message);
  }
}

checkConsultationTypes();