# Patient Role Setup Guide

## Overview

This guide explains how to add the 'patient' role to the user_role_enum in the Supabase database, making it a first-class role like 'admin', 'secretary', and 'doctor'.

## Current State

Currently, the user_role_enum contains these values:
- admin
- secretary
- doctor
- user

There is no 'patient' role, which means patients are not explicitly represented as a user role in the system. Instead, patients are identified by their presence in the appointments table.

## Adding the Patient Role

To add 'patient' as a proper role in the system, you need to modify the user_role_enum type in the database.

### Step 1: Execute SQL Command

1. Open your Supabase project dashboard
2. Navigate to the **SQL Editor**
3. Run the following command:

```sql
ALTER TYPE user_role_enum ADD VALUE 'patient';
```

This command adds 'patient' to the existing enum values.

### Step 2: Verify the Change

After running the command, you can verify that 'patient' is now a valid role by attempting to create a user with that role:

```javascript
const { data, error } = await supabase
  .from('users')
  .insert({
    email: 'test.patient@sospatient.com',
    name: 'Test Patient',
    role: 'patient'
  })
  .select();
```

### Step 3: Create Patient Users

Once the 'patient' role is added to the enum, you can create actual patient users:

```javascript
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
  }
];

// Insert each patient
for (const patient of samplePatients) {
  const { data, error } = await supabase
    .from('users')
    .insert(patient)
    .select();
    
  if (error) {
    console.log(`Error creating patient ${patient.name}:`, error.message);
  } else {
    console.log(`Successfully created patient ${patient.name}`);
  }
}
```

## Benefits of Adding Patient Role

1. **Explicit Representation**: Patients become first-class citizens in the system with their own role
2. **Simplified Queries**: Easier to query for all patients using `WHERE role = 'patient'`
3. **Consistent Architecture**: Follows the same pattern as other user roles (admin, doctor, secretary)
4. **Better RBAC**: Enables more precise role-based access control
5. **Clearer Data Model**: Makes the data model more intuitive and self-documenting

## Implementation Notes

1. Existing patient data (identified through appointments) will remain unchanged
2. The system can now support both approaches:
   - Legacy approach: Patients identified through appointments
   - New approach: Patients as explicit role in users table
3. Applications can gradually migrate to using the explicit patient role
4. RLS policies may need to be updated to account for the new role

## Next Steps

1. Execute the SQL command to add the 'patient' role
2. Run the patient creation scripts
3. Update any relevant RLS policies
4. Modify application code to use the explicit patient role where appropriate