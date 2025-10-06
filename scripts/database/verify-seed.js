const { createClient } = require('@supabase/supabase-js');

// Supabase connection details from the status output
const supabaseUrl = 'http://127.0.0.1:54321';
// Using service role key to bypass RLS
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTc4NjMxMjQxMSwiaWF0IjoxNzU0Nzc2NDExfQ.oplNHavDhp4A9G2S98k9N8n56w9gTZyx4_i14_kJDP8';

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false
  }
});

async function verifySeed() {
  try {
    console.log('Verifying database seed using service role key...\n');

    // Check users table
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, name, email, role');

    if (usersError) {
      console.error('Error fetching users:', usersError.message);
      return;
    }

    console.log(`Found ${users.length} users:`);
    users.forEach(user => {
      console.log(`- ${user.name} (${user.email}) - ${user.role}`);
    });

    // Check user_profiles table
    const { data: profiles, error: profilesError } = await supabase
      .from('user_profiles')
      .select('user_id, nickname, language, nationality');

    if (profilesError) {
      console.error('Error fetching profiles:', profilesError.message);
      return;
    }

    console.log(`\nFound ${profiles.length} user profiles:`);
    profiles.forEach(profile => {
      console.log(`- User ID: ${profile.user_id}, Nickname: ${profile.nickname}, Language: ${profile.language}, Nationality: ${profile.nationality}`);
    });

    // Check doctor_profiles table
    const { data: doctorProfiles, error: doctorProfilesError } = await supabase
      .from('doctor_profiles')
      .select('user_id, specialisation, rating, rating_count');

    if (doctorProfilesError) {
      console.error('Error fetching doctor profiles:', doctorProfilesError.message);
      return;
    }

    console.log(`\nFound ${doctorProfiles.length} doctor profiles:`);
    doctorProfiles.forEach(profile => {
      console.log(`- User ID: ${profile.user_id}, Specialization: ${profile.specialisation}, Rating: ${profile.rating}, Rating Count: ${profile.rating_count}`);
    });

    // Check appointments table
    const { data: appointments, error: appointmentsError } = await supabase
      .from('appointments')
      .select('id, user_id, doctor_id, date, status, consultation_type');

    if (appointmentsError) {
      console.error('Error fetching appointments:', appointmentsError.message);
      return;
    }

    console.log(`\nFound ${appointments.length} appointments:`);
    appointments.forEach(appointment => {
      console.log(`- ID: ${appointment.id}, Patient: ${appointment.user_id}, Doctor: ${appointment.doctor_id}, Date: ${appointment.date}, Status: ${appointment.status}, Type: ${appointment.consultation_type}`);
    });

    console.log('\n✅ Database seeding verification completed successfully!');
    console.log('\nSummary:');
    console.log(`- ${users.length} users`);
    console.log(`- ${profiles.length} user profiles`);
    console.log(`- ${doctorProfiles.length} doctor profiles`);
    console.log(`- ${appointments.length} appointments`);

  } catch (error) {
    console.error('Unexpected error:', error.message);
  }
}

verifySeed();
