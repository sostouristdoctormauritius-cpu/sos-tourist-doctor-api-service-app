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

async function verifyAvailabilityData() {
  console.log('🔍 Verifying availability data insertion...');
  
  try {
    // Count total records
    const { count, error: countError } = await supabase
      .from('availabilities')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      console.log('❌ Error counting records:', countError.message);
      return;
    }

    console.log(`✅ Total availability records in database: ${count}`);
    
    // Get sample records
    const { data: sampleData, error: sampleError } = await supabase
      .from('availabilities')
      .select('id, user_id, start_date, end_date, start_time, end_time, consultation_types')
      .limit(5);

    if (sampleError) {
      console.log('❌ Error getting sample data:', sampleError.message);
      return;
    }

    console.log('\n📋 Sample records:');
    sampleData.forEach(record => {
      console.log(`   ID: ${record.id}`);
      console.log(`   User ID: ${record.user_id}`);
      console.log(`   Date: ${record.start_date} to ${record.end_date}`);
      console.log(`   Time: ${record.start_time} to ${record.end_time}`);
      console.log(`   Consultation Types: ${record.consultation_types.join(', ')}`);
      console.log('   ---');
    });
    
    // Check records for a specific doctor
    if (sampleData.length > 0) {
      const doctorId = sampleData[0].user_id;
      const { count: doctorCount, error: doctorCountError } = await supabase
        .from('availabilities')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', doctorId);

      if (doctorCountError) {
        console.log('❌ Error counting doctor records:', doctorCountError.message);
      } else {
        console.log(`\n📊 Records for doctor ${doctorId}: ${doctorCount}`);
      }
    }
    
    // Check records for a specific date
    if (sampleData.length > 0) {
      const date = sampleData[0].start_date;
      const { count: dateCount, error: dateCountError } = await supabase
        .from('availabilities')
        .select('*', { count: 'exact', head: true })
        .eq('start_date', date);

      if (dateCountError) {
        console.log('❌ Error counting date records:', dateCountError.message);
      } else {
        console.log(`📊 Records for date ${date}: ${dateCount}`);
      }
    }
    
    console.log('\n✅ Verification completed successfully!');
    
  } catch (error) {
    console.log('❌ Exception during verification:', error.message);
  }
}

verifyAvailabilityData();