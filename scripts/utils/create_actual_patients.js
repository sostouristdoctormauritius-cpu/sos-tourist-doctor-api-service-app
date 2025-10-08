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

// Sample patient data
const samplePatients = [
  {
    email: 'john.doe@sospatient.com',
    name: 'John Doe',
    role: 'patient',
    phone: '+1234567890'
  },
  {
    email: 'anthony.thompson@sospatient.com',
    name: 'Anthony Thompson',
    role: 'patient',
    phone: '+1234567891'
  },
  {
    email: 'barbara.garcia@sospatient.com',
    name: 'Barbara Garcia',
    role: 'patient',
    phone: '+1234567892'
  },
  {
    email: 'alice.brown@sospatient.com',
    name: 'Alice Brown',
    role: 'patient',
    phone: '+1234567893'
  }
];

async function createActualPatients() {
  console.log('🏥 Creating actual patient users...');
  console.log('='.repeat(40));
  
  try {
    let createdCount = 0;
    
    for (const patient of samplePatients) {
      console.log(`\n👨‍⚕️ Creating patient: ${patient.name}`);
      
      const { data, error } = await supabase
        .from('users')
        .insert(patient)
        .select();
        
      if (error) {
        console.log(`❌ Error creating patient ${patient.name}:`, error.message);
      } else {
        console.log(`✅ Successfully created patient ${patient.name}:`);
        console.log(`   ID: ${data[0].id}`);
        console.log(`   Email: ${data[0].email}`);
        console.log(`   Role: ${data[0].role}`);
        createdCount++;
      }
    }
    
    console.log(`\n🎉 Process completed! Successfully created ${createdCount} patients.`);
    
    // Verify by listing all patients
    console.log('\n📋 Verifying created patients...');
    const { data: patients, error: patientsError } = await supabase
      .from('users')
      .select('id, name, email, role')
      .eq('role', 'patient');
      
    if (patientsError) {
      console.log('❌ Error fetching patients:', patientsError.message);
    } else {
      console.log(`✅ Found ${patients.length} patients with 'patient' role:`);
      patients.forEach((patient, index) => {
        console.log(`   ${index + 1}. ${patient.name} (${patient.email}) - ${patient.id}`);
      });
    }
    
    // Show all roles in the system
    console.log('\n📊 All roles in the system:');
    const { data: allUsers, error: allUsersError } = await supabase
      .from('users')
      .select('role');
      
    if (allUsersError) {
      console.log('❌ Error fetching all users:', allUsersError.message);
    } else {
      // Extract unique roles
      const roles = [...new Set(allUsers.map(user => user.role))];
      console.log('   Roles:', roles);
    }
    
  } catch (error) {
    console.log('❌ Exception during patient creation:', error.message);
  }
}

createActualPatients();