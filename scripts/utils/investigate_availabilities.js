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

async function investigateAvailabilities() {
  console.log('🔍 Further investigating availabilities table structure...');
  
  // We know it has a user_id column that is required
  // Let's try to insert with just user_id to see what other fields are required
  console.log('\n🧪 Test 1: Insert with only user_id...');
  
  try {
    const test1 = {
      user_id: '41cdfb01-a6e8-5b44-80b4-c232c4723817' // Dr. Alice Johnson
    };
    
    const { data: data1, error: error1 } = await supabase
      .from('availabilities')
      .insert(test1)
      .select();
      
    if (error1) {
      console.log('❌ Error:', error1.message);
      // Parse the error to understand what other fields are missing
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
  } catch (error) {
    console.log('❌ Exception:', error.message);
  }
  
  // Try with user_id and date
  console.log('\n🧪 Test 2: Insert with user_id and date...');
  
  try {
    const test2 = {
      user_id: '41cdfb01-a6e8-5b44-80b4-c232c4723817', // Dr. Alice Johnson
      date: '2025-10-08'
    };
    
    const { data: data2, error: error2 } = await supabase
      .from('availabilities')
      .insert(test2)
      .select();
      
    if (error2) {
      console.log('❌ Error:', error2.message);
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
  } catch (error) {
    console.log('❌ Exception:', error.message);
  }
  
  // Try with user_id, date, and time fields
  console.log('\n🧪 Test 3: Insert with user_id, date, and time fields...');
  
  try {
    const test3 = {
      user_id: '41cdfb01-a6e8-5b44-80b4-c232c4723817', // Dr. Alice Johnson
      date: '2025-10-08',
      start_time: '09:00:00',
      end_time: '10:00:00'
    };
    
    const { data: data3, error: error3 } = await supabase
      .from('availabilities')
      .insert(test3)
      .select();
      
    if (error3) {
      console.log('❌ Error:', error3.message);
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
  } catch (error) {
    console.log('❌ Exception:', error.message);
  }
  
  // Try with all fields we think might be required
  console.log('\n🧪 Test 4: Insert with all likely fields...');
  
  try {
    const test4 = {
      user_id: '41cdfb01-a6e8-5b44-80b4-c232c4723817', // Dr. Alice Johnson
      date: '2025-10-08',
      start_time: '09:00:00',
      end_time: '10:00:00',
      is_available: true
    };
    
    const { data: data4, error: error4 } = await supabase
      .from('availabilities')
      .insert(test4)
      .select();
      
    if (error4) {
      console.log('❌ Error:', error4.message);
    } else {
      console.log('✅ Success!');
      console.log('Inserted record:', data4[0]);
      
      // Clean up
      if (data4 && data4.length > 0) {
        await supabase
          .from('availabilities')
          .delete()
          .eq('id', data4[0].id);
        console.log('🧹 Cleaned up test record');
      }
    }
  } catch (error) {
    console.log('❌ Exception:', error.message);
  }
}

investigateAvailabilities();