-- Comprehensive Supabase Schema with Automated Seeding and Cleanup
-- Drops all objects before creating schema and seeding data

-- Disable foreign key checks temporarily to allow dropping tables
SET session_replication_role = 'replica';

-- Comprehensive cleanup: Drop all dependent objects
DO $$ 
DECLARE
    r RECORD;
BEGIN
    -- Drop all tables
    FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
        EXECUTE 'DROP TABLE IF EXISTS public.' || quote_ident(r.tablename) || ' CASCADE';
    END LOOP;
    
    -- Drop all types
    FOR r IN (SELECT typname FROM pg_type WHERE typnamespace = 'public'::regnamespace AND typtype = 'e') LOOP
        EXECUTE 'DROP TYPE IF EXISTS public.' || quote_ident(r.typname) || ' CASCADE';
    END LOOP;
    
    -- Drop all functions
    FOR r IN (SELECT proname, oid FROM pg_proc WHERE pronamespace = 'public'::regnamespace) LOOP
        EXECUTE 'DROP FUNCTION IF EXISTS public.' || quote_ident(r.proname) || ' CASCADE';
    END LOOP;
    
    -- Drop all triggers
    FOR r IN (SELECT tgname, tgrelid FROM pg_trigger WHERE tgrelid IN (SELECT oid FROM pg_class WHERE relnamespace = 'public'::regnamespace)) LOOP
        EXECUTE 'DROP TRIGGER IF EXISTS ' || quote_ident(r.tgname) || ' ON ' || 
                (SELECT relname FROM pg_class WHERE oid = r.tgrelid) || ' CASCADE';
    END LOOP;
END $$;

-- Drop extension if it exists
DROP EXTENSION IF EXISTS "uuid-ossp" CASCADE;

-- Re-enable foreign key checks
SET session_replication_role = 'origin';

-- Create uuid-ossp extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create ENUM Types
CREATE TYPE user_role_enum AS ENUM ('user', 'doctor', 'admin');
CREATE TYPE user_status_enum AS ENUM ('pending', 'active', 'blocked');
CREATE TYPE appointment_status_enum AS ENUM ('pending_payment', 'payment_completed', 'payment_failed', 'confirmed', 'completed', 'cancelled');
CREATE TYPE consultation_type_enum AS ENUM ('home', 'online', 'chat', 'video');
CREATE TYPE invoice_status_enum AS ENUM ('pending_payment', 'payment_completed', 'payment_failed', 'confirmed', 'completed', 'cancelled');
CREATE TYPE token_type_enum AS ENUM ('refresh', 'reset_password', 'verify_email', 'temp_token');
CREATE TYPE recurrence_enum AS ENUM ('daily', 'weekly', 'monthly');

-- Create Tables
CREATE TABLE public.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT,
    email TEXT UNIQUE NOT NULL,
    phone TEXT UNIQUE,
    role user_role_enum DEFAULT 'user' NOT NULL,
    is_email_verified BOOLEAN DEFAULT FALSE NOT NULL,
    profile_picture TEXT,
    is_status user_status_enum DEFAULT 'pending' NOT NULL,
    stream_user_id TEXT,
    is_archived BOOLEAN DEFAULT FALSE NOT NULL,
    archived_at TIMESTAMP WITH TIME ZONE,
    invitation_token TEXT,
    invitation_expires TIMESTAMP WITH TIME ZONE,
    is_invitation BOOLEAN DEFAULT FALSE NOT NULL,
    deletion_request_token TEXT,
    deletion_request_expires TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE public.user_profiles (
    user_id UUID PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
    language VARCHAR(10) DEFAULT 'en',
    nickname VARCHAR(255),
    dob DATE,
    gender VARCHAR(50),
    phone_number VARCHAR(50),
    nationality VARCHAR(100)
);

CREATE TABLE public.doctor_profiles (
    user_id UUID PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
    specialisation VARCHAR(255),
    rating NUMERIC(2,1) DEFAULT 0.0 NOT NULL,
    rating_count INTEGER DEFAULT 0 NOT NULL,
    address TEXT,
    working_hours TEXT,
    bio TEXT,
    is_listed BOOLEAN DEFAULT FALSE NOT NULL,
    supported_languages VARCHAR(50)[]
);

CREATE TABLE public.app_configs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key TEXT UNIQUE NOT NULL,
    description TEXT,
    configs JSONB NOT NULL,
    creator UUID REFERENCES public.users(id) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT valid_key_format CHECK (key ~ '^[a-zA-Z0-9_]+$')
);

CREATE TABLE public.appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    doctor_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    date DATE NOT NULL,
    start_time TEXT NOT NULL,
    end_time TEXT NOT NULL,
    status appointment_status_enum DEFAULT 'pending_payment' NOT NULL,
    stream_channel_id TEXT,
    consultation_type consultation_type_enum NOT NULL,
    symptoms TEXT[],
    additional_note TEXT,
    visit_location JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT chk_visit_location CHECK (
        (consultation_type = 'home' AND visit_location IS NOT NULL) OR
        (consultation_type IN ('online', 'chat', 'video') AND visit_location IS NULL)
    )
);

CREATE TABLE public.availabilities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    is_recurring BOOLEAN DEFAULT FALSE,
    recurrence VARCHAR(10) CHECK (recurrence IN ('daily', 'weekly', 'monthly')),
    recurrence_end_date DATE,
    consultation_types VARCHAR(10)[] NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE public.doctor_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID REFERENCES public.users(id) NOT NULL,
    doctor_id UUID REFERENCES public.users(id) NOT NULL,
    appointment_id UUID REFERENCES public.appointments(id) NOT NULL,
    note TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE public.invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    appointment_id UUID REFERENCES public.appointments(id) ON DELETE CASCADE NOT NULL,
    status invoice_status_enum DEFAULT 'pending_payment' NOT NULL,
    mips_id_order TEXT,
    payment_link TEXT,
    amount NUMERIC NOT NULL,
    currency TEXT DEFAULT 'MUR' NOT NULL,
    details JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE (appointment_id)
);

CREATE TABLE public.prescriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID REFERENCES public.users(id) NOT NULL,
    doctor_id UUID REFERENCES public.users(id) NOT NULL,
    appointment_id UUID REFERENCES public.appointments(id) NOT NULL,
    medications JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE public.medications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    prescription_id UUID REFERENCES public.prescriptions(id) ON DELETE CASCADE NOT NULL,
    name VARCHAR(255) NOT NULL,
    dosage VARCHAR(255) NOT NULL,
    duration VARCHAR(255) NOT NULL,
    strength VARCHAR(255) NOT NULL,
    ideal_times VARCHAR(50)[]
);

CREATE TABLE public.tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    token TEXT NOT NULL,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    type token_type_enum NOT NULL,
    expires TIMESTAMP WITH TIME ZONE NOT NULL,
    blacklisted BOOLEAN DEFAULT FALSE NOT NULL
);



CREATE TABLE public.medical_histories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID REFERENCES public.users(id) NOT NULL,
    doctor_id UUID REFERENCES public.users(id),
    appointment_id UUID REFERENCES public.appointments(id),
    condition TEXT NOT NULL,
    diagnosis_date DATE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users (email);
CREATE INDEX IF NOT EXISTS idx_users_phone ON public.users (phone);
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users (role);
CREATE INDEX IF NOT EXISTS idx_users_is_archived ON public.users (is_archived);
CREATE INDEX IF NOT EXISTS idx_users_invitation_token ON public.users (invitation_token);
CREATE INDEX IF NOT EXISTS idx_users_deletion_request_token ON public.users (deletion_request_token);
CREATE INDEX IF NOT EXISTS idx_appointments_user_id ON public.appointments (user_id);
CREATE INDEX IF NOT EXISTS idx_appointments_doctor_id ON public.appointments (doctor_id);
CREATE INDEX IF NOT EXISTS idx_appointments_date ON public.appointments (date);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON public.appointments (status);
CREATE INDEX IF NOT EXISTS idx_appointments_consultation_type ON public.appointments (consultation_type);
CREATE INDEX IF NOT EXISTS idx_app_configs_key ON public.app_configs (key);
CREATE INDEX IF NOT EXISTS idx_app_configs_creator ON public.app_configs (creator);
CREATE INDEX IF NOT EXISTS idx_availabilities_user_id ON public.availabilities(user_id);
CREATE INDEX IF NOT EXISTS idx_availabilities_date_range ON public.availabilities(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_availabilities_recurring ON public.availabilities(is_recurring);
CREATE INDEX IF NOT EXISTS idx_doctor_notes_patient_id ON public.doctor_notes(patient_id);
CREATE INDEX IF NOT EXISTS idx_doctor_notes_doctor_id ON public.doctor_notes(doctor_id);
CREATE INDEX IF NOT EXISTS idx_doctor_notes_appointment_id ON public.doctor_notes(appointment_id);
CREATE INDEX IF NOT EXISTS idx_invoices_appointment_id ON public.invoices (appointment_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON public.invoices (status);
CREATE INDEX IF NOT EXISTS idx_invoices_mips_id_order ON public.invoices (mips_id_order);
CREATE INDEX IF NOT EXISTS idx_prescriptions_patient_id ON public.prescriptions(patient_id);
CREATE INDEX IF NOT EXISTS idx_prescriptions_doctor_id ON public.prescriptions(doctor_id);
CREATE INDEX IF NOT EXISTS idx_prescriptions_appointment_id ON public.prescriptions(appointment_id);
CREATE INDEX IF NOT EXISTS idx_medications_prescription_id ON public.medications(prescription_id);
CREATE INDEX IF NOT EXISTS idx_tokens_user_id ON public.tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_tokens_token ON public.tokens(token);
CREATE INDEX IF NOT EXISTS idx_tokens_type ON public.tokens(type);
CREATE INDEX IF NOT EXISTS idx_tokens_expires ON public.tokens(expires);
CREATE INDEX IF NOT EXISTS idx_medical_histories_patient_id ON public.medical_histories(patient_id);
CREATE INDEX IF NOT EXISTS idx_medical_histories_doctor_id ON public.medical_histories(doctor_id);
CREATE INDEX IF NOT EXISTS idx_medical_histories_appointment_id ON public.medical_histories(appointment_id);

-- Enable RLS for all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.doctor_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.availabilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.doctor_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.otps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medical_histories ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own profile" ON public.users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON public.users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can view their own user_profile" ON public.user_profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own user_profile" ON public.user_profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can view their own doctor_profile" ON public.doctor_profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own doctor_profile" ON public.doctor_profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all app configs" ON public.app_configs FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Authenticated users can view app configs" ON public.app_configs FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Admins can insert app configs" ON public.app_configs FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admins can update app configs" ON public.app_configs FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admins can delete app configs" ON public.app_configs FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Users can view their own appointments" ON public.appointments FOR SELECT USING (auth.uid() = user_id OR auth.uid() = doctor_id);
CREATE POLICY "Users can insert their own appointments" ON public.appointments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own appointments" ON public.appointments FOR UPDATE USING (auth.uid() = user_id OR auth.uid() = doctor_id);
CREATE POLICY "Users can view their own availabilities" ON public.availabilities FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can create their own availabilities" ON public.availabilities FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update their own availabilities" ON public.availabilities FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Users can delete their own availabilities" ON public.availabilities FOR DELETE USING (user_id = auth.uid());
CREATE POLICY "Doctors and patients can view notes" ON public.doctor_notes FOR SELECT USING (patient_id = auth.uid() OR doctor_id = auth.uid());
CREATE POLICY "Doctors can create notes for their appointments" ON public.doctor_notes FOR INSERT WITH CHECK (doctor_id = auth.uid());
CREATE POLICY "Doctors can update their own notes" ON public.doctor_notes FOR UPDATE USING (doctor_id = auth.uid());
CREATE POLICY "Doctors can delete their own notes" ON public.doctor_notes FOR DELETE USING (doctor_id = auth.uid());
CREATE POLICY "Users can view their own invoices" ON public.invoices FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.appointments a JOIN public.users u ON a.user_id = u.id WHERE a.id = appointment_id AND (u.id = auth.uid() OR a.doctor_id = auth.uid()))
);
CREATE POLICY "Admins can insert invoices" ON public.invoices FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Users can update their own invoices" ON public.invoices FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.appointments a JOIN public.users u ON a.user_id = u.id WHERE a.id = appointment_id AND (u.id = auth.uid() OR a.doctor_id = auth.uid()))
);
CREATE POLICY "Doctors and patients can view prescriptions" ON public.prescriptions FOR SELECT USING (patient_id = auth.uid() OR doctor_id = auth.uid());
CREATE POLICY "Doctors can create prescriptions for their appointments" ON public.prescriptions FOR INSERT WITH CHECK (doctor_id = auth.uid());
CREATE POLICY "Doctors can update their own prescriptions" ON public.prescriptions FOR UPDATE USING (doctor_id = auth.uid());
CREATE POLICY "Doctors can delete their own prescriptions" ON public.prescriptions FOR DELETE USING (doctor_id = auth.uid());
CREATE POLICY "Doctors and patients can view medications" ON public.medications FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.prescriptions WHERE id = prescription_id AND (patient_id = auth.uid() OR doctor_id = auth.uid()))
);
CREATE POLICY "Doctors can create medications" ON public.medications FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.prescriptions WHERE id = prescription_id AND doctor_id = auth.uid())
);
CREATE POLICY "Doctors can update medications" ON public.medications FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.prescriptions WHERE id = prescription_id AND doctor_id = auth.uid())
);
CREATE POLICY "Doctors can delete medications" ON public.medications FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.prescriptions WHERE id = prescription_id AND doctor_id = auth.uid())
);

CREATE POLICY "Patients can view their own medical history" ON public.medical_histories FOR SELECT USING (patient_id = auth.uid());
CREATE POLICY "Doctors can view medical history for their patients" ON public.medical_histories FOR SELECT USING (doctor_id = auth.uid());
CREATE POLICY "Doctors can create medical history" ON public.medical_histories FOR INSERT WITH CHECK (doctor_id = auth.uid());
CREATE POLICY "Doctors can update medical history" ON public.medical_histories FOR UPDATE USING (doctor_id = auth.uid());
CREATE POLICY "Doctors can delete medical history" ON public.medical_histories FOR DELETE USING (doctor_id = auth.uid());

-- Create audit_log table
CREATE TABLE IF NOT EXISTS public.audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    table_name TEXT NOT NULL,
    record_id TEXT NOT NULL,
    old_record JSONB,
    new_record JSONB,
    changed_by UUID REFERENCES public.users(id),
    changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create trigger function for audit logging with dynamic primary key handling
CREATE OR REPLACE FUNCTION public.log_changes() RETURNS TRIGGER AS $$
DECLARE
    pk_column TEXT;
    pk_value TEXT;
BEGIN
    -- Determine the primary key column for the table
    SELECT a.attname INTO pk_column
    FROM pg_index i
    JOIN pg_attribute a ON a.attrelid = i.indrelid AND a.attnum = ANY(i.indkey)
    WHERE i.indrelid = TG_RELID AND i.indisprimary;

    -- Get the primary key value dynamically
    IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
        EXECUTE format('SELECT ($1).%I::TEXT', pk_column) USING NEW INTO pk_value;
    ELSE
        EXECUTE format('SELECT ($1).%I::TEXT', pk_column) USING OLD INTO pk_value;
    END IF;

    IF (TG_OP = 'INSERT') THEN
        INSERT INTO public.audit_log (table_name, record_id, new_record, changed_by)
        VALUES (TG_TABLE_NAME, pk_value, to_jsonb(NEW), auth.uid());
        RETURN NEW;
    ELSIF (TG_OP = 'UPDATE') THEN
        INSERT INTO public.audit_log (table_name, record_id, old_record, new_record, changed_by)
        VALUES (TG_TABLE_NAME, pk_value, to_jsonb(OLD), to_jsonb(NEW), auth.uid());
        RETURN NEW;
    ELSIF (TG_OP = 'DELETE') THEN
        INSERT INTO public.audit_log (table_name, record_id, old_record, changed_by)
        VALUES (TG_TABLE_NAME, pk_value, to_jsonb(OLD), auth.uid());
        RETURN OLD;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for audit logging
CREATE TRIGGER users_audit_trigger AFTER INSERT OR UPDATE OR DELETE ON public.users FOR EACH ROW EXECUTE FUNCTION public.log_changes();
CREATE TRIGGER user_profiles_audit_trigger AFTER INSERT OR UPDATE OR DELETE ON public.user_profiles FOR EACH ROW EXECUTE FUNCTION public.log_changes();
CREATE TRIGGER doctor_profiles_audit_trigger AFTER INSERT OR UPDATE OR DELETE ON public.doctor_profiles FOR EACH ROW EXECUTE FUNCTION public.log_changes();
CREATE TRIGGER app_configs_audit_trigger AFTER INSERT OR UPDATE OR DELETE ON public.app_configs FOR EACH ROW EXECUTE FUNCTION public.log_changes();
CREATE TRIGGER appointments_audit_trigger AFTER INSERT OR UPDATE OR DELETE ON public.appointments FOR EACH ROW EXECUTE FUNCTION public.log_changes();
CREATE TRIGGER availabilities_audit_trigger AFTER INSERT OR UPDATE OR DELETE ON public.availabilities FOR EACH ROW EXECUTE FUNCTION public.log_changes();
CREATE TRIGGER doctor_notes_audit_trigger AFTER INSERT OR UPDATE OR DELETE ON public.doctor_notes FOR EACH ROW EXECUTE FUNCTION public.log_changes();
CREATE TRIGGER invoices_audit_trigger AFTER INSERT OR UPDATE OR DELETE ON public.invoices FOR EACH ROW EXECUTE FUNCTION public.log_changes();
CREATE TRIGGER otps_audit_trigger AFTER INSERT OR UPDATE OR DELETE ON public.otps FOR EACH ROW EXECUTE FUNCTION public.log_changes();
CREATE TRIGGER prescriptions_audit_trigger AFTER INSERT OR UPDATE OR DELETE ON public.prescriptions FOR EACH ROW EXECUTE FUNCTION public.log_changes();
CREATE TRIGGER medications_audit_trigger AFTER INSERT OR UPDATE OR DELETE ON public.medications FOR EACH ROW EXECUTE FUNCTION public.log_changes();

CREATE TRIGGER medical_histories_audit_trigger AFTER INSERT OR UPDATE OR DELETE ON public.medical_histories FOR EACH ROW EXECUTE FUNCTION public.log_changes();

-- Comments
COMMENT ON TABLE public.users IS 'User profiles and account information';
COMMENT ON COLUMN public.users.id IS 'Unique identifier for the user';
COMMENT ON COLUMN public.users.name IS 'User full name';
COMMENT ON COLUMN public.users.email IS 'User email address';
COMMENT ON COLUMN public.users.phone IS 'User phone number';
COMMENT ON COLUMN public.users.password IS 'Hashed password for invited users';
COMMENT ON COLUMN public.users.role IS 'User role: user, doctor, admin';
COMMENT ON COLUMN public.users.is_email_verified IS 'Whether the user email is verified';
COMMENT ON COLUMN public.users.profile_picture IS 'URL to user profile picture';
COMMENT ON COLUMN public.users.is_status IS 'User account status: pending, active, blocked';
COMMENT ON COLUMN public.users.stream_user_id IS 'User ID for Stream chat integration';
COMMENT ON COLUMN public.users.is_archived IS 'Whether the user account is archived';
COMMENT ON COLUMN public.users.archived_at IS 'Timestamp when the user was archived';
COMMENT ON COLUMN public.users.invitation_token IS 'Token for user invitation';
COMMENT ON COLUMN public.users.invitation_expires IS 'Expiration timestamp for invitation token';
COMMENT ON COLUMN public.users.is_invitation IS 'Whether the user was invited';
COMMENT ON COLUMN public.users.deletion_request_token IS 'Token for account deletion request';
COMMENT ON COLUMN public.users.deletion_request_expires IS 'Expiration timestamp for deletion request token';
COMMENT ON TABLE public.user_profiles IS 'Stores additional user profile information';
COMMENT ON TABLE public.doctor_profiles IS 'Stores doctor-specific profile information';
COMMENT ON COLUMN public.doctor_profiles.specialisation IS 'Doctor''s medical specialization';
COMMENT ON COLUMN public.doctor_profiles.is_listed IS 'Whether the doctor is listed for booking';
COMMENT ON TABLE public.app_configs IS 'Application configuration settings';
COMMENT ON COLUMN public.app_configs.id IS 'Unique identifier for the app config';
COMMENT ON COLUMN public.app_configs.key IS 'Unique key for the configuration setting';
COMMENT ON COLUMN public.app_configs.description IS 'Description of the configuration setting';
COMMENT ON COLUMN public.app_configs.configs IS 'JSON object containing the actual configuration values';
COMMENT ON COLUMN public.app_configs.creator IS 'Reference to the user who created this config';
COMMENT ON TABLE public.appointments IS 'Appointment records for medical consultations';
COMMENT ON COLUMN public.appointments.id IS 'Unique identifier for the appointment';
COMMENT ON COLUMN public.appointments.user_id IS 'Reference to the user (patient) who booked the appointment';
COMMENT ON COLUMN public.appointments.doctor_id IS 'Reference to the doctor assigned to the appointment';
COMMENT ON COLUMN public.appointments.date IS 'Date of the appointment';
COMMENT ON COLUMN public.appointments.start_time IS 'Start time of the appointment';
COMMENT ON COLUMN public.appointments.end_time IS 'End time of the appointment';
COMMENT ON COLUMN public.appointments.status IS 'Current status of the appointment: pending_payment, payment_completed, payment_failed, confirmed, completed, cancelled';
COMMENT ON COLUMN public.appointments.stream_channel_id IS 'Stream channel ID for video consultation';
COMMENT ON COLUMN public.appointments.consultation_type IS 'Type of consultation: home, online, chat, video';
COMMENT ON COLUMN public.appointments.symptoms IS 'List of symptoms reported by the patient';
COMMENT ON COLUMN public.appointments.additional_note IS 'Additional notes provided by the patient';
COMMENT ON COLUMN public.appointments.visit_location IS 'Location information for home visits';
COMMENT ON TABLE public.availabilities IS 'Stores doctor availability information including recurring schedules';
COMMENT ON COLUMN public.availabilities.user_id IS 'Reference to the user (doctor) this availability belongs to';
COMMENT ON COLUMN public.availabilities.start_date IS 'Start date of the availability';
COMMENT ON COLUMN public.availabilities.end_date IS 'End date of the availability';
COMMENT ON COLUMN public.availabilities.start_time IS 'Start time of the availability (HH:MM:SS format)';
COMMENT ON COLUMN public.availabilities.end_time IS 'End time of the availability (HH:MM:SS format)';
COMMENT ON COLUMN public.availabilities.is_recurring IS 'Whether this availability is recurring';
COMMENT ON COLUMN public.availabilities.recurrence IS 'Recurrence pattern: daily, weekly, or monthly';
COMMENT ON COLUMN public.availabilities.recurrence_end_date IS 'End date for recurring availability';
COMMENT ON COLUMN public.availabilities.consultation_types IS 'Types of consultations offered during this availability (chat, video, home)';
COMMENT ON TABLE public.doctor_notes IS 'Stores doctor notes for patient appointments';
COMMENT ON COLUMN public.doctor_notes.patient_id IS 'Reference to the patient user';
COMMENT ON COLUMN public.doctor_notes.doctor_id IS 'Reference to the doctor user';
COMMENT ON COLUMN public.doctor_notes.appointment_id IS 'Reference to the appointment';
COMMENT ON COLUMN public.doctor_notes.note IS 'The actual note content';
COMMENT ON TABLE public.invoices IS 'Invoice records for appointments';
COMMENT ON COLUMN public.invoices.id IS 'Unique identifier for the invoice';
COMMENT ON COLUMN public.invoices.appointment_id IS 'Reference to the appointment this invoice is for';
COMMENT ON COLUMN public.invoices.status IS 'Current status of the invoice: pending_payment, payment_completed, payment_failed, confirmed, completed, cancelled';
COMMENT ON COLUMN public.invoices.mips_id_order IS 'Order ID from MIPS payment system';
COMMENT ON COLUMN public.invoices.payment_link IS 'Payment link for the invoice';
COMMENT ON COLUMN public.invoices.amount IS 'Amount to be paid';
COMMENT ON COLUMN public.invoices.currency IS 'Currency code for the amount';
COMMENT ON COLUMN public.invoices.details IS 'Additional details about the invoice';
COMMENT ON TABLE public.prescriptions IS 'Stores prescription information for patient appointments';
COMMENT ON COLUMN public.prescriptions.patient_id IS 'Reference to the patient user';
COMMENT ON COLUMN public.prescriptions.doctor_id IS 'Reference to the doctor user';
COMMENT ON COLUMN public.prescriptions.appointment_id IS 'Reference to the appointment';
COMMENT ON COLUMN public.prescriptions.medications IS 'JSONB array of medications with name, dosage, duration, strength and ideal times';
COMMENT ON TABLE public.medications IS 'Stores detailed medication information for prescriptions';
COMMENT ON COLUMN public.medications.prescription_id IS 'Reference to the prescription';

COMMENT ON TABLE public.medical_histories IS 'Stores patient medical history';
COMMENT ON COLUMN public.medical_histories.patient_id IS 'Reference to the patient user';
COMMENT ON COLUMN public.medical_histories.doctor_id IS 'Reference to the doctor user';
COMMENT ON COLUMN public.medical_histories.appointment_id IS 'Reference to the appointment';
COMMENT ON COLUMN public.medical_histories.condition IS 'Medical condition diagnosed';
COMMENT ON COLUMN public.medical_histories.diagnosis_date IS 'Date of diagnosis';
COMMENT ON COLUMN public.medical_histories.notes IS 'Additional notes about the condition';

-- Stored procedure for seeding data
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
    presc1_id UUID;
    presc2_id UUID;
BEGIN
    -- Insert admin user
    INSERT INTO public.users (name, email, role, is_email_verified, is_status, phone, stream_user_id, is_archived)
    VALUES ('Admin User', 'admin@example.com', 'admin', true, 'active', '+1234567890', 'admin-stream-id-123', false)
    RETURNING id INTO admin_id;

    -- Insert doctor users
    INSERT INTO public.users (name, email, role, is_email_verified, is_status, phone, stream_user_id, is_archived)
    VALUES 
        ('Dr. John Smith', 'doctor@example.com', 'doctor', true, 'active', '+1234567891', 'doctor-stream-id-123', false),
        ('Dr. Jane Doe', 'doctor2@example.com', 'doctor', true, 'active', '+1234567892', 'doctor-stream-id-124', false),
        ('Dr. Robert Johnson', 'doctor3@example.com', 'doctor', true, 'active', '+1234567893', 'doctor-stream-id-125', false)
    RETURNING id INTO doctor1_id, doctor2_id, doctor3_id;

    -- Insert patient users
    INSERT INTO public.users (name, email, role, is_email_verified, is_status, phone, stream_user_id, is_archived)
    VALUES 
        ('John Doe', 'patient@example.com', 'user', true, 'active', '+1234567896', 'patient-stream-id-123', false),
        ('Jane Smith', 'patient2@example.com', 'user', true, 'active', '+1234567897', 'patient-stream-id-124', false),
        ('Bob Wilson', 'patient3@example.com', 'user', true, 'active', '+1234567898', 'patient-stream-id-125', false)
    RETURNING id INTO patient1_id, patient2_id, patient3_id;

    -- Insert user profiles
    INSERT INTO public.user_profiles (user_id, language, nickname, dob, gender, phone_number, nationality)
    VALUES 
        (patient1_id, 'en', 'Johnny', '1990-05-15', 'male', '+1234567896', 'American'),
        (patient2_id, 'en', 'Janie', '1985-11-20', 'female', '+1234567897', 'Canadian'),
        (patient3_id, 'en', 'Bobby', '1992-08-22', 'male', '+1234567898', 'British'),
        (doctor1_id, 'en', 'Dr. John', '1975-03-22', 'male', '+1234567891', 'American'),
        (doctor2_id, 'en', 'Dr. Jane', '1978-08-15', 'female', '+1234567892', 'Canadian'),
        (doctor3_id, 'en', 'Dr. Robert', '1970-06-10', 'male', '+1234567893', 'British');

    -- Insert doctor profiles
    INSERT INTO public.doctor_profiles (user_id, specialisation, rating, rating_count, address, working_hours, bio, is_listed, supported_languages)
    VALUES 
        (doctor1_id, 'General Practitioner', 4.8, 42, '123 Medical Plaza, Suite 101', 'Mon-Fri: 9:00 AM - 5:00 PM', 'Dr. John Smith has over 10 years of experience in general medicine.', true, ARRAY['en', 'fr']),
        (doctor2_id, 'Pediatrics', 4.9, 38, '123 Medical Plaza, Suite 102', 'Mon-Fri: 8:00 AM - 4:00 PM', 'Dr. Jane Doe specializes in pediatric care with a focus on child development.', true, ARRAY['en', 'es']),
        (doctor3_id, 'Cardiology', 4.7, 29, '123 Medical Plaza, Suite 103', 'Mon-Sat: 10:00 AM - 6:00 PM', 'Dr. Robert Johnson is a board-certified cardiologist with expertise in preventive cardiology.', true, ARRAY['en']);

    -- Insert app configurations
    INSERT INTO public.app_configs (key, description, configs, creator)
    VALUES 
        ('default_settings', 'Default application settings', '{"theme": "light", "notifications": true, "language": "en"}', admin_id),
        ('clinic_settings', 'Clinic-specific settings', '{"working_hours": "Mon-Fri: 8:00 AM - 6:00 PM", "appointment_buffer": 15, "cancellation_policy": "24 hours"}', admin_id),
        ('payment_settings', 'Payment configuration', '{"currency": "MUR", "tax_rate": 0.07, "payment_methods": ["credit_card", "paypal"]}', admin_id);

    -- Insert appointments
    INSERT INTO public.appointments (user_id, doctor_id, date, start_time, end_time, status, stream_channel_id, consultation_type, symptoms, additional_note, visit_location)
    VALUES 
        (patient1_id, doctor1_id, CURRENT_DATE + INTERVAL '1 day', '09:00', '09:30', 'confirmed', 'channel-001', 'online', ARRAY['headache', 'fever'], 'Regular checkup', NULL),
        (patient2_id, doctor2_id, CURRENT_DATE + INTERVAL '2 days', '10:00', '10:30', 'pending_payment', 'channel-002', 'video', ARRAY['cough', 'sore_throat'], 'Respiratory symptoms', NULL),
        (patient3_id, doctor3_id, CURRENT_DATE + INTERVAL '3 days', '11:00', '11:30', 'completed', 'channel-003', 'home', ARRAY['chest_pain', 'shortness_of_breath'], 'Cardiac evaluation', '{"latitude": 20.1234567, "longitude": 57.7890123}')
    RETURNING id INTO appt1_id, appt2_id, appt3_id;

    -- Insert prescriptions
    INSERT INTO public.prescriptions (patient_id, doctor_id, appointment_id, medications)
    VALUES 
        (patient1_id, doctor1_id, appt1_id, '[{"name": "Paracetamol", "dosage": "500mg", "duration": "7 days", "strength": "500mg", "ideal_times": ["08:00", "20:00"]}, {"name": "Ibuprofen", "dosage": "200mg", "duration": "5 days", "strength": "200mg", "ideal_times": ["08:00", "14:00", "20:00"]}]'),
        (patient3_id, doctor3_id, appt3_id, '[{"name": "Atorvastatin", "dosage": "10mg", "duration": "30 days", "strength": "10mg", "ideal_times": ["20:00"]}, {"name": "Aspirin", "dosage": "81mg", "duration": "30 days", "strength": "81mg", "ideal_times": ["08:00"]}]')
    RETURNING id INTO presc1_id, presc2_id;

    -- Insert medications
    INSERT INTO public.medications (prescription_id, name, dosage, duration, strength, ideal_times)
    VALUES 
        (presc1_id, 'Paracetamol', '500mg', '7 days', '500mg', ARRAY['08:00', '20:00']),
        (presc1_id, 'Ibuprofen', '200mg', '5 days', '200mg', ARRAY['08:00', '14:00', '20:00']),
        (presc2_id, 'Atorvastatin', '10mg', '30 days', '10mg', ARRAY['20:00']),
        (presc2_id, 'Aspirin', '81mg', '30 days', '81mg', ARRAY['08:00']);

    -- Insert invoices
    INSERT INTO public.invoices (appointment_id, status, mips_id_order, payment_link, amount, currency, details)
    VALUES 
        (appt1_id, 'payment_completed', 'order-001', 'https://payment.example.com/order-001', 75.00, 'MUR', '{"service": "General Consultation", "tax": 5.00}'),
        (appt2_id, 'pending_payment', NULL, NULL, 120.00, 'MUR', '{"service": "Pediatric Visit", "tax": 8.00}'),
        (appt3_id, 'payment_completed', 'order-003', 'https://payment.example.com/order-003', 250.00, 'MUR', '{"service": "Cardiology Checkup", "tax": 15.00}');

    -- Insert availabilities
    INSERT INTO public.availabilities (user_id, start_date, end_date, start_time, end_time, is_recurring, recurrence, recurrence_end_date, consultation_types)
    VALUES 
        (doctor1_id, CURRENT_DATE - INTERVAL '30 days', CURRENT_DATE + INTERVAL '30 days', '08:00:00', '17:00:00', true, 'daily', CURRENT_DATE + INTERVAL '30 days', ARRAY['online', 'video']),
        (doctor2_id, CURRENT_DATE - INTERVAL '30 days', CURRENT_DATE + INTERVAL '30 days', '08:00:00', '16:00:00', true, 'daily', CURRENT_DATE + INTERVAL '30 days', ARRAY['video']),
        (doctor3_id, CURRENT_DATE - INTERVAL '30 days', CURRENT_DATE + INTERVAL '30 days', '10:00:00', '18:00:00', true, 'daily', CURRENT_DATE + INTERVAL '30 days', ARRAY['home', 'online']);

    -- Insert doctor notes
    INSERT INTO public.doctor_notes (patient_id, doctor_id, appointment_id, note)
    VALUES 
        (patient1_id, doctor1_id, appt1_id, 'Patient seems to be in good health. Prescribed medication for pain relief.'),
        (patient3_id, doctor3_id, appt3_id, 'Patient reports chest pain and shortness of breath. Conducted ECG and blood tests. Prescribed medication.');

    -- Insert medical histories
    INSERT INTO public.medical_histories (patient_id, doctor_id, appointment_id, condition, diagnosis_date, notes)
    VALUES 
        (patient1_id, doctor1_id, appt1_id, 'Migraine', CURRENT_DATE - INTERVAL '1 year', 'Patient has a history of migraines, managed with medication.'),
        (patient3_id, doctor3_id, appt3_id, 'Hypertension', CURRENT_DATE - INTERVAL '2 years', 'Patient diagnosed with hypertension, on regular medication.');


    
END;
$$;

-- Execute the seeding procedure
CALL public.seed_database();