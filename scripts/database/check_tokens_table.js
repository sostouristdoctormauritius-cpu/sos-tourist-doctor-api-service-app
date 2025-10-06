const { createClient } = require('@supabase/supabase-js');

async function checkTokensTable() {
  try {
    console.log('Checking tokens table structure...');

    const supabaseUrl = 'http://127.0.0.1:54321';
    const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTc4NjMxMjQxMSwiaWF0IjoxNzU0Nzc2NDExfQ.oplNHavDhp4A9G2S98k9N8n56w9gTZyx4_i14_kJDP8';

    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
        flowType: 'implicit'
      },
      db: {
        schema: 'public'
      }
    });

    // Check if tokens table exists and get its structure
    console.log('Querying tokens table information...');
    const { data, error } = await supabase
      .from('tokens')
      .select('*')
      .limit(1);

    if (error) {
      console.error('Query error:', error);
      console.error('Error message:', error.message);
      return;
    }

    console.log('Tokens table query successful');
    console.log('Sample data:', data);

  } catch (err) {
    console.error('Exception:', err);
  }
}

checkTokensTable();
