const { createClient } = require('@supabase/supabase-js');

async function createTestUser() {
  try {
    console.log('Creating test user...');

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

    // Create a test admin user
    const { data, error } = await supabase
      .from('users')
      .insert([
        {
          email: 'admin@example.com',
          password: '$2a$08$8K1p/a0dhrxiowP.dnkgNORTWgdEDHn5L2/xjpEWuC.QQv4rKO9jO', // bcrypt hash for "password"
          name: 'Admin User',
          role: 'admin',
          is_email_verified: true
        }
      ])
      .select();

    if (error) {
      console.error('Error creating user:', error);
      console.error('Error message:', error.message);
      return;
    }

    console.log('User created successfully:', data);
  } catch (err) {
    console.error('Exception:', err);
  }
}

createTestUser();
