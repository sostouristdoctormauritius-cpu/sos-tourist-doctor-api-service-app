const { createClient } = require('@supabase/supabase-js');
const config = require('../../src/config/config');

async function setupSupabaseAuth() {
  try {
    console.log('Setting up Supabase Auth users with correct passwords...');

    // Initialize Supabase client with service role key (needed for admin operations)
    const supabase = createClient(config.supabase.url, config.supabase.serviceRoleKey, {
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

    // List of users with their known passwords
    const users = [
      {
        email: 'admin@example.com',
        password: 'Admin123!',
        name: 'Admin User',
        role: 'admin'
      },
      {
        email: 'doctor@example.com',
        password: 'Doctor123!',
        name: 'Dr. John Smith',
        role: 'doctor'
      },
      {
        email: 'doctor2@example.com',
        password: 'Doctor123!',
        name: 'Dr. Jane Doe',
        role: 'doctor'
      },
      {
        email: 'doctor3@example.com',
        password: 'Doctor123!',
        name: 'Dr. Robert Johnson',
        role: 'doctor'
      },
      {
        email: 'patient@example.com',
        password: 'Patient123!',
        name: 'John Doe',
        role: 'user'
      },
      {
        email: 'patient2@example.com',
        password: 'Patient123!',
        name: 'Jane Smith',
        role: 'user'
      },
      {
        email: 'patient3@example.com',
        password: 'Patient123!',
        name: 'Bob Wilson',
        role: 'user'
      }
    ];

    console.log(`Setting up ${users.length} users...`);

    let setupCount = 0;
    let errorCount = 0;

    // Process each user
    for (const user of users) {
      try {
        console.log(`Processing user: ${user.email}`);

        // First, check if user already exists and delete them
        const { data: existingUsers, error: listError } = await supabase.auth.admin.listUsers();

        if (!listError && existingUsers && existingUsers.users) {
          const existingUser = existingUsers.users.find(u => u.email === user.email);
          if (existingUser) {
            console.log(`Deleting existing user ${user.email}`);
            await supabase.auth.admin.deleteUser(existingUser.id);
          }
        }

        // Create new user in Supabase Auth with the correct password
        const { data, error } = await supabase.auth.admin.createUser({
          email: user.email,
          password: user.password, // Use the actual plain text password
          email_confirm: true,
          user_metadata: {
            name: user.name,
            role: user.role
          }
        });

        if (error) {
          console.error(`Error creating user ${user.email}:`, error.message);
          errorCount++;
          continue;
        }

        console.log(`Successfully created user ${user.email}`);
        setupCount++;
      } catch (err) {
        console.error(`Exception processing user ${user.email}:`, err.message);
        errorCount++;
      }
    }

    console.log(`Setup completed. Successfully set up: ${setupCount}, Errors: ${errorCount}`);

  } catch (err) {
    console.error('Exception in setup process:', err);
  }
}

// Run the setup function
setupSupabaseAuth();
