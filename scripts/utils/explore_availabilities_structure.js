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

async function exploreAvailabilitiesStructure() {
  try {
    console.log('🔍 Exploring availabilities table structure...');
    
    // Try inserting a minimal record with just doctor_id
    console.log('\n🧪 Testing minimal record with doctor_id only...');
    const minimalRecord = {
      doctor_id: '41cdfb01-a6e8-5b44-80b4-c232c4723817' // Dr. Alice Johnson
    };
    
    const { data: data1, error: error1 } = await supabase
      .from('availabilities')
      .insert(minimalRecord)
      .select();
      
    if (error1) {
      console.log('❌ Failed with doctor_id only:', error1.message);
    } else {
      console.log('✅ Success with doctor_id only');
      // Clean up
      if (data1 && data1.length > 0) {
        await supabase
          .from('availabilities')
          .delete()
          .eq('id', data1[0].id);
      }
    }
    
    // Try with doctor_id and date
    console.log('\n🧪 Testing with doctor_id and date...');
    const recordWithDate = {
      doctor_id: '41cdfb01-a6e8-5b44-80b4-c232c4723817', // Dr. Alice Johnson
      date: '2025-10-08'
    };
    
    const { data: data2, error: error2 } = await supabase
      .from('availabilities')
      .insert(recordWithDate)
      .select();
      
    if (error2) {
      console.log('❌ Failed with doctor_id and date:', error2.message);
    } else {
      console.log('✅ Success with doctor_id and date');
      // Clean up
      if (data2 && data2.length > 0) {
        await supabase
          .from('availabilities')
          .delete()
          .eq('id', data2[0].id);
      }
    }
    
    // Try with doctor_id, date, and time fields
    console.log('\n🧪 Testing with doctor_id, date, start_time, end_time...');
    const fullRecord = {
      doctor_id: '41cdfb01-a6e8-5b44-80b4-c232c4723817', // Dr. Alice Johnson
      date: '2025-10-08',
      start_time: '09:00:00',
      end_time: '10:00:00'
    };
    
    const { data: data3, error: error3 } = await supabase
      .from('availabilities')
      .insert(fullRecord)
      .select();
      
    if (error3) {
      console.log('❌ Failed with full record:', error3.message);
    } else {
      console.log('✅ Success with full record');
      console.log('Inserted record:', data3[0]);
      // Clean up
      if (data3 && data3.length > 0) {
        await supabase
          .from('availabilities')
          .delete()
          .eq('id', data3[0].id);
      }
    }
    
    // Try with all fields including is_available
    console.log('\n🧪 Testing with all fields...');
    const completeRecord = {
      doctor_id: '41cdfb01-a6e8-5b44-80b4-c232c4723817', // Dr. Alice Johnson
      date: '2025-10-08',
      start_time: '09:00:00',
      end_time: '10:00:00',
      is_available: true
    };
    
    const { data: data4, error: error4 } = await supabase
      .from('availabilities')
      .insert(completeRecord)
      .select();
      
    if (error4) {
      console.log('❌ Failed with complete record:', error4.message);
    } else {
      console.log('✅ Success with complete record');
      console.log('Inserted record:', data4[0]);
      // Clean up
      if (data4 && data4.length > 0) {
        await supabase
          .from('availabilities')
          .delete()
          .eq('id', data4[0].id);
      }
    }
    
  } catch (error) {
    console.log('❌ Exception exploring structure:', error.message);
  }
}

exploreAvailabilitiesStructure();