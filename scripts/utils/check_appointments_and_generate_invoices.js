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

async function checkAppointmentsAndGenerateInvoices() {
  console.log('🔍 Checking appointment structure and generating invoices...');
  console.log('='.repeat(55));
  
  try {
    // Check appointment structure
    console.log('\n📋 Checking appointment structure...');
    const { data: sampleAppointment, error: sampleError } = await supabase
      .from('appointments')
      .select('*')
      .limit(1);
      
    if (sampleError) {
      console.log('❌ Error fetching sample appointment:', sampleError.message);
      return;
    }
    
    if (sampleAppointment && sampleAppointment.length > 0) {
      console.log('Fields in appointments table:');
      Object.keys(sampleAppointment[0]).forEach(key => {
        console.log(`   - ${key}`);
      });
    }
    
    // Check the distribution of doctors in appointments
    console.log('\n📊 Doctor distribution in appointments:');
    const { data: appointments, error: apptsError } = await supabase
      .from('appointments')
      .select('doctor_id, status');
      
    if (apptsError) {
      console.log('❌ Error fetching appointments:', apptsError.message);
      return;
    }
    
    // Group by doctor_id and count appointments by status
    const doctorStats = {};
    appointments.forEach(appt => {
      if (!doctorStats[appt.doctor_id]) {
        doctorStats[appt.doctor_id] = {
          total: 0,
          completed: 0,
          confirmed: 0,
          cancelled: 0
        };
      }
      
      doctorStats[appt.doctor_id].total++;
      doctorStats[appt.doctor_id][appt.status]++;
    });
    
    console.log(`Found ${Object.keys(doctorStats).length} unique doctors in appointments`);
    
    // Show top doctors by completed appointments
    const doctorsWithCompleted = Object.entries(doctorStats)
      .filter(([doctorId, stats]) => stats.completed > 0)
      .sort((a, b) => b[1].completed - a[1].completed);
      
    console.log(`Doctors with completed appointments: ${doctorsWithCompleted.length}`);
    
    // Get doctor details for those with completed appointments
    console.log('\n📋 Doctors with completed appointments:');
    let invoiceCount = 0;
    
    for (const [doctorId, stats] of doctorsWithCompleted) {
      // Get doctor details
      const { data: doctor, error: doctorError } = await supabase
        .from('users')
        .select('name, email')
        .eq('id', doctorId)
        .single();
        
      if (doctorError) {
        console.log(`❌ Error fetching doctor ${doctorId}:`, doctorError.message);
        continue;
      }
      
      console.log(`\n👨‍⚕️ ${doctor.name} (${doctor.email})`);
      console.log(`   ID: ${doctorId}`);
      console.log(`   Completed: ${stats.completed}`);
      console.log(`   Confirmed: ${stats.confirmed}`);
      console.log(`   Cancelled: ${stats.cancelled}`);
      console.log(`   Total: ${stats.total}`);
      
      // Generate invoice for this doctor
      if (stats.completed > 0) {
        console.log(`   💵 Generating invoice for ${stats.completed} completed appointments...`);
        
        const amount = stats.completed * 100; // $100 per appointment
        
        const invoiceData = {
          doctor_id: doctorId,
          amount: amount,
          currency: 'USD',
          status: 'pending',
          invoice_date: new Date().toISOString().split('T')[0],
          due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          description: `Invoice for ${stats.completed} completed appointments`
        };
        
        const { data: invoice, error: invoiceError } = await supabase
          .from('invoices')
          .insert(invoiceData)
          .select();
          
        if (invoiceError) {
          console.log(`   ❌ Error creating invoice:`, invoiceError.message);
        } else {
          console.log(`   ✅ Created invoice #${invoice[0].id} for $${amount}`);
          invoiceCount++;
          
          // Add line items for the completed appointments
          // First get the completed appointments for this doctor
          const { data: completedAppointments, error: completedError } = await supabase
            .from('appointments')
            .select('id, date, start_time')
            .eq('doctor_id', doctorId)
            .eq('status', 'completed');
            
          if (completedError) {
            console.log(`   ❌ Error fetching completed appointments:`, completedError.message);
          } else {
            console.log(`   📄 Adding ${completedAppointments.length} line items...`);
            
            // Add a line item for each completed appointment
            for (const appointment of completedAppointments) {
              const lineItem = {
                invoice_id: invoice[0].id,
                appointment_id: appointment.id,
                description: `Medical consultation on ${appointment.date} at ${appointment.start_time}`,
                amount: 100,
                quantity: 1
              };
              
              const { error: lineItemError } = await supabase
                .from('invoice_line_items')
                .insert(lineItem);
                
              if (lineItemError) {
                console.log(`   ❌ Error creating line item for appointment ${appointment.id}:`, lineItemError.message);
              }
            }
            
            console.log(`   ✅ Added ${completedAppointments.length} line items`);
          }
        }
      }
    }
    
    console.log(`\n✅ Successfully created ${invoiceCount} invoices`);
    
    // Verify invoices
    console.log('\n🔍 Verifying invoices...');
    const { count, error: countError } = await supabase
      .from('invoices')
      .select('*', { count: 'exact', head: true });
      
    if (countError) {
      console.log('❌ Error counting invoices:', countError.message);
    } else {
      console.log(`✅ Total invoices in database: ${count}`);
    }
    
    // Show sample invoices
    console.log('\n🧾 Sample invoices:');
    const { data: sampleInvoices, error: sampleError2 } = await supabase
      .from('invoices')
      .select('id, doctor_id, amount, status, invoice_date, due_date')
      .limit(3);
      
    if (sampleError2) {
      console.log('❌ Error fetching sample invoices:', sampleError2.message);
    } else {
      for (const invoice of sampleInvoices) {
        // Get doctor name
        const { data: doctor, error: doctorError } = await supabase
          .from('users')
          .select('name')
          .eq('id', invoice.doctor_id)
          .single();
          
        console.log(`\n   Invoice #${invoice.id}:`);
        console.log(`   Doctor: ${doctor ? doctor.name : invoice.doctor_id}`);
        console.log(`   Amount: $${invoice.amount}`);
        console.log(`   Status: ${invoice.status}`);
        console.log(`   Invoice Date: ${invoice.invoice_date}`);
        console.log(`   Due Date: ${invoice.due_date}`);
      }
    }
    
    // Show sample line items
    console.log('\n📄 Sample invoice line items:');
    const { data: sampleLineItems, error: lineItemsError } = await supabase
      .from('invoice_line_items')
      .select('id, invoice_id, appointment_id, description, amount, quantity')
      .limit(3);
      
    if (lineItemsError) {
      console.log('❌ Error fetching sample line items:', lineItemsError.message);
    } else {
      sampleLineItems.forEach((item, index) => {
        console.log(`\n   Line Item ${index + 1}:`);
        console.log(`   ID: ${item.id}`);
        console.log(`   Invoice: ${item.invoice_id}`);
        console.log(`   Appointment: ${item.appointment_id}`);
        console.log(`   Description: ${item.description}`);
        console.log(`   Amount: $${item.amount}`);
        console.log(`   Quantity: ${item.quantity}`);
      });
    }
    
    console.log('\n🎉 Invoice generation completed!');
    
  } catch (error) {
    console.log('❌ Exception during process:', error.message);
  }
}

checkAppointmentsAndGenerateInvoices();