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

async function checkInvoiceStatusEnum() {
  console.log('🔍 Checking invoice status enum values...');
  
  try {
    // Try different status values to see which ones work
    const testStatuses = ['paid', 'pending', 'overdue'];
    const workingStatuses = [];
    
    // Get a sample appointment
    const { data: sampleAppointment, error: apptError } = await supabase
      .from('appointments')
      .select('id')
      .limit(1);
      
    if (apptError) {
      console.log('❌ Error getting sample appointment:', apptError.message);
      return [];
    }
    
    if (!sampleAppointment || sampleAppointment.length === 0) {
      console.log('❌ No sample appointment found');
      return [];
    }
    
    // Test each status
    for (const status of testStatuses) {
      // Try to insert a test invoice with this status
      const testInvoice = {
        appointment_id: sampleAppointment[0].id,
        amount: 100,
        status: status
      };
      
      const { data, error } = await supabase
        .from('invoices')
        .insert(testInvoice)
        .select();
        
      if (error) {
        console.log(`   ❌ "${status}" - Not available`);
      } else {
        console.log(`   ✅ "${status}" - Available`);
        workingStatuses.push(status);
        
        // Clean up
        await supabase
          .from('invoices')
          .delete()
          .eq('id', data[0].id);
      }
    }
    
    return workingStatuses;
    
  } catch (error) {
    console.log('❌ Exception during enum check:', error.message);
    return [];
  }
}

async function distributeInvoices() {
  console.log('📊 Distributing invoices according to planned distribution...');
  console.log('='.repeat(55));
  
  try {
    // Check which statuses are available
    const availableStatuses = await checkInvoiceStatusEnum();
    
    console.log('\n✅ Available invoice statuses:', availableStatuses);
    
    // If we don't have the required statuses, we can't distribute properly
    if (availableStatuses.length === 0) {
      console.log('\n❌ Cannot distribute invoices - no additional statuses available');
      console.log('   Please add "paid", "pending", and "overdue" to the invoice_status_enum');
      console.log('   by running these SQL commands in your Supabase dashboard:');
      console.log('   ');
      console.log('   ALTER TYPE invoice_status_enum ADD VALUE \'paid\';');
      console.log('   ALTER TYPE invoice_status_enum ADD VALUE \'pending\';');
      console.log('   ALTER TYPE invoice_status_enum ADD VALUE \'overdue\';');
      console.log('   ');
      return;
    }
    
    // Get all invoices
    const { data: invoices, error: fetchError } = await supabase
      .from('invoices')
      .select('id, status');
      
    if (fetchError) {
      console.log('❌ Error fetching invoices:', fetchError.message);
      return;
    }
    
    console.log(`\n📋 Found ${invoices.length} invoices to distribute`);
    
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
    
    // Update invoices to match target distribution
    let updatedCount = 0;
    
    // Sort invoices to ensure consistent distribution
    invoices.sort((a, b) => a.id.localeCompare(b.id));
    
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
        } else {
          console.log(`   ✅ Updated invoice ${invoice.id} from ${invoice.status} to ${targetStatus}`);
          updatedCount++;
        }
      } else {
        console.log(`   ➡️  Invoice ${invoice.id} already has status ${targetStatus}`);
      }
    }
    
    console.log(`\n✅ Updated ${updatedCount} invoices`);
    
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
        currency,
        appointment_id
      `)
      .limit(5);
      
    if (sampleError) {
      console.log('❌ Error fetching sample invoices:', sampleError.message);
    } else {
      for (const invoice of sampleInvoices) {
        console.log(`\n   Invoice #${invoice.id.substring(0, 8)}...:`);
        console.log(`   Status: ${invoice.status}`);
        console.log(`   Amount: $${invoice.amount} ${invoice.currency}`);
        
        // Get appointment details
        const { data: appointment, error: apptError } = await supabase
          .from('appointments')
          .select(`
            date,
            start_time,
            doctor_id
          `)
          .eq('id', invoice.appointment_id)
          .single();
          
        if (!apptError && appointment) {
          console.log(`   Date: ${appointment.date} at ${appointment.start_time}`);
          
          // Get doctor name
          const { data: doctor, error: doctorError } = await supabase
            .from('users')
            .select('name')
            .eq('id', appointment.doctor_id)
            .single();
            
          if (!doctorError && doctor) {
            console.log(`   Doctor: ${doctor.name}`);
          }
        }
      }
    }
    
    console.log('\n🎉 Invoice distribution completed successfully!');
    
  } catch (error) {
    console.log('❌ Exception during invoice distribution:', error.message);
  }
}

distributeInvoices();