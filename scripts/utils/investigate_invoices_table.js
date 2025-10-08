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

async function investigateInvoicesTable() {
  console.log('🔍 Investigating invoices table structure...');
  console.log('='.repeat(45));
  
  try {
    // Try to get information about the invoices table columns
    console.log('\n📋 Attempting to get column information...');
    
    // Try a simple select to see what columns exist
    const { data: sampleData, error: sampleError } = await supabase
      .from('invoices')
      .select('*')
      .limit(1);
      
    if (sampleError) {
      console.log('❌ Error selecting from invoices:', sampleError.message);
    } else {
      if (sampleData && sampleData.length > 0) {
        console.log('✅ Successfully selected from invoices');
        console.log('Fields in invoices table:');
        Object.keys(sampleData[0]).forEach(key => {
          console.log(`   - ${key}`);
        });
      } else {
        console.log('   Invoices table is empty');
      }
    }
    
    // Try to insert a minimal record to understand required fields
    console.log('\n🧪 Testing minimal invoice insertion...');
    
    // First get a sample appointment
    const { data: sampleAppointment, error: apptError } = await supabase
      .from('appointments')
      .select('id')
      .limit(1);
      
    if (apptError) {
      console.log('❌ Error getting sample appointment:', apptError.message);
      return;
    }
    
    if (!sampleAppointment || sampleAppointment.length === 0) {
      console.log('❌ No sample appointment found');
      return;
    }
    
    // Try inserting with just required fields
    const minimalInvoice = {
      appointment_id: sampleAppointment[0].id,
      amount: 100
    };
    
    const { data: insertData, error: insertError } = await supabase
      .from('invoices')
      .insert(minimalInvoice)
      .select();
      
    if (insertError) {
      console.log('❌ Error with minimal invoice:', insertError.message);
      
      // Try to parse error to understand required fields
      if (insertError.message.includes('null value in column')) {
        console.log('   Required field error:', insertError.message);
      }
    } else {
      console.log('✅ Minimal invoice insertion succeeded');
      console.log('Inserted record:', insertData[0]);
      
      // Clean up
      if (insertData && insertData.length > 0) {
        await supabase
          .from('invoices')
          .delete()
          .eq('id', insertData[0].id);
        console.log('🧹 Cleaned up test invoice');
      }
    }
    
    // Try to understand what status values work by checking existing invoices
    console.log('\n📊 Checking existing invoice statuses...');
    
    const { data: existingInvoices, error: existingError } = await supabase
      .from('invoices')
      .select('status');
      
    if (existingError) {
      console.log('❌ Error fetching existing invoices:', existingError.message);
    } else {
      if (existingInvoices && existingInvoices.length > 0) {
        console.log(`✅ Found ${existingInvoices.length} existing invoices`);
        
        // Get unique statuses
        const statuses = [...new Set(existingInvoices.map(invoice => invoice.status))];
        console.log('   Current statuses:', statuses);
      } else {
        console.log('   No existing invoices found');
      }
    }
    
    // Try to get enum values directly from PostgreSQL
    console.log('\n🔍 Attempting to get enum values directly...');
    
    // Try a raw SQL query to get enum values
    try {
      // This might not work due to schema cache limitations
      const { data: enumData, error: enumError } = await supabase.rpc('execute_sql', {
        sql: `
          SELECT t.typname, e.enumlabel
          FROM pg_type t
          JOIN pg_enum e ON t.oid = e.enumtypid
          WHERE t.typname LIKE '%status%'
          ORDER BY e.enumsortorder;
        `
      });
      
      if (enumError) {
        console.log('❌ Error getting enum data:', enumError.message);
      } else {
        console.log('✅ Enum data retrieved:');
        console.log(enumData);
      }
    } catch (sqlError) {
      console.log('❌ Error with SQL query:', sqlError.message);
    }
    
  } catch (error) {
    console.log('❌ Exception during investigation:', error.message);
  }
}

investigateInvoicesTable();