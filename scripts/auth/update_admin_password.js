const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');

async function updateAdminPassword() {
  try {
    console.log('Updating admin user password...');

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

    // Hash the new password
    const newPassword = 'Admin123!';
    const hashedPassword = await bcrypt.hash(newPassword, 8);
    console.log('New hashed password:', hashedPassword);

    // Update the admin user's password
    const { data, error } = await supabase
      .from('users')
      .update({ password: hashedPassword })
      .eq('email', 'admin@example.com')
      .select();

    if (error) {
      console.error('Update error:', error);
      console.error('Error message:', error.message);
      return;
    }

    console.log('Password updated successfully:', data);

    // Verify the update
    const { data: verifyData, error: verifyError } = await supabase
      .from('users')
      .select('id, email, password')
      .eq('email', 'admin@example.com')
      .single();

    if (verifyError) {
      console.error('Verification error:', verifyError);
      return;
    }

    console.log('Verification - Updated password hash:', verifyData.password);
    const isMatch = await bcrypt.compare(newPassword, verifyData.password);
    console.log('Password verification:', isMatch ? 'MATCH' : 'NO MATCH');

  } catch (err) {
    console.error('Exception:', err);
  }
}

updateAdminPassword();
