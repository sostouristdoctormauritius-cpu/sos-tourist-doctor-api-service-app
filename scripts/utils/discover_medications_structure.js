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

async function discoverMedicationsStructure() {
  console.log('🔍 Discovering medications table structure...');
  
  // Try inserting an empty record to see what fields are required
  console.log('\n🧪 Test 1: Inserting empty record...');
  
  try {
    const { data, error } = await supabase
      .from('medications')
      .insert({})
      .select();
      
    if (error) {
      console.log('❌ Error with empty insert:', error.message);
      // Parse error to understand required fields
    } else {
      console.log('✅ Empty insert succeeded');
      
      // Clean up
      if (data && data.length > 0) {
        await supabase
          .from('medications')
          .delete()
          .eq('id', data[0].id);
        console.log('🧹 Cleaned up test record');
      }
    }
  } catch (error) {
    console.log('❌ Exception with empty insert:', error.message);
  }
  
  // Try with common medication fields
  console.log('\n🧪 Test 2: Inserting with common medication fields...');
  
  try {
    const testRecord = {
      name: 'Ibuprofen',
      dosage: '200mg',
      description: 'Nonsteroidal anti-inflammatory drug'
    };
    
    const { data, error } = await supabase
      .from('medications')
      .insert(testRecord)
      .select();
      
    if (error) {
      console.log('❌ Error with common fields:', error.message);
    } else {
      console.log('✅ Insert with common fields succeeded');
      console.log('Inserted record:', data[0]);
      
      // Clean up
      if (data && data.length > 0) {
        await supabase
          .from('medications')
          .delete()
          .eq('id', data[0].id);
        console.log('🧹 Cleaned up test record');
      }
    }
  } catch (error) {
    console.log('❌ Exception with common fields:', error.message);
  }
  
  // Try with just name field
  console.log('\n🧪 Test 3: Inserting with name field only...');
  
  try {
    const testRecord = {
      name: 'Paracetamol'
    };
    
    const { data, error } = await supabase
      .from('medications')
      .insert(testRecord)
      .select();
      
    if (error) {
      console.log('❌ Error with name field only:', error.message);
    } else {
      console.log('✅ Insert with name field only succeeded');
      console.log('Inserted record:', data[0]);
      
      // Clean up
      if (data && data.length > 0) {
        await supabase
          .from('medications')
          .delete()
          .eq('id', data[0].id);
        console.log('🧹 Cleaned up test record');
      }
    }
  } catch (error) {
    console.log('❌ Exception with name field only:', error.message);
  }
}

discoverMedicationsStructure();