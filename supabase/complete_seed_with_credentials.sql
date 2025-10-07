-- Complete Seed Data for SOS Tourist Doctor API
-- This file contains seed data for:
-- 3 admins
-- 2 secretaries
-- 10 doctors
-- 20 patients

-- Temporarily disable audit triggers to avoid issues during seeding
ALTER TABLE public.users DISABLE TRIGGER users_audit_trigger;
ALTER TABLE public.user_profiles DISABLE TRIGGER user_profiles_audit_trigger;
ALTER TABLE public.doctor_profiles DISABLE TRIGGER doctor_profiles_audit_trigger;
ALTER TABLE public.appointments DISABLE TRIGGER appointments_audit_trigger;
ALTER TABLE public.availabilities DISABLE TRIGGER availabilities_audit_trigger;
ALTER TABLE public.doctor_notes DISABLE TRIGGER doctor_notes_audit_trigger;
ALTER TABLE public.invoices DISABLE TRIGGER invoices_audit_trigger;
ALTER TABLE public.prescriptions DISABLE TRIGGER prescriptions_audit_trigger;
ALTER TABLE public.medications DISABLE TRIGGER medications_audit_trigger;
ALTER TABLE public.tokens DISABLE TRIGGER tokens_audit_trigger;
ALTER TABLE public.medical_histories DISABLE TRIGGER medical_histories_audit_trigger;
ALTER TABLE public.app_configs DISABLE TRIGGER app_configs_audit_trigger;

-- Create a function to generate a deterministic UUID based on a string
-- This ensures consistent UUIDs across different database instances
CREATE OR REPLACE FUNCTION deterministic_uuid(input_text TEXT) 
RETURNS UUID AS $$
BEGIN
    RETURN uuid_generate_v5('00000000-0000-0000-0000-000000000000', input_text);
END;
$$ LANGUAGE plpgsql;

-- Insert admin users
INSERT INTO public.users (id, name, email, phone, role, is_email_verified, is_status, created_at, updated_at)
VALUES 
    (deterministic_uuid('admin1'), 'Admin User 1', 'admin1@sosdoctor.com', '+12345678901', 'admin', true, 'active', NOW(), NOW()),
    (deterministic_uuid('admin2'), 'Admin User 2', 'admin2@sosdoctor.com', '+12345678902', 'admin', true, 'active', NOW(), NOW()),
    (deterministic_uuid('admin3'), 'Admin User 3', 'admin3@sosdoctor.com', '+12345678903', 'admin', true, 'active', NOW(), NOW());

-- Insert secretary users
INSERT INTO public.users (id, name, email, phone, role, is_email_verified, is_status, created_at, updated_at)
VALUES 
    (deterministic_uuid('secretary1'), 'Secretary User 1', 'secretary1@sosdoctor.com', '+12345678921', 'secretary', true, 'active', NOW(), NOW()),
    (deterministic_uuid('secretary2'), 'Secretary User 2', 'secretary2@sosdoctor.com', '+12345678922', 'secretary', true, 'active', NOW(), NOW());

-- Insert doctor users
INSERT INTO public.users (id, name, email, phone, role, is_email_verified, is_status, created_at, updated_at)
VALUES 
    (deterministic_uuid('doctor1'), 'Dr. Alice Johnson', 'alice.johnson@sosdoctor.com', '+12345678911', 'doctor', true, 'active', NOW(), NOW()),
    (deterministic_uuid('doctor2'), 'Dr. Bob Smith', 'bob.smith@sosdoctor.com', '+12345678912', 'doctor', true, 'active', NOW(), NOW()),
    (deterministic_uuid('doctor3'), 'Dr. Carol Williams', 'carol.williams@sosdoctor.com', '+12345678913', 'doctor', true, 'active', NOW(), NOW()),
    (deterministic_uuid('doctor4'), 'Dr. David Brown', 'david.brown@sosdoctor.com', '+12345678914', 'doctor', true, 'active', NOW(), NOW()),
    (deterministic_uuid('doctor5'), 'Dr. Emma Davis', 'emma.davis@sosdoctor.com', '+12345678915', 'doctor', true, 'active', NOW(), NOW()),
    (deterministic_uuid('doctor6'), 'Dr. Frank Miller', 'frank.miller@sosdoctor.com', '+12345678916', 'doctor', true, 'active', NOW(), NOW()),
    (deterministic_uuid('doctor7'), 'Dr. Grace Wilson', 'grace.wilson@sosdoctor.com', '+12345678917', 'doctor', true, 'active', NOW(), NOW()),
    (deterministic_uuid('doctor8'), 'Dr. Henry Moore', 'henry.moore@sosdoctor.com', '+12345678918', 'doctor', true, 'active', NOW(), NOW()),
    (deterministic_uuid('doctor9'), 'Dr. Irene Taylor', 'irene.taylor@sosdoctor.com', '+12345678919', 'doctor', true, 'active', NOW(), NOW()),
    (deterministic_uuid('doctor10'), 'Dr. Jack Anderson', 'jack.anderson@sosdoctor.com', '+12345678920', 'doctor', true, 'active', NOW(), NOW());

-- Insert patient users
INSERT INTO public.users (id, name, email, phone, role, is_email_verified, is_status, created_at, updated_at)
VALUES 
    (deterministic_uuid('patient1'), 'John Doe', 'john.doe@sospatient.com', '+11111111111', 'user', true, 'active', NOW(), NOW()),
    (deterministic_uuid('patient2'), 'Jane Smith', 'jane.smith@sospatient.com', '+11111111112', 'user', true, 'active', NOW(), NOW()),
    (deterministic_uuid('patient3'), 'Michael Johnson', 'michael.johnson@sospatient.com', '+11111111113', 'user', true, 'active', NOW(), NOW()),
    (deterministic_uuid('patient4'), 'Emily Williams', 'emily.williams@sospatient.com', '+11111111114', 'user', true, 'active', NOW(), NOW()),
    (deterministic_uuid('patient5'), 'David Brown', 'david.brown@sospatient.com', '+11111111115', 'user', true, 'active', NOW(), NOW()),
    (deterministic_uuid('patient6'), 'Sarah Davis', 'sarah.davis@sospatient.com', '+11111111116', 'user', true, 'active', NOW(), NOW()),
    (deterministic_uuid('patient7'), 'Robert Miller', 'robert.miller@sospatient.com', '+11111111117', 'user', true, 'active', NOW(), NOW()),
    (deterministic_uuid('patient8'), 'Lisa Wilson', 'lisa.wilson@sospatient.com', '+11111111118', 'user', true, 'active', NOW(), NOW()),
    (deterministic_uuid('patient9'), 'James Moore', 'james.moore@sospatient.com', '+11111111119', 'user', true, 'active', NOW(), NOW()),
    (deterministic_uuid('patient10'), 'Jennifer Taylor', 'jennifer.taylor@sospatient.com', '+11111111120', 'user', true, 'active', NOW(), NOW()),
    (deterministic_uuid('patient11'), 'Daniel Anderson', 'daniel.anderson@sospatient.com', '+11111111121', 'user', true, 'active', NOW(), NOW()),
    (deterministic_uuid('patient12'), 'Mary Thomas', 'mary.thomas@sospatient.com', '+11111111122', 'user', true, 'active', NOW(), NOW()),
    (deterministic_uuid('patient13'), 'Christopher Jackson', 'christopher.jackson@sospatient.com', '+11111111123', 'user', true, 'active', NOW(), NOW()),
    (deterministic_uuid('patient14'), 'Patricia White', 'patricia.white@sospatient.com', '+11111111124', 'user', true, 'active', NOW(), NOW()),
    (deterministic_uuid('patient15'), 'Matthew Harris', 'matthew.harris@sospatient.com', '+11111111125', 'user', true, 'active', NOW(), NOW()),
    (deterministic_uuid('patient16'), 'Linda Martin', 'linda.martin@sospatient.com', '+11111111126', 'user', true, 'active', NOW(), NOW()),
    (deterministic_uuid('patient17'), 'Anthony Thompson', 'anthony.thompson@sospatient.com', '+11111111127', 'user', true, 'active', NOW(), NOW()),
    (deterministic_uuid('patient18'), 'Barbara Garcia', 'barbara.garcia@sospatient.com', '+11111111128', 'user', true, 'active', NOW(), NOW()),
    (deterministic_uuid('patient19'), 'Donald Martinez', 'donald.martinez@sospatient.com', '+11111111129', 'user', true, 'active', NOW(), NOW()),
    (deterministic_uuid('patient20'), 'Susan Robinson', 'susan.robinson@sospatient.com', '+11111111130', 'user', true, 'active', NOW(), NOW());

-- Insert doctor profiles
INSERT INTO public.doctor_profiles (user_id, specialisation, rating, rating_count, address, working_hours, bio, is_listed, supported_languages)
VALUES 
    (deterministic_uuid('doctor1'), 'Cardiology', 4.8, 25, '123 Medical Center, Curepipe, Mauritius', 'Mon-Fri: 9AM-5PM', 'Experienced cardiologist with 10+ years of practice. Specialized in treating heart conditions and hypertension.', true, ARRAY['en', 'fr']),
    (deterministic_uuid('doctor2'), 'Pediatrics', 4.9, 32, '456 Children Hospital, Port Louis, Mauritius', 'Mon-Sat: 8AM-6PM', 'Dedicated pediatrician specializing in child development and preventive care for children of all ages.', true, ARRAY['en', 'fr', 'ar']),
    (deterministic_uuid('doctor3'), 'Dermatology', 4.7, 18, '789 Skin Clinic, Beau Bassin, Mauritius', 'Tue-Sun: 10AM-8PM', 'Expert dermatologist with focus on cosmetic procedures and treatment of skin conditions.', true, ARRAY['en']),
    (deterministic_uuid('doctor4'), 'Neurology', 4.6, 15, '101 Brain Center, Quatre Bornes, Mauritius', 'Mon-Thu: 10AM-7PM', 'Neurologist specializing in migraines, epilepsy, and other neurological disorders.', true, ARRAY['en', 'fr']),
    (deterministic_uuid('doctor5'), 'Orthopedics', 4.5, 20, '202 Bone Clinic, Vacoas, Mauritius', 'Mon-Fri: 8AM-4PM', 'Orthopedic surgeon with expertise in sports injuries and joint replacements.', true, ARRAY['en']),
    (deterministic_uuid('doctor6'), 'Gynecology', 4.9, 28, '303 Women Health, Rose Hill, Mauritius', 'Tue-Sat: 9AM-5PM', 'Women''s health specialist with 12+ years experience in reproductive health and prenatal care.', true, ARRAY['en', 'fr']),
    (deterministic_uuid('doctor7'), 'Psychiatry', 4.4, 17, '404 Mind Care, Port Louis, Mauritius', 'Mon-Wed-Fri: 11AM-8PM', 'Psychiatrist focusing on anxiety, depression, and mental wellness for all age groups.', true, ARRAY['en']),
    (deterministic_uuid('doctor8'), 'Ophthalmology', 4.7, 22, '505 Eye Institute, Curepipe, Mauritius', 'Mon-Fri: 9AM-6PM', 'Eye specialist with expertise in cataract surgery and treatment of vision disorders.', true, ARRAY['en', 'fr']),
    (deterministic_uuid('doctor9'), 'Dentistry', 4.8, 30, '606 Dental Center, Beau Bassin, Mauritius', 'Mon-Sat: 8AM-7PM', 'Cosmetic and restorative dentist with focus on pain-free procedures and modern techniques.', true, ARRAY['en']),
    (deterministic_uuid('doctor10'), 'General Practice', 4.6, 24, '707 Health Clinic, Quatre Bornes, Mauritius', 'Mon-Sun: 8AM-8PM', 'Experienced general practitioner for all ages with comprehensive healthcare services.', true, ARRAY['en', 'fr', 'ar']);

-- Insert user profiles for patients
INSERT INTO public.user_profiles (user_id, language, nickname, dob, gender, phone_number, nationality)
VALUES 
    (deterministic_uuid('patient1'), 'en', 'Johnny', '1990-05-15', 'Male', '+11111111111', 'American'),
    (deterministic_uuid('patient2'), 'fr', 'Janine', '1985-12-03', 'Female', '+11111111112', 'French'),
    (deterministic_uuid('patient3'), 'en', 'Mike', '1992-08-22', 'Male', '+11111111113', 'British'),
    (deterministic_uuid('patient4'), 'en', 'Emmy', '1988-02-14', 'Female', '+11111111114', 'Canadian'),
    (deterministic_uuid('patient5'), 'en', 'Dave', '1975-11-30', 'Male', '+11111111115', 'Australian'),
    (deterministic_uuid('patient6'), 'es', 'Sara', '1995-07-19', 'Female', '+11111111116', 'Spanish'),
    (deterministic_uuid('patient7'), 'en', 'Rob', '1982-04-25', 'Male', '+11111111117', 'Irish'),
    (deterministic_uuid('patient8'), 'fr', 'Lis', '1991-09-12', 'Female', '+11111111118', 'Belgian'),
    (deterministic_uuid('patient9'), 'en', 'Jim', '1987-01-08', 'Male', '+11111111119', 'American'),
    (deterministic_uuid('patient10'), 'en', 'Jen', '1993-03-17', 'Female', '+11111111120', 'British'),
    (deterministic_uuid('patient11'), 'en', 'Dan', '1980-10-29', 'Male', '+11111111121', 'American'),
    (deterministic_uuid('patient12'), 'en', 'Mary', '1978-06-05', 'Female', '+11111111122', 'American'),
    (deterministic_uuid('patient13'), 'en', 'Chris', '1994-12-20', 'Male', '+11111111123', 'Canadian'),
    (deterministic_uuid('patient14'), 'en', 'Patty', '1986-08-14', 'Female', '+11111111124', 'American'),
    (deterministic_uuid('patient15'), 'en', 'Matt', '1990-11-11', 'Male', '+11111111125', 'American'),
    (deterministic_uuid('patient16'), 'en', 'Linda', '1983-01-23', 'Female', '+11111111126', 'American'),
    (deterministic_uuid('patient17'), 'en', 'Tony', '1979-04-30', 'Male', '+11111111127', 'American'),
    (deterministic_uuid('patient18'), 'en', 'Barb', '1989-07-07', 'Female', '+11111111128', 'American'),
    (deterministic_uuid('patient19'), 'en', 'Don', '1996-05-16', 'Male', '+11111111129', 'American'),
    (deterministic_uuid('patient20'), 'en', 'Susan', '1984-09-22', 'Female', '+11111111130', 'American');

-- Insert user profiles for doctors
INSERT INTO public.user_profiles (user_id, language, nickname, dob, gender, phone_number, nationality)
VALUES 
    (deterministic_uuid('doctor1'), 'en', 'Alice', '1975-03-15', 'Female', '+12345678911', 'American'),
    (deterministic_uuid('doctor2'), 'en', 'Bob', '1972-07-22', 'Male', '+12345678912', 'British'),
    (deterministic_uuid('doctor3'), 'en', 'Carol', '1980-11-30', 'Female', '+12345678913', 'Canadian'),
    (deterministic_uuid('doctor4'), 'en', 'David', '1978-01-10', 'Male', '+12345678914', 'Australian'),
    (deterministic_uuid('doctor5'), 'en', 'Emma', '1982-05-18', 'Female', '+12345678915', 'American'),
    (deterministic_uuid('doctor6'), 'fr', 'Frank', '1970-09-25', 'Male', '+12345678916', 'French'),
    (deterministic_uuid('doctor7'), 'en', 'Grace', '1985-02-14', 'Female', '+12345678917', 'British'),
    (deterministic_uuid('doctor8'), 'en', 'Henry', '1977-12-03', 'Male', '+12345678918', 'American'),
    (deterministic_uuid('doctor9'), 'en', 'Irene', '1983-08-08', 'Female', '+12345678919', 'Canadian'),
    (deterministic_uuid('doctor10'), 'en', 'Jack', '1979-04-17', 'Male', '+12345678920', 'American');

-- Insert user profiles for admins
INSERT INTO public.user_profiles (user_id, language, nickname, dob, gender, phone_number, nationality)
VALUES 
    (deterministic_uuid('admin1'), 'en', 'Admin1', '1980-01-01', 'Male', '+12345678901', 'American'),
    (deterministic_uuid('admin2'), 'en', 'Admin2', '1985-02-02', 'Female', '+12345678902', 'British'),
    (deterministic_uuid('admin3'), 'en', 'Admin3', '1975-03-03', 'Male', '+12345678903', 'Canadian');

-- Insert user profiles for secretaries
INSERT INTO public.user_profiles (user_id, language, nickname, dob, gender, phone_number, nationality)
VALUES 
    (deterministic_uuid('secretary1'), 'en', 'Secretary1', '1990-04-04', 'Female', '+12345678921', 'American'),
    (deterministic_uuid('secretary2'), 'en', 'Secretary2', '1992-05-05', 'Male', '+12345678922', 'British');

-- Re-enable audit triggers
ALTER TABLE public.users ENABLE TRIGGER users_audit_trigger;
ALTER TABLE public.user_profiles ENABLE TRIGGER user_profiles_audit_trigger;
ALTER TABLE public.doctor_profiles ENABLE TRIGGER doctor_profiles_audit_trigger;
ALTER TABLE public.appointments ENABLE TRIGGER appointments_audit_trigger;
ALTER TABLE public.availabilities ENABLE TRIGGER availabilities_audit_trigger;
ALTER TABLE public.doctor_notes ENABLE TRIGGER doctor_notes_audit_trigger;
ALTER TABLE public.invoices ENABLE TRIGGER invoices_audit_trigger;
ALTER TABLE public.prescriptions ENABLE TRIGGER prescriptions_audit_trigger;
ALTER TABLE public.medications ENABLE TRIGGER medications_audit_trigger;
ALTER TABLE public.tokens ENABLE TRIGGER tokens_audit_trigger;
ALTER TABLE public.medical_histories ENABLE TRIGGER medical_histories_audit_trigger;
ALTER TABLE public.app_configs ENABLE TRIGGER app_configs_audit_trigger;

-- Clean up the deterministic_uuid function
DROP FUNCTION IF EXISTS deterministic_uuid(TEXT);

-- Display completion message
SELECT '✅ SEED DATA INSERTED SUCCESSFULLY!' as status;

-- Show summary of inserted data
SELECT '📊 Seed Data Summary:' as info;

SELECT 
    'Admins' as user_type,
    COUNT(*) as count
FROM public.users 
WHERE role = 'admin'

UNION ALL

SELECT 
    'Secretaries' as user_type,
    COUNT(*) as count
FROM public.users 
WHERE role = 'secretary'

UNION ALL

SELECT 
    'Doctors' as user_type,
    COUNT(*) as count
FROM public.users 
WHERE role = 'doctor'

UNION ALL

SELECT 
    'Patients' as user_type,
    COUNT(*) as count
FROM public.users 
WHERE role = 'user'

ORDER BY user_type;