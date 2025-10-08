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

async function directInvoiceDistribution() {
  console.log('📊 Directly distributing invoices with new statuses...');
  console.log('='.repeat(50));
  
  try {
    // Get all invoices
    const { data: invoices, error: fetchError } = await supabase
      .from('invoices')
      .select('id, status');
      
    if (fetchError) {
      console.log('❌ Error fetching invoices:', fetchError.message);
      return;
    }
    
    console.log(`📋 Found ${invoices.length} invoices to distribute`);
    
    // Show current distribution
    const currentStatusCount = {};
    invoices.forEach(invoice => {
      currentStatusCount[invoice.status] = (currentStatusCount[invoice.status] || 0) + 1;
    });
    
    console.log('\n📊 Current status distribution:');
    Object.entries(currentStatusCount).forEach(([status, count]) => {
      console.log(`   ${status}: ${count}`);
    });
    
    // Define target distribution
    const targetDistribution = {
      'paid': 0.50,      // 50%
      'pending': 0.30,   // 30%
      'overdue': 0.15,   // 15%
      'cancelled': 0.05  // 5%
    };
    
    console.log('\n🎯 Target distribution:');
    Object.entries(targetDistribution).forEach(([status, percentage]) => {
      const count = Math.round(invoices.length * percentage);
      console.log(`   ${status}: ${count} invoices (${(percentage * 100).toFixed(0)}%)`);
    });
    
    // Sort invoices for consistent distribution
    invoices.sort((a, b) => a.id.localeCompare(b.id));
    
    // Update invoices to match target distribution
    let updatedCount = 0;
    let errors = 0;
    
    for (let i = 0; i < invoices.length; i++) {
      const invoice = invoices[i];
      
      // Determine target status based on position
      let targetStatus = 'cancelled'; // Default fallback
      const position = i / invoices.length;
      
      let cumulativePercentage = 0;
      for (const [status, percentage] of Object.entries(targetDistribution)) {
        cumulativePercentage += percentage;
        if (position < cumulativePercentage) {
          targetStatus = status;
          break;
        }
      }
      
      // Only update if status is changing
      if (invoice.status !== targetStatus) {
        const { error } = await supabase
          .from('invoices')
          .update({ status: targetStatus })
          .eq('id', invoice.id);
          
        if (error) {
          console.log(`❌ Error updating invoice ${invoice.id}:`, error.message);
          errors++;
        } else {
          console.log(`   ✅ Updated invoice ${invoice.id} from ${invoice.status} to ${targetStatus}`);
          updatedCount++;
        }
      } else {
        console.log(`   ➡️  Invoice ${invoice.id} already has status ${targetStatus}`);
      }
    }
    
    console.log(`\n✅ Updated ${updatedCount} invoices`);
    if (errors > 0) {
      console.log(`❌ Encountered ${errors} errors`);
    }
    
    // Verify the new distribution
    console.log('\n🔍 Verifying new distribution...');
    const { data: updatedInvoices, error: verifyError } = await supabase
      .from('invoices')
      .select('id, status');
      
    if (verifyError) {
      console.log('❌ Error verifying update:', verifyError.message);
      return;
    }
    
    const newStatusCount = {};
    updatedInvoices.forEach(invoice => {
      newStatusCount[invoice.status] = (newStatusCount[invoice.status] || 0) + 1;
    });
    
    console.log('📊 New status distribution:');
    Object.entries(newStatusCount).forEach(([status, count]) => {
      const percentage = ((count / updatedInvoices.length) * 100).toFixed(1);
      console.log(`   ${status}: ${count} (${percentage}%)`);
    });
    
    // Show sample invoices
    console.log('\n🧾 Sample invoices with new statuses:');
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
        console.log(`   Amount: $${invoice.amount} ${invoice.currency}`);
      });
    }
    
    console.log('\n🎉 Invoice distribution completed!');
    
  } catch (error) {
    console.log('❌ Exception during invoice distribution:', error.message);
  }
}

directInvoiceDistribution();