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

async function exploreAppointmentsTable() {
  console.log('🔍 Exploring appointments table structure...');
  
  // Try inserting a more complete appointment
  const testAppointment = {
    user_id: '3838cb73-f01a-509c-8dbb-b7c64c57ac78', // John Doe
    doctor_id: '41cdfb01-a6e8-5b44-80b4-c232c4723817', // Dr. Alice Johnson
    date: '2025-10-08',
    start_time: '09:00:00',
    end_time: '10:00:00',
    status: 'confirmed',
    consultation_type: 'video'
  };
  
  try {
    console.log('\n📋 Attempting to insert a complete appointment...');
    
    const { data, error } = await supabase
      .from('appointments')
      .insert(testAppointment)
      .select();

    if (error) {
      console.log('❌ Error inserting appointment:', error.message);
      console.log('Code:', error.code);
      console.log('Details:', error.details);
      return;
    }

    console.log('✅ Successfully inserted appointment:', data[0]);
    
    // Show what was actually inserted
    console.log('\n📄 Inserted appointment details:');
    Object.keys(data[0]).forEach(key => {
      console.log(`   ${key}: ${data[0][key]}`);
    });
    
    // Delete the test appointment
    if (data && data.length > 0) {
      const { error: deleteError } = await supabase
        .from('appointments')
        .delete()
        .eq('id', data[0].id);
        
      if (deleteError) {
        console.log('❌ Error deleting test appointment:', deleteError.message);
      } else {
        console.log('\n✅ Test appointment deleted successfully');
      }
    }
    
  } catch (error) {
    console.log('❌ Exception inserting appointment:', error.message);
  }
}

async function checkTableDescription() {
  try {
    console.log('\n🔍 Checking if we can get table description...');
    
    // Try a simple query to see what columns exist
    const { data, error } = await supabase
      .from('appointments')
      .select('*')
      .limit(0); // Just get the structure, no data

    if (error) {
      console.log('❌ Error getting table description:', error.message);
      return;
    }

    if (data) {
      console.log('✅ Successfully accessed appointments table');
      console.log('📋 Columns detected:');
      // This should give us column names even if no data
      Object.keys(data).forEach(key => {
        console.log(`   - ${key}`);
      });
    }
    
  } catch (error) {
    console.log('❌ Exception getting table description:', error.message);
  }
}

async function main() {
  console.log('SOS Tourist Doctor - Appointments Table Exploration');
  console.log('='.repeat(55));
  
  await checkTableDescription();
  await exploreAppointmentsTable();
  
  console.log('\n✅ Exploration completed');
}

main();