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

async function testDatabaseTables() {
  try {
    console.log('🔍 Testing database tables...');
    
    // List of common table names to test
    const tablesToTest = [
      'users',
      'appointments',
      'availabilities',
      'availability',
      'doctors',
      'patients',
      'profiles',
      'doctor_profiles',
      'patient_profiles'
    ];
    
    console.log('📋 Testing access to common tables:');
    
    for (const tableName of tablesToTest) {
      try {
        const { data, error } = await supabase
          .from(tableName)
          .select('*')
          .limit(1);
          
        if (error) {
          console.log(`   ❌ ${tableName}: ${error.message}`);
        } else {
          console.log(`   ✅ ${tableName}: Accessible`);
        }
      } catch (e) {
        console.log(`   ❌ ${tableName}: Exception - ${e.message}`);
      }
    }
    
  } catch (error) {
    console.log('❌ Exception testing tables:', error.message);
  }
}

testDatabaseTables();