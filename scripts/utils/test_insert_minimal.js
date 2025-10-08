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

async function testMinimalInsert() {
  console.log('🔍 Testing minimal insert into availabilities table...');
  
  try {
    // Try inserting a minimal record with just a doctor_id
    console.log('\n🧪 Test 1: Insert with only doctor_id...');
    const test1 = {
      doctor_id: '41cdfb01-a6e8-5b44-80b4-c232c4723817' // Dr. Alice Johnson
    };
    
    const { data: data1, error: error1 } = await supabase
      .from('availabilities')
      .insert(test1)
      .select();

    if (error1) {
      console.log('❌ Failed:', error1.message);
    } else {
      console.log('✅ Success!');
      console.log('Inserted record:', data1[0]);
      
      // Clean up
      if (data1 && data1.length > 0) {
        await supabase
          .from('availabilities')
          .delete()
          .eq('id', data1[0].id);
        console.log('🧹 Cleaned up test record');
      }
    }
    
    // Try inserting with doctor_id and a date field
    console.log('\n🧪 Test 2: Insert with doctor_id and date...');
    const test2 = {
      doctor_id: '41cdfb01-a6e8-5b44-80b4-c232c4723817', // Dr. Alice Johnson
      date: '2025-10-08'
    };
    
    const { data: data2, error: error2 } = await supabase
      .from('availabilities')
      .insert(test2)
      .select();

    if (error2) {
      console.log('❌ Failed:', error2.message);
    } else {
      console.log('✅ Success!');
      console.log('Inserted record:', data2[0]);
      
      // Clean up
      if (data2 && data2.length > 0) {
        await supabase
          .from('availabilities')
          .delete()
          .eq('id', data2[0].id);
        console.log('🧹 Cleaned up test record');
      }
    }
    
    // Try inserting with all expected fields
    console.log('\n🧪 Test 3: Insert with all expected fields...');
    const test3 = {
      doctor_id: '41cdfb01-a6e8-5b44-80b4-c232c4723817', // Dr. Alice Johnson
      date: '2025-10-08',
      start_time: '09:00:00',
      end_time: '10:00:00',
      is_available: true
    };
    
    const { data: data3, error: error3 } = await supabase
      .from('availabilities')
      .insert(test3)
      .select();

    if (error3) {
      console.log('❌ Failed:', error3.message);
    } else {
      console.log('✅ Success!');
      console.log('Inserted record:', data3[0]);
      
      // Clean up
      if (data3 && data3.length > 0) {
        await supabase
          .from('availabilities')
          .delete()
          .eq('id', data3[0].id);
        console.log('🧹 Cleaned up test record');
      }
    }
    
    console.log('\n✅ Testing completed!');
    
  } catch (error) {
    console.log('❌ Exception during testing:', error.message);
  }
}

testMinimalInsert();