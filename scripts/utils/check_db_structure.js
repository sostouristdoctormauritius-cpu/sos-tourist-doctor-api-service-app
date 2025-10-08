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

async function checkUserById() {
  try {
    console.log('🔍 Checking specific user by ID...');
    
    // First get the user ID from a previous auth test
    const userId = '4f6272fd-170d-47ab-8958-59bb0c91bc93'; // admin1 user ID from auth
    
    const { data: user, error } = await supabase
      .from('users')
      .select('id, name, email, role')
      .eq('id', userId)
      .maybeSingle(); // Use maybeSingle instead of single

    if (error) {
      console.log('❌ Error fetching user by ID:', error.message);
      return null;
    }

    if (!user) {
      console.log('⚠️ User not found in database with ID:', userId);
      return null;
    }

    console.log('✅ User found by ID:');
    console.log(`   Name: ${user.name}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Role: ${user.role}`);
    
    return user;
  } catch (error) {
    console.log('❌ Exception fetching user by ID:', error.message);
    return null;
  }
}

async function checkAdminUsers() {
  try {
    console.log('\n🔍 Checking all admin users...');
    
    const { data: admins, error } = await supabase
      .from('users')
      .select('id, name, email, role')
      .eq('role', 'admin')
      .limit(5);

    if (error) {
      console.log('❌ Error fetching admin users:', error.message);
      return;
    }

    console.log(`✅ Found ${admins.length} admin users:`);
    admins.forEach((admin, index) => {
      console.log(`   ${index + 1}. ${admin.name} (${admin.email}) - ID: ${admin.id}`);
    });
  } catch (error) {
    console.log('❌ Exception fetching admin users:', error.message);
  }
}

async function checkUserStructure() {
  try {
    console.log('\n🔍 Checking users table structure...');
    
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .limit(1);

    if (error) {
      console.log('❌ Error checking users table structure:', error.message);
      return;
    }

    if (data && data.length > 0) {
      console.log('✅ Users table columns:');
      Object.keys(data[0]).forEach(key => {
        console.log(`   - ${key}`);
      });
    } else {
      console.log('⚠️ Users table is empty');
    }
  } catch (error) {
    console.log('❌ Exception checking users table structure:', error.message);
  }
}

async function checkAppointments() {
  try {
    console.log('\n🔍 Checking appointments table structure...');
    
    const { data, error } = await supabase
      .from('appointments')
      .select('*')
      .limit(1);

    if (error) {
      console.log('❌ Error checking appointments table structure:', error.message);
      return;
    }

    if (data && data.length > 0) {
      console.log('✅ Appointments table columns:');
      Object.keys(data[0]).forEach(key => {
        console.log(`   - ${key}`);
      });
    } else {
      console.log('⚠️ Appointments table is empty or inaccessible');
    }
  } catch (error) {
    console.log('❌ Exception checking appointments table structure:', error.message);
  }
  
  try {
    console.log('\n🔍 Checking sample appointments...');
    
    const { data: appointments, error } = await supabase
      .from('appointments')
      .select(`
        id,
        user_id,
        doctor_id,
        status
      `)
      .limit(3);

    if (error) {
      console.log('❌ Error fetching appointments:', error.message);
      return;
    }

    console.log(`✅ Found ${appointments.length} sample appointments:`);
    appointments.forEach((app, index) => {
      console.log(`   ${index + 1}. Appointment ${app.id}`);
      console.log(`      Status: ${app.status}`);
      console.log(`      Patient ID: ${app.user_id}`);
      console.log(`      Doctor ID: ${app.doctor_id}`);
    });
  } catch (error) {
    console.log('❌ Exception fetching appointments:', error.message);
  }
}

async function checkAuthUser() {
  try {
    console.log('\n🔍 Checking authenticated user in users table...');
    
    // Look for the user by email
    const { data: user, error } = await supabase
      .from('users')
      .select('id, name, email, role')
      .eq('email', 'admin1@sosdoctor.com')
      .maybeSingle();

    if (error) {
      console.log('❌ Error fetching user by email:', error.message);
      return null;
    }

    if (!user) {
      console.log('⚠️ User not found in database with email: admin1@sosdoctor.com');
      return null;
    }

    console.log('✅ User found by email:');
    console.log(`   Name: ${user.name}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Role: ${user.role}`);
    console.log(`   ID: ${user.id}`);
    
    return user;
  } catch (error) {
    console.log('❌ Exception fetching user by email:', error.message);
    return null;
  }
}

async function main() {
  console.log('SOS Tourist Doctor - Database Structure Check');
  console.log('='.repeat(50));
  
  // Check user structure
  await checkUserStructure();
  
  // Check authenticated user
  await checkAuthUser();
  
  // Check specific user
  await checkUserById();
  
  // Check admin users
  await checkAdminUsers();
  
  // Check appointments
  await checkAppointments();
  
  console.log('\n✅ Database structure check completed');
}

// Run the script
main();