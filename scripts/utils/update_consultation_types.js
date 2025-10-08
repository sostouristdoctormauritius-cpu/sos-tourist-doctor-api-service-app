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

async function updateConsultationTypes() {
  try {
    console.log('🔍 Updating consultation types enum...');
    
    // First, let's check the current enum values
    console.log('Checking current enum values...');
    
    // We need to modify the enum to include all the desired values
    // In Postgres, we need to create a new enum, update the column to use it, then drop the old one
    
    // Add the new values to the enum
    const { error } = await supabase.rpc('execute_sql', {
      sql: `
        ALTER TYPE consultation_type_enum ADD VALUE IF NOT EXISTS 'voice';
        ALTER TYPE consultation_type_enum ADD VALUE IF NOT EXISTS 'home_visit';
        ALTER TYPE consultation_type_enum ADD VALUE IF NOT EXISTS 'in_person';
      `
    });

    if (error) {
      console.log('Error updating enum:', error.message);
      // Try alternative approach
      console.log('Trying alternative approach...');
      
      // Let's try to directly execute the SQL
      const { data, error: altError } = await supabase.rpc('execute_sql', {
        sql: `
          DO $$
          BEGIN
            IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'voice' AND enumtypid = 'consultation_type_enum'::regtype) THEN
              ALTER TYPE consultation_type_enum ADD VALUE 'voice';
            END IF;
            
            IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'home_visit' AND enumtypid = 'consultation_type_enum'::regtype) THEN
              ALTER TYPE consultation_type_enum ADD VALUE 'home_visit';
            END IF;
            
            IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'in_person' AND enumtypid = 'consultation_type_enum'::regtype) THEN
              ALTER TYPE consultation_type_enum ADD VALUE 'in_person';
            END IF;
          END $$;
        `
      });
      
      if (altError) {
        console.log('Alternative approach also failed:', altError.message);
        return false;
      }
      
      console.log('Enum updated successfully with alternative approach');
    } else {
      console.log('Enum updated successfully');
    }
    
    // Test the new values
    console.log('\n🧪 Testing new consultation types...');
    
    const testTypes = ['video', 'chat', 'voice', 'home_visit', 'in_person'];
    
    for (const type of testTypes) {
      try {
        const testAppointment = {
          user_id: '3838cb73-f01a-509c-8dbb-b7c64c57ac78', // John Doe
          doctor_id: '41cdfb01-a6e8-5b44-80b4-c232c4723817', // Dr. Alice Johnson
          date: '2025-10-08',
          start_time: '09:00:00',
          end_time: '10:00:00',
          status: 'confirmed',
          consultation_type: type
        };
        
        const { error: insertError } = await supabase
          .from('appointments')
          .insert(testAppointment);
          
        if (insertError) {
          console.log(`❌ "${type}" - Invalid (${insertError.message})`);
        } else {
          console.log(`✅ "${type}" - Valid`);
          // Delete the test appointment if it was created
          await supabase
            .from('appointments')
            .delete()
            .eq('user_id', testAppointment.user_id)
            .eq('doctor_id', testAppointment.doctor_id)
            .eq('date', testAppointment.date)
            .eq('start_time', testAppointment.start_time);
        }
      } catch (e) {
        console.log(`❌ "${type}" - Error (${e.message})`);
      }
    }
    
    return true;
    
  } catch (error) {
    console.log('Exception:', error.message);
    return false;
  }
}

updateConsultationTypes().then(success => {
  if (success) {
    console.log('\n✅ Consultation types update completed successfully!');
  } else {
    console.log('\n❌ Failed to update consultation types');
  }
});