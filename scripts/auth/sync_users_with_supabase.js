const { createClient } = require('@supabase/supabase-js');
const config = require('../../src/config/config');

async function syncUsersWithSupabase() {
  try {
    console.log('Synchronizing database users with Supabase Auth...');

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

    // Direct database connection (bypassing the dbManager)
    const { createClient: createDbClient } = require('@supabase/supabase-js');
    const dbClient = createDbClient(config.supabase.url, config.supabase.serviceRoleKey);

    // Get all users from our database
    const { data: users, error } = await dbClient
      .from('users')
      .select('*');

    if (error) {
      console.error('Error fetching users:', error.message);
      return;
    }

    console.log(`Found ${users.length} users in database`);

    let syncedCount = 0;
    let errorCount = 0;

    // Process each user
    for (const user of users) {
      try {
        console.log(`Processing user: ${user.email} (ID: ${user.id})`);

        // First, let's delete any existing user with this email to avoid conflicts
        const { data: existingUsers, error: listError } = await supabase.auth.admin.listUsers({
          page: 1,
          perPage: 100
        });

        if (!listError && existingUsers && existingUsers.users) {
          const existingUser = existingUsers.users.find(u => u.email === user.email);
          if (existingUser) {
            console.log(`Deleting existing user ${user.email} to recreate with proper password`);
            await supabase.auth.admin.deleteUser(existingUser.id);
          }
        }

        // Create new user in Supabase Auth
        // Note: Supabase requires a plain text password, not a hashed one
        // So we'll need to set a temporary password and then update it
        const tempPassword = 'TempPass123!';
        const { data, error } = await supabase.auth.admin.createUser({
          email: user.email,
          password: tempPassword,
          email_confirm: user.is_email_verified || false,
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
        syncedCount++;
      } catch (err) {
        console.error(`Exception processing user ${user.email}:`, err.message);
        errorCount++;
      }
    }

    console.log(`Sync completed. Successfully synced: ${syncedCount}, Errors: ${errorCount}`);

  } catch (err) {
    console.error('Exception in sync process:', err);
  }

  // Now we need to update the passwords to match the database
  console.log('Updating passwords to match database...');
  await updatePasswordsToMatchDatabase();
}

async function updatePasswordsToMatchDatabase() {
  try {
    const config = require('../../src/config/config');
    const { createClient } = require('@supabase/supabase-js');

    // Initialize Supabase client with service role key
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

    // Direct database connection
    const { createClient: createDbClient } = require('@supabase/supabase-js');
    const dbClient = createDbClient(config.supabase.url, config.supabase.serviceRoleKey);

    // Get all users from our database
    const { data: users, error } = await dbClient
      .from('users')
      .select('*');

    if (error) {
      console.error('Error fetching users for password update:', error.message);
      return;
    }

    for (const user of users) {
      if (user.password) {
        console.log(`Would update password for ${user.email} if we had the plain text password`);
        // Note: We can't actually update the password here because we only have the hashed version
        // In a real scenario, we would need to either:
        // 1. Reset all user passwords and ask them to create new ones
        // 2. Have a process to collect plain text passwords temporarily
        // 3. Use Supabase's password reset functionality
      }
    }

    console.log('Password update process completed');
  } catch (err) {
    console.error('Exception in password update process:', err);
  }
}

// Run the sync function
syncUsersWithSupabase();
