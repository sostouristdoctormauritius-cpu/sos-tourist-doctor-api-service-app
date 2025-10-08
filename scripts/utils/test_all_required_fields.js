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

async function testAllRequiredFields() {
  console.log('🔍 Testing with all required fields...');
  
  // Based on our discoveries, the table has:
  // user_id, start_date, end_date, start_time, end_time, consultation_types
  console.log('\n🧪 Test with all discovered fields...');
  
  try {
    const testRecord = {
      user_id: '41cdfb01-a6e8-5b44-80b4-c232c4723817', // Dr. Alice Johnson
      start_date: '2025-10-08',
      end_date: '2025-10-08',
      start_time: '09:00:00',
      end_time: '10:00:00',
      consultation_types: ['video'] // Assuming this is an array
    };
    
    const { data, error } = await supabase
      .from('availabilities')
      .insert(testRecord)
      .select();
      
    if (error) {
      console.log('❌ Error:', error.message);
      
      // Try with consultation_types as a string
      console.log('\n🧪 Test with consultation_types as string...');
      const testRecord2 = {
        user_id: '41cdfb01-a6e8-5b44-80b4-c232c4723817', // Dr. Alice Johnson
        start_date: '2025-10-08',
        end_date: '2025-10-08',
        start_time: '09:00:00',
        end_time: '10:00:00',
        consultation_types: 'video'
      };
      
      const { data: data2, error: error2 } = await supabase
        .from('availabilities')
        .insert(testRecord2)
        .select();
        
      if (error2) {
        console.log('❌ Error:', error2.message);
        
        // Try with a JSON string
        console.log('\n🧪 Test with consultation_types as JSON string...');
        const testRecord3 = {
          user_id: '41cdfb01-a6e8-5b44-80b4-c232c4723817', // Dr. Alice Johnson
          start_date: '2025-10-08',
          end_date: '2025-10-08',
          start_time: '09:00:00',
          end_time: '10:00:00',
          consultation_types: JSON.stringify(['video'])
        };
        
        const { data: data3, error: error3 } = await supabase
          .from('availabilities')
          .insert(testRecord3)
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
    } else {
      console.log('✅ Success!');
      console.log('Inserted record:', data[0]);
      
      // Clean up
      if (data && data.length > 0) {
        await supabase
          .from('availabilities')
          .delete()
          .eq('id', data[0].id);
        console.log('🧹 Cleaned up test record');
      }
    }
  } catch (error) {
    console.log('❌ Exception:', error.message);
  }
}

testAllRequiredFields();