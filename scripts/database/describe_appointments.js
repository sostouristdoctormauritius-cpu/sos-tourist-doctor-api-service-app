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

async function describeAppointments() {
  try {
    console.log('Describing appointments table structure...');

    // Query to get column information
    const { data, error } = await supabase
      .from('appointments')
      .select('*')
      .limit(1);

    if (error) {
      console.error('Error describing appointments:', error);
      return;
    }

    if (data.length > 0) {
      console.log('Appointments table structure:');
      Object.keys(data[0]).forEach(key => {
        console.log(`- ${key}: ${typeof data[0][key]}`);
      });
    } else {
      console.log('No appointments found in the table');
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

describeAppointments();
