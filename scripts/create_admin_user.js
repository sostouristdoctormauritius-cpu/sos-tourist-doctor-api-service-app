const { createClient } = require('@supabase/supabase-js');

// Load environment variables
require('dotenv').config({ path: './.env' });

async function createAdminUser() {
  try {
    console.log('Creating Supabase client...');

    // Create a Supabase client with service role key for admin operations
    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
          detectSessionInUrl: false
        }
      }
    );

    console.log('Checking if admin user exists...');

    // First, try to find the user
    const { data: users, error: fetchError } = await supabase.auth.admin.listUsers({
      email: 'admin@example.com'
    });

    if (fetchError) {
      console.error('Error fetching users:', fetchError.message);
      return;
    }

    if (users && users.users && users.users.length > 0) {
      const userId = users.users[0].id;
      console.log('Found existing user. Updating password...');

      // Update the user's password
      const { data, error: updateError } = await supabase.auth.admin.updateUserById(userId, {
        password: 'Admin123!'
      });

      if (updateError) {
        console.error('Error updating password:', updateError.message);
        return;
      }

      console.log('Admin user password updated successfully!');
      console.log('User ID:', data.user.id);
      console.log('Email:', data.user.email);
    } else {
      console.log('Creating new admin user in Supabase Auth...');

      // Create the admin user in Supabase Auth
      const { data, error } = await supabase.auth.admin.createUser({
        email: 'admin@example.com',
        password: 'Admin123!',
        email_confirm: true,
        user_metadata: {
          name: 'Admin User',
          role: 'admin'
        }
      });

      if (error) {
        console.error('Error creating admin user:', error.message);
        return;
      }

      console.log('Admin user created successfully!');
      console.log('User ID:', data.user.id);
      console.log('Email:', data.user.email);
    }

  } catch (error) {
    console.error('Unexpected error:', error.message);
    console.error('Stack trace:', error.stack);
  }
}

// If script is run directly, execute the function
if (require.main === module) {
  createAdminUser()
    .then(() => {
      console.log('Admin user creation/update completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Failed to create/update admin user:', error);
      process.exit(1);
    });
}

module.exports = createAdminUser;
