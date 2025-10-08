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

async function checkValidInvoiceStatuses() {
  console.log('🔍 Checking valid invoice status values...');
  
  try {
    // Try different status values to see which ones are valid
    const testStatuses = ['pending', 'paid', 'overdue', 'cancelled', 'draft', 'void'];
    
    console.log('\n🧪 Testing invoice status values:');
    
    const validStatuses = [];
    
    for (const status of testStatuses) {
      // Get a sample appointment to use
      const { data: sampleAppointment, error: apptError } = await supabase
        .from('appointments')
        .select('id')
        .limit(1);
        
      if (apptError || !sampleAppointment || sampleAppointment.length === 0) {
        continue;
      }
      
      // Try to insert an invoice with this status
      const testInvoice = {
        appointment_id: sampleAppointment[0].id,
        amount: 100,
        currency: 'USD',
        status: status
      };
      
      const { data, error } = await supabase
        .from('invoices')
        .insert(testInvoice)
        .select();
        
      if (error) {
        console.log(`   ❌ "${status}" - Invalid:`, error.message.includes('enum') ? 'Not in enum' : 'Other error');
      } else {
        console.log(`   ✅ "${status}" - Valid`);
        validStatuses.push(status);
        
        // Clean up
        await supabase
          .from('invoices')
          .delete()
          .eq('id', data[0].id);
      }
    }
    
    return validStatuses;
    
  } catch (error) {
    console.log('❌ Exception during status check:', error.message);
    return [];
  }
}

async function distributeInvoiceStatuses() {
  console.log('📊 Distributing invoice statuses...');
  console.log('='.repeat(35));
  
  try {
    // First check what the valid invoice status values are
    const validStatuses = await checkValidInvoiceStatuses();
    
    if (validStatuses.length === 0) {
      console.log('❌ No valid statuses found. Cannot distribute statuses.');
      return;
    }
    
    console.log('\n✅ Valid invoice statuses:', validStatuses);
    
    // Get all invoices
    const { data: invoices, error: fetchError } = await supabase
      .from('invoices')
      .select('id, status');
      
    if (fetchError) {
      console.log('❌ Error fetching invoices:', fetchError.message);
      return;
    }
    
    console.log(`\n📋 Found ${invoices.length} invoices`);
    
    // Count current status distribution
    const statusCount = {};
    invoices.forEach(invoice => {
      statusCount[invoice.status] = (statusCount[invoice.status] || 0) + 1;
    });
    
    console.log('\n📊 Current status distribution:');
    Object.entries(statusCount).forEach(([status, count]) => {
      console.log(`   ${status}: ${count}`);
    });
    
    // Define distribution (if we have multiple valid statuses)
    // Let's make about 50% paid, 30% pending, 15% overdue, 5% cancelled (if available)
    const distribution = {};
    if (validStatuses.includes('paid')) {
      distribution.paid = 0.5;
    }
    if (validStatuses.includes('pending')) {
      distribution.pending = 0.3;
    }
    if (validStatuses.includes('overdue')) {
      distribution.overdue = 0.15;
    }
    if (validStatuses.includes('cancelled')) {
      distribution.cancelled = 0.05;
    }
    
    // If we don't have enough valid statuses, just use what we have
    if (Object.keys(distribution).length === 0) {
      console.log('⚠️  No standard statuses found. Using available statuses.');
      validStatuses.forEach((status, index) => {
        if (index === 0) distribution[status] = 1.0; // All to first status
      });
    }
    
    console.log('\n🎯 Target distribution:');
    Object.entries(distribution).forEach(([status, percentage]) => {
      console.log(`   ${status}: ${(percentage * 100).toFixed(0)}%`);
    });
    
    // Update invoices to have a spread of statuses
    let updatedCount = 0;
    
    for (let i = 0; i < invoices.length; i++) {
      const invoice = invoices[i];
      
      // Determine new status based on position
      let newStatus;
      const position = i / invoices.length;
      
      let cumulative = 0;
      for (const [status, percentage] of Object.entries(distribution)) {
        cumulative += percentage;
        if (position < cumulative) {
          newStatus = status;
          break;
        }
      }
      
      // If no status was assigned, use the first valid status
      if (!newStatus && validStatuses.length > 0) {
        newStatus = validStatuses[0];
      }
      
      // Only update if status is changing
      if (invoice.status !== newStatus) {
        const { data, error } = await supabase
          .from('invoices')
          .update({ status: newStatus })
          .eq('id', invoice.id);
          
        if (error) {
          console.log(`❌ Error updating invoice ${invoice.id}:`, error.message);
        } else {
          console.log(`   ✅ Updated invoice ${invoice.id} from ${invoice.status} to ${newStatus}`);
          updatedCount++;
        }
      } else {
        console.log(`   ➡️  Invoice ${invoice.id} already has status ${newStatus}`);
      }
    }
    
    console.log(`\n✅ Updated ${updatedCount} invoices`);
    
    // Verify the update
    console.log('\n🔍 Verifying update...');
    const { data: updatedInvoices, error: verifyError } = await supabase
      .from('invoices')
      .select('id, status');
      
    if (verifyError) {
      console.log('❌ Error verifying update:', verifyError.message);
      return;
    }
    
    const updatedStatusCount = {};
    updatedInvoices.forEach(invoice => {
      updatedStatusCount[invoice.status] = (updatedStatusCount[invoice.status] || 0) + 1;
    });
    
    console.log('📊 Updated status distribution:');
    Object.entries(updatedStatusCount).forEach(([status, count]) => {
      const percentage = ((count / updatedInvoices.length) * 100).toFixed(1);
      console.log(`   ${status}: ${count} (${percentage}%)`);
    });
    
    // Show sample invoices
    console.log('\n🧾 Sample updated invoices:');
    const { data: sampleInvoices, error: sampleError } = await supabase
      .from('invoices')
      .select(`
        id,
        status,
        amount,
        currency
      `)
      .limit(5);
      
    if (sampleError) {
      console.log('❌ Error fetching sample invoices:', sampleError.message);
    } else {
      sampleInvoices.forEach((invoice, index) => {
        console.log(`\n   Invoice ${index + 1}:`);
        console.log(`   ID: ${invoice.id}`);
        console.log(`   Status: ${invoice.status}`);
        console.log(`   Amount: $${invoice.amount}`);
        console.log(`   Currency: ${invoice.currency}`);
      });
    }
    
    console.log('\n🎉 Invoice status distribution completed!');
    
  } catch (error) {
    console.log('❌ Exception during invoice status distribution:', error.message);
  }
}

distributeInvoiceStatuses();