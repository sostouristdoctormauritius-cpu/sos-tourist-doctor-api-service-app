const { createClient } = require('@supabase/supabase-js');
const config = require('../src/config/config');

async function createTestUsers() {
  const supabase = createClient(config.supabase.url, config.supabase.serviceRoleKey);
  
  const users = [
    {
      email: 'patient@test.com',
      password: 'Patient123!',
      name: 'Test Patient',
      role: 'user'
    },
    {
      email: 'doctor@test.com',
      password: 'Doctor123!',
      name: 'Test Doctor',
      role: 'doctor'
    },
    {
      email: 'admin@test.com',
      password: 'Admin123!',
      name: 'Test Admin',
      role: 'admin'
    }
  ];

  for (const user of users) {
    // Delete user if exists
    const { data: existingUsers } = await supabase.auth.admin.listUsers();
    const existingUser = existingUsers.users.find(u => u.email === user.email);
    if (existingUser) {
      await supabase.auth.admin.deleteUser(existingUser.id);
      console.log(`Deleted existing user: ${user.email}`);
    }

    // Create new user
    const { data, error } = await supabase.auth.admin.createUser({
      email: user.email,
      password: user.password,
      email_confirm: true,
      user_metadata: {
        name: user.name,
        role: user.role
      }
    });

    if (error) {
      console.error(`Error creating user ${user.email}:`, error.message);
    } else {
      console.log(`Successfully created user: ${user.email}`);
    }
  }
}

createTestUsers();