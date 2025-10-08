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

async function organizeInvoicesWithCurrentStatus() {
  console.log('📊 Organizing invoices with current status...');
  console.log('='.repeat(45));
  
  try {
    // Get all invoices with details
    const { data: invoices, error: fetchError } = await supabase
      .from('invoices')
      .select(`
        id,
        status,
        amount,
        currency,
        appointment_id,
        created_at
      `);
      
    if (fetchError) {
      console.log('❌ Error fetching invoices:', fetchError.message);
      return;
    }
    
    console.log(`📋 Found ${invoices.length} invoices`);
    
    // Show current distribution
    const statusCount = {};
    invoices.forEach(invoice => {
      statusCount[invoice.status] = (statusCount[invoice.status] || 0) + 1;
    });
    
    console.log('\n📊 Current status distribution:');
    Object.entries(statusCount).forEach(([status, count]) => {
      console.log(`   ${status}: ${count}`);
    });
    
    // Get appointment details for all invoices
    console.log('\n🔗 Getting appointment details...');
    const appointmentIds = [...new Set(invoices.map(invoice => invoice.appointment_id))];
    
    const { data: appointments, error: apptsError } = await supabase
      .from('appointments')
      .select(`
        id,
        date,
        start_time,
        user_id,
        doctor_id
      `)
      .in('id', appointmentIds);
      
    if (apptsError) {
      console.log('❌ Error fetching appointments:', apptsError.message);
      return;
    }
    
    // Create lookup maps
    const appointmentMap = {};
    appointments.forEach(appt => {
      appointmentMap[appt.id] = appt;
    });
    
    // Get all users (patients and doctors)
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, name, email');
      
    if (usersError) {
      console.log('❌ Error fetching users:', usersError.message);
      return;
    }
    
    const userMap = {};
    users.forEach(user => {
      userMap[user.id] = user;
    });
    
    // Enhance invoices with appointment and user details
    const enhancedInvoices = invoices.map(invoice => {
      const appointment = appointmentMap[invoice.appointment_id];
      if (!appointment) return invoice;
      
      const patient = userMap[appointment.user_id];
      const doctor = userMap[appointment.doctor_id];
      
      return {
        ...invoice,
        appointment_date: appointment.date,
        appointment_time: appointment.start_time,
        patient_name: patient ? patient.name : 'Unknown Patient',
        patient_email: patient ? patient.email : 'Unknown',
        doctor_name: doctor ? doctor.name : 'Unknown Doctor',
        doctor_email: doctor ? doctor.email : 'Unknown'
      };
    });
    
    // Sort invoices by amount to show distribution
    enhancedInvoices.sort((a, b) => b.amount - a.amount);
    
    console.log('\n💰 Invoices sorted by amount:');
    enhancedInvoices.forEach((invoice, index) => {
      console.log(`${String(index + 1).padStart(2)}. $${invoice.amount} - ${invoice.doctor_name} - ${invoice.patient_name} - ${invoice.appointment_date}`);
    });
    
    // Group by doctor
    console.log('\n👨‍⚕️ Invoices by doctor:');
    const doctorInvoiceMap = {};
    enhancedInvoices.forEach(invoice => {
      const doctorName = invoice.doctor_name || 'Unknown Doctor';
      if (!doctorInvoiceMap[doctorName]) {
        doctorInvoiceMap[doctorName] = [];
      }
      doctorInvoiceMap[doctorName].push(invoice);
    });
    
    Object.entries(doctorInvoiceMap).forEach(([doctorName, doctorInvoices]) => {
      const totalAmount = doctorInvoices.reduce((sum, invoice) => sum + invoice.amount, 0);
      console.log(`   ${doctorName}: ${doctorInvoices.length} invoices, Total: $${totalAmount}`);
    });
    
    // Group by patient
    console.log('\n👤 Invoices by patient:');
    const patientInvoiceMap = {};
    enhancedInvoices.forEach(invoice => {
      const patientName = invoice.patient_name || 'Unknown Patient';
      if (!patientInvoiceMap[patientName]) {
        patientInvoiceMap[patientName] = [];
      }
      patientInvoiceMap[patientName].push(invoice);
    });
    
    Object.entries(patientInvoiceMap).forEach(([patientName, patientInvoices]) => {
      const totalAmount = patientInvoices.reduce((sum, invoice) => sum + invoice.amount, 0);
      console.log(`   ${patientName}: ${patientInvoices.length} invoices, Total: $${totalAmount}`);
    });
    
    // Show date range
    const dates = enhancedInvoices.map(invoice => new Date(invoice.appointment_date));
    const minDate = new Date(Math.min(...dates));
    const maxDate = new Date(Math.max(...dates));
    
    console.log(`\n📅 Date range: ${minDate.toISOString().split('T')[0]} to ${maxDate.toISOString().split('T')[0]}`);
    
    // Calculate totals
    const totalAmount = enhancedInvoices.reduce((sum, invoice) => sum + invoice.amount, 0);
    const averageAmount = totalAmount / enhancedInvoices.length;
    
    console.log(`\n🧮 Financial summary:`);
    console.log(`   Total amount: $${totalAmount}`);
    console.log(`   Average invoice: $${averageAmount.toFixed(2)}`);
    console.log(`   Highest invoice: $${enhancedInvoices[0].amount}`);
    console.log(`   Lowest invoice: $${enhancedInvoices[enhancedInvoices.length - 1].amount}`);
    
    // Show sample detailed invoices
    console.log('\n🧾 Sample detailed invoices:');
    enhancedInvoices.slice(0, 3).forEach((invoice, index) => {
      console.log(`\n   Invoice ${index + 1}:`);
      console.log(`   ID: ${invoice.id}`);
      console.log(`   Status: ${invoice.status}`);
      console.log(`   Amount: $${invoice.amount} ${invoice.currency}`);
      console.log(`   Date: ${invoice.appointment_date} at ${invoice.appointment_time}`);
      console.log(`   Patient: ${invoice.patient_name} (${invoice.patient_email})`);
      console.log(`   Doctor: ${invoice.doctor_name} (${invoice.doctor_email})`);
      console.log(`   Created: ${invoice.created_at}`);
    });
    
    console.log('\n📝 Note: All invoices currently show "cancelled" status because that is the only value');
    console.log('   available in the invoice_status_enum. To properly distribute statuses, please');
    console.log('   add "paid", "pending", and "overdue" values to the enum.');
    
    console.log('\n🎉 Invoice organization completed!');
    
  } catch (error) {
    console.log('❌ Exception during invoice organization:', error.message);
  }
}

organizeInvoicesWithCurrentStatus();