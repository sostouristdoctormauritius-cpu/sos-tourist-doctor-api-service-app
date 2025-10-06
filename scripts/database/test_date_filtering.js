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

async function testDateFiltering() {
  try {
    console.log('Testing date range filtering for appointments...');

    // Test 1: Get all appointments
    console.log('\n1. Fetching all appointments:');
    const { data: allData, error: allError } = await supabase
      .from('appointments')
      .select('id, date, start_time, end_time')
      .limit(10);

    if (allError) {
      console.error('Error fetching all appointments:', allError);
      return;
    }

    console.log(`Total appointments: ${allData.length}`);
    allData.forEach(app => {
      console.log(`  - ${app.id}: ${app.date} ${app.start_time}-${app.end_time}`);
    });

    // Test 2: Filter by date range
    console.log('\n2. Filtering appointments by date range (2025-08-12 to 2025-08-13):');
    const { data: filteredData, error: filteredError } = await supabase
      .from('appointments')
      .select('id, date, start_time, end_time')
      .gte('date', '2025-08-12')
      .lte('date', '2025-08-13');

    if (filteredError) {
      console.error('Error filtering appointments:', filteredError);
      return;
    }

    console.log(`Filtered appointments: ${filteredData.length}`);
    filteredData.forEach(app => {
      console.log(`  - ${app.id}: ${app.date} ${app.start_time}-${app.end_time}`);
    });

    // Test 3: Filter by a single date
    console.log('\n3. Filtering appointments for a single date (2025-08-12):');
    const { data: singleData, error: singleError } = await supabase
      .from('appointments')
      .select('id, date, start_time, end_time')
      .eq('date', '2025-08-12');

    if (singleError) {
      console.error('Error filtering appointments by single date:', singleError);
      return;
    }

    console.log(`Single date appointments: ${singleData.length}`);
    singleData.forEach(app => {
      console.log(`  - ${app.id}: ${app.date} ${app.start_time}-${app.end_time}`);
    });

  } catch (error) {
    console.error('Error:', error.message);
  }
}

testDateFiltering();
