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

async function correctedUpdateAppointments() {
  console.log('📋 Corrected appointment status update...');
  console.log('='.repeat(40));
  
  try {
    // Get all appointments and their current statuses
    const { data: appointments, error: fetchError } = await supabase
      .from('appointments')
      .select('id, user_id, doctor_id, status, date, start_time');
      
    if (fetchError) {
      console.log('❌ Error fetching appointments:', fetchError.message);
      return;
    }
    
    console.log(`✅ Found ${appointments.length} appointments`);
    
    // Count current status distribution
    const statusCount = {};
    appointments.forEach(appt => {
      statusCount[appt.status] = (statusCount[appt.status] || 0) + 1;
    });
    
    console.log('\n📊 Current status distribution:');
    Object.entries(statusCount).forEach(([status, count]) => {
      console.log(`   ${status}: ${count}`);
    });
    
    // Valid statuses are: confirmed, completed, cancelled
    // Update appointments to have a spread of these valid statuses
    // Let's make about 60% completed, 30% confirmed, 10% cancelled
    let updatedCount = 0;
    
    for (let i = 0; i < appointments.length; i++) {
      const appointment = appointments[i];
      
      // Determine new status based on position
      let newStatus;
      const position = i / appointments.length;
      
      if (position < 0.6) {
        newStatus = 'completed'; // 60% completed
      } else if (position < 0.9) {
        newStatus = 'confirmed'; // 30% confirmed
      } else {
        newStatus = 'cancelled'; // 10% cancelled
      }
      
      // Only update if status is changing
      if (appointment.status !== newStatus) {
        const { data, error } = await supabase
          .from('appointments')
          .update({ status: newStatus })
          .eq('id', appointment.id);
          
        if (error) {
          console.log(`❌ Error updating appointment ${appointment.id}:`, error.message);
        } else {
          console.log(`   ✅ Updated appointment ${appointment.id} from ${appointment.status} to ${newStatus}`);
          updatedCount++;
        }
      } else {
        console.log(`   ➡️  Appointment ${appointment.id} already has status ${newStatus}`);
      }
    }
    
    console.log(`\n✅ Updated ${updatedCount} appointments`);
    
    // Verify the update
    console.log('\n🔍 Verifying update...');
    const { data: updatedAppointments, error: verifyError } = await supabase
      .from('appointments')
      .select('id, status');
      
    if (verifyError) {
      console.log('❌ Error verifying update:', verifyError.message);
      return;
    }
    
    const updatedStatusCount = {};
    updatedAppointments.forEach(appt => {
      updatedStatusCount[appt.status] = (updatedStatusCount[appt.status] || 0) + 1;
    });
    
    console.log('📊 Updated status distribution:');
    Object.entries(updatedStatusCount).forEach(([status, count]) => {
      console.log(`   ${status}: ${count}`);
    });
    
    console.log('\n🎉 Appointment status update completed!');
    
    // Now generate invoices for doctors based on completed appointments
    console.log('\n🧾 Generating invoices for doctors...');
    await generateInvoices();
    
  } catch (error) {
    console.log('❌ Exception during appointment update:', error.message);
  }
}

async function generateInvoices() {
  try {
    // Get all doctors
    const { data: doctors, error: doctorsError } = await supabase
      .from('users')
      .select('id, name, email')
      .eq('role', 'patient'); // All users are now patients
      
    if (doctorsError) {
      console.log('❌ Error fetching doctors:', doctorsError.message);
      return;
    }
    
    console.log(`✅ Found ${doctors.length} doctors (all users are now patients)`);
    
    // Get completed appointments for each doctor
    let totalInvoicesCreated = 0;
    
    for (const doctor of doctors) {
      console.log(`\n👨‍⚕️ Processing invoices for ${doctor.name}...`);
      
      // Get completed appointments for this doctor
      const { data: completedAppointments, error: apptsError } = await supabase
        .from('appointments')
        .select('id, user_id, consultation_type, date, start_time')
        .eq('doctor_id', doctor.id)
        .eq('status', 'completed');
        
      if (apptsError) {
        console.log(`❌ Error fetching completed appointments for ${doctor.name}:`, apptsError.message);
        continue;
      }
      
      console.log(`   Completed appointments: ${completedAppointments.length}`);
      
      if (completedAppointments.length === 0) {
        console.log(`   ➡️  No completed appointments, skipping invoice creation`);
        continue;
      }
      
      // Calculate invoice amount based on number of appointments
      // Let's assume $100 per appointment
      const amount = completedAppointments.length * 100;
      
      // Create invoice record
      const invoiceData = {
        doctor_id: doctor.id,
        amount: amount,
        currency: 'USD',
        status: 'pending', // Default status
        invoice_date: new Date().toISOString().split('T')[0], // Today's date
        due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days from now
        description: `Invoice for ${completedAppointments.length} completed appointments`
      };
      
      const { data: invoice, error: invoiceError } = await supabase
        .from('invoices')
        .insert(invoiceData)
        .select();
        
      if (invoiceError) {
        console.log(`❌ Error creating invoice for ${doctor.name}:`, invoiceError.message);
      } else {
        console.log(`   ✅ Created invoice #${invoice[0].id} for $${amount}`);
        totalInvoicesCreated++;
        
        // Add line items for each appointment
        for (const appointment of completedAppointments) {
          const lineItem = {
            invoice_id: invoice[0].id,
            appointment_id: appointment.id,
            description: `Appointment on ${appointment.date} at ${appointment.start_time}`,
            amount: 100, // $100 per appointment
            quantity: 1
          };
          
          const { error: lineItemError } = await supabase
            .from('invoice_line_items')
            .insert(lineItem);
            
          if (lineItemError) {
            console.log(`   ❌ Error creating line item for appointment ${appointment.id}:`, lineItemError.message);
          }
        }
        
        console.log(`   📄 Added ${completedAppointments.length} line items to invoice`);
      }
    }
    
    console.log(`\n✅ Successfully created ${totalInvoicesCreated} invoices`);
    
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
    const { data: sampleInvoices, error: sampleError } = await supabase
      .from('invoices')
      .select(`
        id,
        doctor_id,
        amount,
        status,
        invoice_date,
        due_date,
        users (name)
      `)
      .limit(3);
      
    if (sampleError) {
      console.log('❌ Error fetching sample invoices:', sampleError.message);
    } else {
      sampleInvoices.forEach((invoice, index) => {
        console.log(`\n   Invoice ${index + 1}:`);
        console.log(`   ID: ${invoice.id}`);
        console.log(`   Doctor: ${invoice.users ? invoice.users.name : invoice.doctor_id}`);
        console.log(`   Amount: $${invoice.amount}`);
        console.log(`   Status: ${invoice.status}`);
        console.log(`   Invoice Date: ${invoice.invoice_date}`);
        console.log(`   Due Date: ${invoice.due_date}`);
      });
    }
    
  } catch (error) {
    console.log('❌ Exception during invoice generation:', error.message);
  }
}

correctedUpdateAppointments();