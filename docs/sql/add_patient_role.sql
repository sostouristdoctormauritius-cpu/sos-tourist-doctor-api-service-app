-- Script to add 'patient' role to the user_role_enum
-- This should be executed in the Supabase SQL editor

-- Add 'patient' to the user_role_enum
ALTER TYPE user_role_enum ADD VALUE 'patient';

-- Verify the change by checking the enum values
-- Note: This query may not work in all PostgreSQL versions
-- SELECT unnest(enum_range(NULL::user_role_enum))::text;

-- After adding the role, we can create sample patient users
-- INSERT INTO users (email, name, role) 
-- VALUES ('john.doe@sospatient.com', 'John Doe', 'patient');

-- The above INSERT is commented out as it should be done through the application code