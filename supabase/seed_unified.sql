-- Seeding procedure for the SOS Tourist Doctor API
-- This script populates the database with sample data for testing and development

CREATE OR REPLACE PROCEDURE public.seed_database()
LANGUAGE plpgsql
AS $$
DECLARE
    admin_id UUID;
    doctor1_id UUID;
    doctor2_id UUID;
    doctor3_id UUID;
    patient1_id UUID;
    patient2_id UUID;
    patient3_id UUID;
    appt1_id UUID;
    appt2_id UUID;
    appt3_id UUID;
BEGIN
    -- Insert admin user
    INSERT INTO public.users (id, name, email, phone, role, is_email_verified, is_status, created_at, updated_at)
    VALUES (
        '00000000-0000-0000-0000-000000000001',
        'Admin User',
        'admin@example.com',
        '+23050000001',
        'admin',
        true,
        'active',
        NOW(),
        NOW()
    )
    RETURNING id INTO admin_id;

    -- Insert doctor users
    INSERT INTO public.users (id, name, email, phone, role, is_email_verified, is_status, created_at, updated_at)
    VALUES 
        (
            '00000000-0000-0000-0000-000000000002',
            'Dr. Alice Smith',
            'alice.smith@example.com',
            '+23050000002',
            'doctor',
            true,
            'active',
            NOW(),
            NOW()
        ),
        (
            '00000000-0000-0000-0000-000000000003',
            'Dr. Bob Johnson',
            'bob.johnson@example.com',
            '+23050000003',
            'doctor',
            true,
            'active',
            NOW(),
            NOW()
        ),
        (
            '00000000-0000-0000-0000-000000000004',
            'Dr. Carol Williams',
            'carol.williams@example.com',
            '+23050000004',
            'doctor',
            true,
            'active',
            NOW(),
            NOW()
        )
    RETURNING id INTO TEMP TABLE temp_doctors(id);
    
    SELECT INTO doctor1_id id FROM temp_doctors ORDER BY id LIMIT 1 OFFSET 0;
    SELECT INTO doctor2_id id FROM temp_doctors ORDER BY id LIMIT 1 OFFSET 1;
    SELECT INTO doctor3_id id FROM temp_doctors ORDER BY id LIMIT 1 OFFSET 2;
    DROP TABLE temp_doctors;

    -- Insert patient users
    INSERT INTO public.users (id, name, email, phone, role, is_email_verified, is_status, created_at, updated_at)
    VALUES 
        (
            '00000000-0000-0000-0000-000000000005',
            'John Doe',
            'john.doe@example.com',
            '+23050000005',
            'user',
            true,
            'active',
            NOW(),
            NOW()
        ),
        (
            '00000000-0000-0000-0000-000000000006',
            'Jane Smith',
            'jane.smith@example.com',
            '+23050000006',
            'user',
            true,
            'active',
            NOW(),
            NOW()
        ),
        (
            '00000000-0000-0000-0000-000000000007',
            'Michael Johnson',
            'michael.johnson@example.com',
            '+23050000007',
            'user',
            true,
            'active',
            NOW(),
            NOW()
        )
    RETURNING id INTO TEMP TABLE temp_patients(id);
    
    SELECT INTO patient1_id id FROM temp_patients ORDER BY id LIMIT 1 OFFSET 0;
    SELECT INTO patient2_id id FROM temp_patients ORDER BY id LIMIT 1 OFFSET 1;
    SELECT INTO patient3_id id FROM temp_patients ORDER BY id LIMIT 1 OFFSET 2;
    DROP TABLE temp_patients;

    -- Insert doctor profiles
    INSERT INTO public.doctor_profiles (user_id, specialisation, rating, rating_count, address, working_hours, bio, is_listed, supported_languages)
    VALUES 
        (doctor1_id, 'Cardiology', 4.8, 25, '123 Medical Center, Curepipe', 'Mon-Fri: 9AM-5PM', 'Experienced cardiologist with 10+ years of practice', true, ARRAY['en', 'fr']),
        (doctor2_id, 'Pediatrics', 4.9, 32, '456 Children Hospital, Port Louis', 'Mon-Sat: 8AM-6PM', 'Dedicated pediatrician specializing in child development', true, ARRAY['en', 'fr', 'ar']),
        (doctor3_id, 'Dermatology', 4.7, 18, '789 Skin Clinic, Beau Bassin', 'Tue-Sun: 10AM-8PM', 'Expert dermatologist with focus on cosmetic procedures', true, ARRAY['en']);

    -- Insert user profiles
    INSERT INTO public.user_profiles (user_id, language, nickname, dob, gender, phone_number, nationality)
    VALUES 
        (patient1_id, 'en', 'Johnny', '1990-05-15', 'Male', '+23050000005', 'Mauritian'),
        (patient2_id, 'fr', 'Janine', '1985-12-03', 'Female', '+23050000006', 'French'),
        (patient3_id, 'en', 'Mike', '1992-08-22', 'Male', '+23050000007', 'British');

    -- Insert appointments
    INSERT INTO public.appointments (id, user_id, doctor_id, date, start_time, end_time, status, consultation_type, symptoms, additional_note)
    VALUES 
        (
            '10000000-0000-0000-0000-000000000001',
            patient1_id,
            doctor1_id,
            CURRENT_DATE + INTERVAL '2 days',
            '10:00',
            '10:30',
            'confirmed',
            'online',
            ARRAY['chest pain', 'shortness of breath'],
            'Patient reports occasional chest discomfort after exercise'
        ),
        (
            '10000000-0000-0000-0000-000000000002',
            patient2_id,
            doctor2_id,
            CURRENT_DATE + INTERVAL '1 day',
            '14:00',
            '14:45',
            'confirmed',
            'video',
            ARRAY['fever', 'cough'],
            'Child has had mild fever for 2 days'
        ),
        (
            '10000000-0000-0000-0000-000000000003',
            patient3_id,
            doctor3_id,
            CURRENT_DATE + INTERVAL '3 days',
            '11:00',
            '11:30',
            'pending_payment',
            'chat',
            ARRAY['rash', 'itching'],
            'Patient concerned about persistent rash on arms'
        )
    RETURNING id INTO TEMP TABLE temp_appointments(id);
    
    SELECT INTO appt1_id id FROM temp_appointments ORDER BY id LIMIT 1 OFFSET 0;
    SELECT INTO appt2_id id FROM temp_appointments ORDER BY id LIMIT 1 OFFSET 1;
    SELECT INTO appt3_id id FROM temp_appointments ORDER BY id LIMIT 1 OFFSET 2;
    DROP TABLE temp_appointments;

    -- Insert prescriptions
    INSERT INTO public.prescriptions (id, patient_id, doctor_id, appointment_id, medications)
    VALUES 
        (
            '20000000-0000-0000-0000-000000000001',
            patient1_id,
            doctor1_id,
            appt1_id,
            '[
                {
                    "name": "Aspirin",
                    "dosage": "75mg",
                    "duration": "30 days",
                    "strength": "75mg",
                    "ideal_times": ["morning"]
                },
                {
                    "name": "Lisinopril",
                    "dosage": "10mg",
                    "duration": "30 days",
                    "strength": "10mg",
                    "ideal_times": ["morning"]
                }
            ]'::jsonb
        ),
        (
            '20000000-0000-0000-0000-000000000002',
            patient2_id,
            doctor2_id,
            appt2_id,
            '[
                {
                    "name": "Paracetamol",
                    "dosage": "120mg",
                    "duration": "5 days",
                    "strength": "120mg",
                    "ideal_times": ["morning", "evening"]
                }
            ]'::jsonb
        );

    -- Insert medications
    INSERT INTO public.medications (prescription_id, name, dosage, duration, strength, ideal_times)
    VALUES 
        ('20000000-0000-0000-0000-000000000001', 'Aspirin', '75mg', '30 days', '75mg', ARRAY['morning']),
        ('20000000-0000-0000-0000-000000000001', 'Lisinopril', '10mg', '30 days', '10mg', ARRAY['morning']),
        ('20000000-0000-0000-0000-000000000002', 'Paracetamol', '120mg', '5 days', '120mg', ARRAY['morning', 'evening']);

    -- Insert doctor notes
    INSERT INTO public.doctor_notes (patient_id, doctor_id, appointment_id, note)
    VALUES 
        (patient1_id, doctor1_id, appt1_id, 'Patient shows signs of mild angina. Prescribed medication and recommended stress test.'),
        (patient2_id, doctor2_id, appt2_id, 'Common cold symptoms. Advised rest and plenty of fluids. Prescribed paracetamol for fever.'),
        (patient3_id, doctor3_id, appt3_id, 'Suspected contact dermatitis. Awaiting appointment for proper examination.');

    -- Insert invoices
    INSERT INTO public.invoices (appointment_id, status, amount, currency)
    VALUES 
        (appt1_id, 'payment_completed', 150.00, 'MUR'),
        (appt2_id, 'payment_completed', 120.00, 'MUR'),
        (appt3_id, 'pending_payment', 100.00, 'MUR');

    -- Insert medical histories
    INSERT INTO public.medical_histories (patient_id, doctor_id, appointment_id, condition, diagnosis_date, notes)
    VALUES 
        (patient1_id, doctor1_id, appt1_id, 'Hypertension', CURRENT_DATE - INTERVAL '2 years', 'Patient diagnosed with hypertension, on regular medication.'),
        (patient2_id, doctor2_id, appt2_id, 'Common Cold', CURRENT_DATE, 'Mild viral infection, no complications.'),
        (patient3_id, doctor3_id, appt3_id, 'Hypertension', CURRENT_DATE - INTERVAL '2 years', 'Patient diagnosed with hypertension, on regular medication.');

    -- Insert some app configurations
    INSERT INTO public.app_configs (key, description, configs, creator)
    VALUES 
        ('default_settings', 'Default application settings', '{"theme": "light", "notifications": true, "language": "en"}', admin_id),
        ('clinic_settings', 'Clinic-specific settings', '{"working_hours": "Mon-Fri: 8:00 AM - 6:00 PM", "appointment_buffer": 15, "cancellation_policy": "24 hours"}', admin_id),
        ('payment_settings', 'Payment configuration', '{"currency": "MUR", "tax_rate": 0.07, "payment_methods": ["credit_card", "paypal"]}', admin_id);
END;
$$;