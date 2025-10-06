const { createClient } = require('@supabase/supabase-js');
const config = require('../config/config');
const logger = require('../config/logger');

// Initialize Supabase client
const supabase = createClient(config.supabase.url, config.supabase.serviceRoleKey);

/**
 * Migration script to create tables in Supabase
 */
async function migrateSchema() {
  console.log('Starting Supabase schema migration...');

  try {
    // Create Users table
    const { error: userTableError } = await supabase.rpc('create_users_table');

    if (userTableError) {
      console.error('Error creating users table:', userTableError);
      return;
    }

    console.log('✅ Users table created');

    // Create User Profiles table
    const { error: userProfileTableError } = await supabase.rpc('create_user_profiles_table');

    if (userProfileTableError) {
      console.error('Error creating user profiles table:', userProfileTableError);
      return;
    }

    console.log('✅ User profiles table created');

    // Create Doctor Profiles table
    const { error: doctorProfileTableError } = await supabase.rpc('create_doctor_profiles_table');

    if (doctorProfileTableError) {
      console.error('Error creating doctor profiles table:', doctorProfileTableError);
      return;
    }

    console.log('✅ Doctor profiles table created');

    // Create Appointments table
    const { error: appointmentTableError } = await supabase.rpc('create_appointments_table');

    if (appointmentTableError) {
      console.error('Error creating appointments table:', appointmentTableError);
      return;
    }

    console.log('✅ Appointments table created');

    // Create Availabilities table
    const { error: availabilityTableError } = await supabase.rpc('create_availabilities_table');

    if (availabilityTableError) {
      console.error('Error creating availabilities table:', availabilityTableError);
      return;
    }

    console.log('✅ Availabilities table created');

    // Create Invoices table
    const { error: invoiceTableError } = await supabase.rpc('create_invoices_table');

    if (invoiceTableError) {
      console.error('Error creating invoices table:', invoiceTableError);
      return;
    }

    console.log('✅ Invoices table created');

    // Create Prescriptions table
    const { error: prescriptionTableError } = await supabase.rpc('create_prescriptions_table');

    if (prescriptionTableError) {
      console.error('Error creating prescriptions table:', prescriptionTableError);
      return;
    }

    console.log('✅ Prescriptions table created');

    // Create Medications table
    const { error: medicationTableError } = await supabase.rpc('create_medications_table');

    if (medicationTableError) {
      console.error('Error creating medications table:', medicationTableError);
      return;
    }

    console.log('✅ Medications table created');

    // Create Medical Histories table
    const { error: medicalHistoryTableError } = await supabase.rpc('create_medical_histories_table');

    if (medicalHistoryTableError) {
      console.error('Error creating medical histories table:', medicalHistoryTableError);
      return;
    }

    console.log('✅ Medical histories table created');

    // Create Audit Logs table
    const { error: auditLogTableError } = await supabase.rpc('create_audit_logs_table');

    if (auditLogTableError) {
      console.error('Error creating audit logs table:', auditLogTableError);
      return;
    }

    console.log('✅ Audit logs table created');

    console.log('🎉 All tables created successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
  }
}

// Run migration if this file is executed directly
if (require.main === module) {
  migrateSchema();
}

module.exports = { migrateSchema };
