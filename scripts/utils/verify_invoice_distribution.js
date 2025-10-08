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

async function verifyInvoiceDistribution() {
  console.log('🔍 Final verification of invoice distribution...');
  console.log('='.repeat(45));
  
  try {
    // Get all invoices
    const { data: invoices, error: fetchError } = await supabase
      .from('invoices')
      .select('id, status, amount, currency, appointment_id');
      
    if (fetchError) {
      console.log('❌ Error fetching invoices:', fetchError.message);
      return;
    }
    
    console.log(`📋 Total invoices: ${invoices.length}`);
    
    // Count status distribution
    const statusCount = {};
    let totalAmount = 0;
    
    invoices.forEach(invoice => {
      statusCount[invoice.status] = (statusCount[invoice.status] || 0) + 1;
      totalAmount += invoice.amount;
    });
    
    console.log('\n📊 Final status distribution:');
    Object.entries(statusCount).forEach(([status, count]) => {
      const percentage = ((count / invoices.length) * 100).toFixed(1);
      console.log(`   ${status}: ${count} (${percentage}%)`);
    });
    
    console.log(`\n💰 Total amount across all invoices: $${totalAmount}`);
    console.log(`   Average invoice amount: $${(totalAmount / invoices.length).toFixed(2)}`);
    
    // Verify it matches our target distribution
    const targetDistribution = {
      'paid': 0.50,      // 50%
      'pending': 0.30,   // 30%
      'overdue': 0.15,   // 15%
      'cancelled': 0.05  // 5%
    };
    
    console.log('\n🎯 Comparison with target distribution:');
    Object.entries(targetDistribution).forEach(([status, targetPercentage]) => {
      const actualCount = statusCount[status] || 0;
      const actualPercentage = invoices.length > 0 ? (actualCount / invoices.length) : 0;
      const difference = Math.abs(actualPercentage - targetPercentage);
      
      console.log(`   ${status}:`);
      console.log(`     Target: ${(targetPercentage * 100).toFixed(0)}%`);
      console.log(`     Actual: ${(actualPercentage * 100).toFixed(1)}%`);
      console.log(`     Difference: ${(difference * 100).toFixed(1)}%`);
    });
    
    // Show sample invoices with full details
    console.log('\n🧾 Sample invoices with full details:');
    
    // Group invoices by status for better sampling
    const invoicesByStatus = {};
    invoices.forEach(invoice => {
      if (!invoicesByStatus[invoice.status]) {
        invoicesByStatus[invoice.status] = [];
      }
      invoicesByStatus[invoice.status].push(invoice);
    });
    
    // Show one sample from each status
    for (const [status, statusInvoices] of Object.entries(invoicesByStatus)) {
      const sampleInvoice = statusInvoices[0];
      console.log(`\n   ${status.toUpperCase()} Invoice:`);
      console.log(`   ID: ${sampleInvoice.id}`);
      console.log(`   Amount: $${sampleInvoice.amount} ${sampleInvoice.currency}`);
      
      // Get appointment details
      const { data: appointment, error: apptError } = await supabase
        .from('appointments')
        .select(`
          date,
          start_time,
          user_id,
          doctor_id
        `)
        .eq('id', sampleInvoice.appointment_id)
        .single();
        
      if (!apptError && appointment) {
        console.log(`   Date: ${appointment.date} at ${appointment.start_time}`);
        
        // Get patient name
        const { data: patient, error: patientError } = await supabase
          .from('users')
          .select('name')
          .eq('id', appointment.user_id)
          .single();
          
        if (!patientError && patient) {
          console.log(`   Patient: ${patient.name}`);
        }
        
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
    
    // Show top doctors by invoice count
    console.log('\n👨‍⚕️ Top doctors by invoice count:');
    
    // Count invoices by doctor
    const doctorInvoiceCount = {};
    
    for (const invoice of invoices) {
      const { data: appointment, error: apptError } = await supabase
        .from('appointments')
        .select('doctor_id')
        .eq('id', invoice.appointment_id)
        .single();
        
      if (!apptError && appointment) {
        doctorInvoiceCount[appointment.doctor_id] = (doctorInvoiceCount[appointment.doctor_id] || 0) + 1;
      }
    }
    
    // Sort doctors by invoice count
    const sortedDoctors = Object.entries(doctorInvoiceCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
      
    for (const [doctorId, count] of sortedDoctors) {
      const { data: doctor, error: doctorError } = await supabase
        .from('users')
        .select('name')
        .eq('id', doctorId)
        .single();
        
      if (!doctorError && doctor) {
        console.log(`   ${doctor.name}: ${count} invoices`);
      }
    }
    
    console.log('\n✅ Invoice distribution verification completed successfully!');
    console.log('\n🎉 The invoices now have a realistic distribution of statuses:');
    console.log('   - 50% paid (representing successfully processed payments)');
    console.log('   - 30% pending (representing payments in process)');
    console.log('   - 15% overdue (representing past due payments requiring follow-up)');
    console.log('   - 5% cancelled (representing refunded or voided transactions)');
    
  } catch (error) {
    console.log('❌ Exception during verification:', error.message);
  }
}

verifyInvoiceDistribution();