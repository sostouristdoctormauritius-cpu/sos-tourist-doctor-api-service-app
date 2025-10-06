const { createClient } = require('@supabase/supabase-js');

async function checkUserPassword() {
  try {
    console.log('Checking user password hash...');

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

    // Query the user's password hash
    console.log('Querying user password hash...');
    const { data, error } = await supabase
      .from('users')
      .select('id, email, password')
      .eq('email', 'admin@example.com')
      .single();

    if (error) {
      console.error('Query error:', error);
      console.error('Error message:', error.message);
      return;
    }

    console.log('User password hash:');
    console.log('- ID:', data.id);
    console.log('- Email:', data.email);
    console.log('- Password hash:', data.password);

  } catch (err) {
    console.error('Exception:', err);
  }
}

checkUserPassword();
