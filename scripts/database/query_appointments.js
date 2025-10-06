const { createClient } = require('@supabase/supabase-js');

// Supabase configuration - using the local development settings
const supabaseUrl = process.env.SUPABASE_URL || 'http://localhost:54321';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false
  }
});

async function queryAppointments() {
  try {
    console.log('Fetching appointments from the database...');

    // Query appointments with the correct column names
    const { data, error } = await supabase
      .from('appointments')
      .select(`
        id,
        user,
        doctor,
        date,
        start_time,
        end_time,
        status,
        consultation_type,
        symptoms,
        additional_note,
        created_at,
        updated_at
      `)
      .limit(10);

    if (error) {
      console.error('Error fetching appointments:', error);
      return;
    }

    console.log(`Found ${data.length} appointments:`);
    console.log(JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error:', error.message);
  }
}

queryAppointments();
