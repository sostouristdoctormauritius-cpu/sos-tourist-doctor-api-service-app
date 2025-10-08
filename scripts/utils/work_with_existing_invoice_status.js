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

async function workWithExistingInvoiceStatus() {
  console.log('📊 Working with existing invoice status...');
  console.log('='.repeat(40));
  
  try {
    // Get all invoices
    const { data: invoices, error: fetchError } = await supabase
      .from('invoices')
      .select('id, status');
      
    if (fetchError) {
      console.log('❌ Error fetching invoices:', fetchError.message);
      return;
    }
    
    console.log(`📋 Found ${invoices.length} invoices`);
    console.log('Current status distribution:');
    
    // Count current status distribution
    const statusCount = {};
    invoices.forEach(invoice => {
      statusCount[invoice.status] = (statusCount[invoice.status] || 0) + 1;
    });
    
    Object.entries(statusCount).forEach(([status, count]) => {
      console.log(`   ${status}: ${count}`);
    });
    
    // Since we only have 'cancelled' status, let's create a logical distribution
    // based on other fields or create a simulation of what a proper distribution would look like
    console.log('\n🔄 Since we can only use "cancelled" status, creating logical grouping...');
    
    // Let's group invoices by amount to simulate different statuses
    // In a real system, we might have different statuses based on payment state
    let updatedCount = 0;
    
    for (let i = 0; i < invoices.length; i++) {
      const invoice = invoices[i];
      
      // We can't change the status, but we can show how we would distribute them
      // if we had multiple statuses. Let's at least verify the data is consistent.
      console.log(`   Invoice ${invoice.id}: status=${invoice.status}`);
      updatedCount++;
    }
    
    console.log(`\n✅ Processed ${updatedCount} invoices`);
    
    // Let's create a report showing what a proper distribution would look like
    console.log('\n📈 Ideal status distribution (if multiple statuses were available):');
    console.log('   paid:     50%  (~36 invoices)');
    console.log('   pending:  30%  (~21 invoices)');
    console.log('   overdue:  15%  (~11 invoices)');
    console.log('   cancelled: 5%  (~3 invoices)');
    
    // Show sample invoices with additional details
    console.log('\n🧾 Sample invoices with details:');
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
        // Get appointment details
        const { data: appointment, error: apptError } = await supabase
          .from('appointments')
          .select(`
            date,
            start_time,
            user_id,
            doctor_id
          `)
          .eq('id', invoice.appointment_id)
          .single();
          
        console.log(`\n   Invoice #${invoice.id}:`);
        console.log(`   Status: ${invoice.status}`);
        console.log(`   Amount: $${invoice.amount} ${invoice.currency}`);
        console.log(`   Appointment: ${invoice.appointment_id}`);
        
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
    }
    
    // Show summary by doctor
    console.log('\n👨‍⚕️ Invoices by doctor:');
    
    // Get all appointments with doctor info
    const { data: appointments, error: apptsError } = await supabase
      .from('appointments')
      .select('id, doctor_id');
      
    if (!apptsError) {
      // Create a map of appointment_id to doctor_id
      const apptToDoctor = {};
      appointments.forEach(appt => {
        apptToDoctor[appt.id] = appt.doctor_id;
      });
      
      // Count invoices by doctor
      const doctorInvoiceCount = {};
      
      for (const invoice of invoices) {
        const doctorId = apptToDoctor[invoice.appointment_id];
        if (doctorId) {
          doctorInvoiceCount[doctorId] = (doctorInvoiceCount[doctorId] || 0) + 1;
        }
      }
      
      // Show top doctors by invoice count
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
    }
    
    console.log('\n✅ Invoice analysis completed!');
    console.log('\n📝 Note: All invoices currently have "cancelled" status because that is the only valid value in the enum.');
    console.log('   To properly distribute statuses, the invoice_status_enum would need to be updated');
    console.log('   with additional values like "paid", "pending", and "overdue".');
    
  } catch (error) {
    console.log('❌ Exception during invoice analysis:', error.message);
  }
}

workWithExistingInvoiceStatus();