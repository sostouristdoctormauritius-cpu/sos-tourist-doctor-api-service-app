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

async function checkInvoiceStatuses() {
  console.log('🔍 Checking valid invoice status values...');
  
  try {
    // Try different status values
    const testStatuses = ['pending', 'paid', 'overdue', 'cancelled'];
    
    console.log('\n🧪 Testing invoice status values:');
    
    for (const status of testStatuses) {
      // Get a sample appointment to use
      const { data: sampleAppointment, error: apptError } = await supabase
        .from('appointments')
        .select('id')
        .limit(1);
        
      if (apptError) {
        console.log(`❌ Error getting sample appointment:`, apptError.message);
        continue;
      }
      
      if (!sampleAppointment || sampleAppointment.length === 0) {
        console.log('❌ No sample appointment found');
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
        console.log(`   ❌ "${status}" - Invalid:`, error.message.includes('enum') ? 'Not in enum' : error.message);
      } else {
        console.log(`   ✅ "${status}" - Valid`);
        
        // Clean up
        await supabase
          .from('invoices')
          .delete()
          .eq('id', data[0].id);
      }
    }
    
  } catch (error) {
    console.log('❌ Exception during status check:', error.message);
  }
}

async function generateInvoicesProperly() {
  console.log('🧾 Generating invoices properly...');
  console.log('='.repeat(35));
  
  try {
    // First check what the valid invoice status values are
    console.log('\n🔍 Checking valid invoice status values...');
    const validStatuses = [];
    
    const testStatuses = ['pending', 'paid', 'overdue', 'cancelled'];
    for (const status of testStatuses) {
      // Get a sample appointment
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
        
      if (!error) {
        validStatuses.push(status);
        // Clean up
        await supabase
          .from('invoices')
          .delete()
          .eq('id', data[0].id);
      }
    }
    
    console.log('✅ Valid invoice statuses:', validStatuses);
    
    if (validStatuses.length === 0) {
      console.log('❌ No valid statuses found');
      return;
    }
    
    // Get doctors and their completed appointments
    console.log('\n📊 Getting doctor appointment data...');
    
    // Get all appointments grouped by doctor
    const { data: appointments, error: apptsError } = await supabase
      .from('appointments')
      .select('doctor_id, status, id');
      
    if (apptsError) {
      console.log('❌ Error fetching appointments:', apptsError.message);
      return;
    }
    
    // Group by doctor and count completed appointments
    const doctorStats = {};
    appointments.forEach(appt => {
      if (!doctorStats[appt.doctor_id]) {
        doctorStats[appt.doctor_id] = {
          completed: [],
          other: 0
        };
      }
      
      if (appt.status === 'completed') {
        doctorStats[appt.doctor_id].completed.push(appt.id);
      } else {
        doctorStats[appt.doctor_id].other++;
      }
    });
    
    // Filter to only doctors with completed appointments
    const doctorsWithCompleted = Object.entries(doctorStats)
      .filter(([doctorId, stats]) => stats.completed.length > 0);
      
    console.log(`✅ Found ${doctorsWithCompleted.length} doctors with completed appointments`);
    
    // Generate invoices for each doctor
    let totalInvoicesCreated = 0;
    
    console.log('\n🧾 Generating invoices...');
    
    for (const [doctorId, stats] of doctorsWithCompleted) {
      console.log(`\n👨‍⚕️ Doctor ${doctorId} (${stats.completed.length} completed appointments)`);
      
      // Get doctor details
      const { data: doctor, error: doctorError } = await supabase
        .from('users')
        .select('name, email')
        .eq('id', doctorId)
        .single();
        
      if (doctorError) {
        console.log(`❌ Error fetching doctor details:`, doctorError.message);
        continue;
      }
      
      console.log(`   Name: ${doctor.name}`);
      
      // Create one invoice for all completed appointments
      const totalAmount = stats.completed.length * 100; // $100 per appointment
      
      // Use the first valid status
      const invoiceStatus = validStatuses[0] || 'pending';
      
      // Use the first completed appointment ID for the main invoice
      const mainAppointmentId = stats.completed[0];
      
      const invoiceData = {
        appointment_id: mainAppointmentId,
        amount: totalAmount,
        currency: 'USD',
        status: invoiceStatus
      };
      
      const { data: invoice, error: invoiceError } = await supabase
        .from('invoices')
        .insert(invoiceData)
        .select();
        
      if (invoiceError) {
        console.log(`❌ Error creating invoice:`, invoiceError.message);
        continue;
      }
      
      console.log(`   ✅ Created invoice #${invoice[0].id} for $${totalAmount}`);
      totalInvoicesCreated++;
      
      // For the other completed appointments, we could create separate invoices
      // or handle them differently based on business requirements
      for (let i = 1; i < stats.completed.length; i++) {
        const additionalInvoiceData = {
          appointment_id: stats.completed[i],
          amount: 100,
          currency: 'USD',
          status: invoiceStatus
        };
        
        const { data: additionalInvoice, error: additionalError } = await supabase
          .from('invoices')
          .insert(additionalInvoiceData)
          .select();
          
        if (additionalError) {
          console.log(`   ❌ Error creating additional invoice:`, additionalError.message);
        } else {
          console.log(`   ✅ Created additional invoice #${additionalInvoice[0].id} for $100`);
          totalInvoicesCreated++;
        }
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
      .select('id, appointment_id, amount, currency, status')
      .limit(5);
      
    if (sampleError) {
      console.log('❌ Error fetching sample invoices:', sampleError.message);
    } else {
      sampleInvoices.forEach((invoice, index) => {
        console.log(`\n   Invoice ${index + 1}:`);
        console.log(`   ID: ${invoice.id}`);
        console.log(`   Appointment: ${invoice.appointment_id}`);
        console.log(`   Amount: $${invoice.amount}`);
        console.log(`   Currency: ${invoice.currency}`);
        console.log(`   Status: ${invoice.status}`);
      });
    }
    
    console.log('\n🎉 Invoice generation completed successfully!');
    
  } catch (error) {
    console.log('❌ Exception during invoice generation:', error.message);
  }
}

// Run the functions
async function run() {
  await checkInvoiceStatuses();
  await generateInvoicesProperly();
}

run();