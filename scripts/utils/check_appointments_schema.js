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

async function checkAppointmentsSchema() {
  try {
    console.log('🔍 Checking appointments table schema...');
    
    // Try to get column information from information_schema
    const { data, error } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type, is_nullable')
      .eq('table_name', 'appointments')
      .order('ordinal_position');

    if (error) {
      console.log('❌ Error checking appointments schema:', error.message);
      return;
    }

    console.log('✅ Appointments table schema:');
    console.log('┌────────────────────────────────┬──────────────────────┬──────────────┐');
    console.log('│ Column Name                    │ Data Type            │ Nullable     │');
    console.log('├────────────────────────────────┼──────────────────────┼──────────────┤');
    
    data.forEach(column => {
      console.log(`│ ${column.column_name.padEnd(30)} │ ${column.data_type.padEnd(20)} │ ${column.is_nullable.padEnd(12)} │`);
    });
    
    console.log('└────────────────────────────────┴──────────────────────┴──────────────┘');
    
  } catch (error) {
    console.log('❌ Exception checking appointments schema:', error.message);
  }
}

async function checkSampleData() {
  try {
    console.log('\n🔍 Trying to insert a sample appointment to test the schema...');
    
    // Try to insert a minimal appointment to see what's required
    const testAppointment = {
      user_id: '3838cb73-f01a-509c-8dbb-b7c64c57ac78', // John Doe
      doctor_id: '41cdfb01-a6e8-5b44-80b4-c232c4723817' // Dr. Alice Johnson
    };
    
    const { data, error } = await supabase
      .from('appointments')
      .insert(testAppointment)
      .select();

    if (error) {
      console.log('❌ Error inserting test appointment:', error.message);
      console.log('Details:', error);
      return;
    }

    console.log('✅ Successfully inserted test appointment:', data);
    
    // Delete the test appointment
    if (data && data.length > 0) {
      const { error: deleteError } = await supabase
        .from('appointments')
        .delete()
        .eq('id', data[0].id);
        
      if (deleteError) {
        console.log('❌ Error deleting test appointment:', deleteError.message);
      } else {
        console.log('✅ Test appointment deleted successfully');
      }
    }
    
  } catch (error) {
    console.log('❌ Exception inserting test appointment:', error.message);
  }
}

async function main() {
  console.log('SOS Tourist Doctor - Appointments Schema Check');
  console.log('='.repeat(50));
  
  await checkAppointmentsSchema();
  await checkSampleData();
  
  console.log('\n✅ Schema check completed');
}

main();