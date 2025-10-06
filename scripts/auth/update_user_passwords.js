const { createClient } = require('@supabase/supabase-js');

// Supabase configuration
const supabaseUrl = 'http://127.0.0.1:54321';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// The bcrypt hash for "Admin123!"
const standardPasswordHash = '$2a$08$/gTWyCfh3Mb73C9q6YwIQ.waahHc6T4Jc6afdICF/qJnDRAiZW4R.';

async function updateTestUserPasswords() {
  try {
    console.log('Updating test users with standard password...');

    // Update all test users to use the standard password
    const { data, error } = await supabase
      .from('users')
      .update({ password: standardPasswordHash })
      .in('email', ['admin@example.com', 'doctor@example.com', 'patient@example.com']);

    if (error) {
      console.error('Error updating user passwords:', error);
      return;
    }

    console.log('Successfully updated user passwords.');
    console.log('You can now log in with password: Admin123!');
    console.log('');
    console.log('Test Accounts:');
    console.log('1. Admin: admin@example.com');
    console.log('2. Doctor: doctor@example.com');
    console.log('3. Patient: patient@example.com');
    console.log('Password for all accounts: Admin123!');

  } catch (err) {
    console.error('Unexpected error:', err);
  }
}

// Run the update
updateTestUserPasswords();
