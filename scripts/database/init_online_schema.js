const { createClient } = require('@supabase/supabase-js');

async function initOnlineSchema() {
  try {
    console.log('Initializing schema on online Supabase instance...');

    const supabaseUrl = 'https://ejprqtwdvgikctokortv.supabase.co';
    const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVqcHJxdHdkdmdpa2N0b2tvcnR2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDc3MjIxMCwiZXhwIjoyMDcwMzQ4MjEwfQ.O58fUORTYDwb-N-hUZOPWzzuwmcrknd2bP3cVGd0xoA';

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Create users table
    console.log('Creating users table...');
    const { error: usersError } = await supabase.rpc('execute_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS users (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          email VARCHAR(255) UNIQUE NOT NULL,
          password VARCHAR(255) NOT NULL,
          name VARCHAR(255),
          role VARCHAR(50) DEFAULT 'user',
          is_email_verified BOOLEAN DEFAULT false,
          profile_picture TEXT,
          phone VARCHAR(50),
          date_of_birth DATE,
          gender VARCHAR(20),
          address TEXT,
          emergency_contact_name VARCHAR(255),
          emergency_contact_phone VARCHAR(50),
          medical_conditions TEXT,
          allergies TEXT,
          current_medications TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          is_archived BOOLEAN DEFAULT false
        );
        
        CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
        CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
        CREATE INDEX IF NOT EXISTS idx_users_is_archived ON users(is_archived);
      `
    });

    if (usersError) {
      console.error('Error creating users table:', usersError);
    } else {
      console.log('Users table created successfully');
    }

    // Create appointments table
    console.log('Creating appointments table...');
    const { error: appointmentsError } = await supabase.rpc('execute_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS appointments (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          patient_id UUID REFERENCES users(id),
          doctor_id UUID REFERENCES users(id),
          appointment_date TIMESTAMP WITH TIME ZONE,
          status VARCHAR(50) DEFAULT 'scheduled',
          reason TEXT,
          notes TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        CREATE INDEX IF NOT EXISTS idx_appointments_patient_id ON appointments(patient_id);
        CREATE INDEX IF NOT EXISTS idx_appointments_doctor_id ON appointments(doctor_id);
        CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);
        CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(appointment_date);
      `
    });

    if (appointmentsError) {
      console.error('Error creating appointments table:', appointmentsError);
    } else {
      console.log('Appointments table created successfully');
    }

    // Create prescriptions table
    console.log('Creating prescriptions table...');
    const { error: prescriptionsError } = await supabase.rpc('execute_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS prescriptions (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          patient_id UUID REFERENCES users(id),
          doctor_id UUID REFERENCES users(id),
          appointment_id UUID REFERENCES appointments(id),
          medication_name VARCHAR(255),
          dosage VARCHAR(100),
          frequency VARCHAR(100),
          duration VARCHAR(100),
          instructions TEXT,
          issued_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        CREATE INDEX IF NOT EXISTS idx_prescriptions_patient_id ON prescriptions(patient_id);
        CREATE INDEX IF NOT EXISTS idx_prescriptions_doctor_id ON prescriptions(doctor_id);
        CREATE INDEX IF NOT EXISTS idx_prescriptions_appointment_id ON prescriptions(appointment_id);
      `
    });

    if (prescriptionsError) {
      console.error('Error creating prescriptions table:', prescriptionsError);
    } else {
      console.log('Prescriptions table created successfully');
    }

    // Create doctor_notes table
    console.log('Creating doctor_notes table...');
    const { error: notesError } = await supabase.rpc('execute_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS doctor_notes (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          patient_id UUID REFERENCES users(id),
          doctor_id UUID REFERENCES users(id),
          appointment_id UUID REFERENCES appointments(id),
          note TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        CREATE INDEX IF NOT EXISTS idx_doctor_notes_patient_id ON doctor_notes(patient_id);
        CREATE INDEX IF NOT EXISTS idx_doctor_notes_doctor_id ON doctor_notes(doctor_id);
        CREATE INDEX IF NOT EXISTS idx_doctor_notes_appointment_id ON doctor_notes(appointment_id);
      `
    });

    if (notesError) {
      console.error('Error creating doctor_notes table:', notesError);
    } else {
      console.log('Doctor notes table created successfully');
    }

    // Create invoices table
    console.log('Creating invoices table...');
    const { error: invoicesError } = await supabase.rpc('execute_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS invoices (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          patient_id UUID REFERENCES users(id),
          appointment_id UUID REFERENCES appointments(id),
          amount DECIMAL(10, 2),
          status VARCHAR(50) DEFAULT 'pending',
          issued_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          due_date TIMESTAMP WITH TIME ZONE,
          paid_date TIMESTAMP WITH TIME ZONE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        CREATE INDEX IF NOT EXISTS idx_invoices_patient_id ON invoices(patient_id);
        CREATE INDEX IF NOT EXISTS idx_invoices_appointment_id ON invoices(appointment_id);
        CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
      `
    });

    if (invoicesError) {
      console.error('Error creating invoices table:', invoicesError);
    } else {
      console.log('Invoices table created successfully');
    }

    // Create availability table
    console.log('Creating availability table...');
    const { error: availabilityError } = await supabase.rpc('execute_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS availability (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          doctor_id UUID REFERENCES users(id),
          day_of_week INTEGER,
          start_time TIME,
          end_time TIME,
          is_available BOOLEAN DEFAULT true,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        CREATE INDEX IF NOT EXISTS idx_availability_doctor_id ON availability(doctor_id);
        CREATE INDEX IF NOT EXISTS idx_availability_day_of_week ON availability(day_of_week);
      `
    });

    if (availabilityError) {
      console.error('Error creating availability table:', availabilityError);
    } else {
      console.log('Availability table created successfully');
    }

    // Create app_config table
    console.log('Creating app_config table...');
    const { error: configError } = await supabase.rpc('execute_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS app_config (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          config_key VARCHAR(255) UNIQUE NOT NULL,
          config_value TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    });

    if (configError) {
      console.error('Error creating app_config table:', configError);
    } else {
      console.log('App config table created successfully');
    }

    // Create tokens table
    console.log('Creating tokens table...');
    const { error: tokensError } = await supabase.rpc('execute_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS tokens (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID REFERENCES users(id),
          refresh_token TEXT NOT NULL,
          expires TIMESTAMP WITH TIME ZONE NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        CREATE INDEX IF NOT EXISTS idx_tokens_user_id ON tokens(user_id);
        CREATE INDEX IF NOT EXISTS idx_tokens_refresh_token ON tokens(refresh_token);
      `
    });

    if (tokensError) {
      console.error('Error creating tokens table:', tokensError);
    } else {
      console.log('Tokens table created successfully');
    }

    // Create temps table
    console.log('Creating temps table...');
    const { error: tempsError } = await supabase.rpc('execute_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS temps (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          type VARCHAR(50),
          data JSONB,
          expires TIMESTAMP WITH TIME ZONE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        CREATE INDEX IF NOT EXISTS idx_temps_type ON temps(type);
        CREATE INDEX IF NOT EXISTS idx_temps_expires ON temps(expires);
      `
    });

    if (tempsError) {
      console.error('Error creating temps table:', tempsError);
    } else {
      console.log('Temps table created successfully');
    }

    console.log('Schema initialization completed');
  } catch (err) {
    console.error('Failed to initialize schema:', err);
  }
}

initOnlineSchema();
