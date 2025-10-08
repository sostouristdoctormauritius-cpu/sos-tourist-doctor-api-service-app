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

async function checkInvoicesStructure() {
  console.log('🔍 Checking invoices table structure...');
  
  try {
    // Try to insert a minimal invoice to see what fields are required
    console.log('\n🧪 Testing minimal invoice insertion...');
    
    const minimalInvoice = {
      amount: 100
    };
    
    const { data, error } = await supabase
      .from('invoices')
      .insert(minimalInvoice)
      .select();
      
    if (error) {
      console.log('❌ Error with minimal invoice:', error.message);
      
      // Try to parse the error to understand required fields
      if (error.message.includes('null value in column')) {
        console.log('   Required fields might include:', error.message);
      }
    } else {
      console.log('✅ Minimal invoice succeeded');
      
      // Clean up
      if (data && data.length > 0) {
        await supabase
          .from('invoices')
          .delete()
          .eq('id', data[0].id);
        console.log('🧹 Cleaned up test invoice');
      }
    }
    
    // Try with common invoice fields
    console.log('\n🧪 Testing with common invoice fields...');
    
    const commonInvoice = {
      amount: 100,
      currency: 'USD',
      status: 'pending'
    };
    
    const { data: data2, error: error2 } = await supabase
      .from('invoices')
      .insert(commonInvoice)
      .select();
      
    if (error2) {
      console.log('❌ Error with common fields:', error2.message);
    } else {
      console.log('✅ Common fields succeeded');
      console.log('Inserted invoice:', data2[0]);
      
      // Clean up
      if (data2 && data2.length > 0) {
        await supabase
          .from('invoices')
          .delete()
          .eq('id', data2[0].id);
        console.log('🧹 Cleaned up test invoice');
      }
    }
    
    // Try to get column information by selecting *
    console.log('\n📋 Getting sample invoice data...');
    const { data: sampleData, error: sampleError } = await supabase
      .from('invoices')
      .select('*')
      .limit(1);
      
    if (sampleError) {
      console.log('❌ Error getting sample data:', sampleError.message);
    } else {
      if (sampleData && sampleData.length > 0) {
        console.log('Fields in invoices table:');
        Object.keys(sampleData[0]).forEach(key => {
          console.log(`   - ${key}`);
        });
      } else {
        console.log('   Table is empty');
      }
    }
    
  } catch (error) {
    console.log('❌ Exception during structure check:', error.message);
  }
}

checkInvoicesStructure();