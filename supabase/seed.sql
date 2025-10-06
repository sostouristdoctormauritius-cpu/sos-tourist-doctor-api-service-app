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

CREATE TABLE public.tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    token TEXT NOT NULL,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    type token_type_enum NOT NULL,
    expires TIMESTAMP WITH TIME ZONE NOT NULL,
    blacklisted BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_phone ON public.users(phone);
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);
CREATE INDEX IF NOT EXISTS idx_users_is_status ON public.users(is_status);
CREATE INDEX IF NOT EXISTS idx_users_is_archived ON public.users(is_archived);
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON public.user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_language ON public.user_profiles(language);
CREATE INDEX IF NOT EXISTS idx_doctor_profiles_user_id ON public.doctor_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_doctor_profiles_specialisation ON public.doctor_profiles(specialisation);
CREATE INDEX IF NOT EXISTS idx_doctor_profiles_rating ON public.doctor_profiles(rating);
CREATE INDEX IF NOT EXISTS idx_doctor_profiles_is_listed ON public.doctor_profiles(is_listed);
CREATE INDEX IF NOT EXISTS idx_app_configs_key ON public.app_configs(key);
CREATE INDEX IF NOT EXISTS idx_app_configs_creator ON public.app_configs(creator);
CREATE INDEX IF NOT EXISTS idx_appointments_user_id ON public.appointments(user_id);
CREATE INDEX IF NOT EXISTS idx_appointments_doctor_id ON public.appointments(doctor_id);
CREATE INDEX IF NOT EXISTS idx_appointments_date ON public.appointments(date);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON public.appointments(status);
CREATE INDEX IF NOT EXISTS idx_appointments_consultation_type ON public.appointments(consultation_type);
CREATE INDEX IF NOT EXISTS idx_availabilities_user_id ON public.availabilities(user_id);
CREATE INDEX IF NOT EXISTS idx_availabilities_start_date ON public.availabilities(start_date);
CREATE INDEX IF NOT EXISTS idx_availabilities_end_date ON public.availabilities(end_date);
CREATE INDEX IF NOT EXISTS idx_availabilities_is_recurring ON public.availabilities(is_recurring);
CREATE INDEX IF NOT EXISTS idx_doctor_notes_patient_id ON public.doctor_notes(patient_id);
CREATE INDEX IF NOT EXISTS idx_doctor_notes_doctor_id ON public.doctor_notes(doctor_id);
CREATE INDEX IF NOT EXISTS idx_doctor_notes_appointment_id ON public.doctor_notes(appointment_id);
CREATE INDEX IF NOT EXISTS idx_invoices_appointment_id ON public.invoices(appointment_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON public.invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoices_mips_id_order ON public.invoices (mips_id_order);
CREATE INDEX IF NOT EXISTS idx_prescriptions_patient_id ON public.prescriptions(patient_id);
CREATE INDEX IF NOT EXISTS idx_prescriptions_doctor_id ON public.prescriptions(doctor_id);
CREATE INDEX IF NOT EXISTS idx_prescriptions_appointment_id ON public.prescriptions(appointment_id);
CREATE INDEX IF NOT EXISTS idx_medications_prescription_id ON public.medications(prescription_id);
CREATE INDEX IF NOT EXISTS idx_tokens_user_id ON public.tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_tokens_token ON public.tokens(token);
CREATE INDEX IF NOT EXISTS idx_tokens_type ON public.tokens(type);
CREATE INDEX IF NOT EXISTS idx_medical_histories_patient_id ON public.medical_histories(patient_id);
CREATE INDEX IF NOT EXISTS idx_medical_histories_doctor_id ON public.medical_histories(doctor_id);
CREATE INDEX IF NOT EXISTS idx_medical_histories_appointment_id ON public.medical_histories(appointment_id);

-- Enable Row Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.doctor_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.availabilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.doctor_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medical_histories ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies
-- Users table policies
CREATE POLICY "Users can view their own profile" ON public.users FOR SELECT USING (id = auth.uid());
CREATE POLICY "Users can update their own profile" ON public.users FOR UPDATE USING (id = auth.uid());
CREATE POLICY "Admins can view all users" ON public.users FOR SELECT USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "Admins can update any user" ON public.users FOR UPDATE USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "Admins can insert users" ON public.users FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "System can delete users" ON public.users FOR DELETE USING (false);

-- User profiles table policies
CREATE POLICY "Users can view their own profile" ON public.user_profiles FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can update their own profile" ON public.user_profiles FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Admins can view all user profiles" ON public.user_profiles FOR SELECT USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "Admins can update any user profile" ON public.user_profiles FOR UPDATE USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "System can delete user profiles" ON public.user_profiles FOR DELETE USING (false);

-- Doctor profiles table policies
CREATE POLICY "Doctors and patients can view doctor profiles" ON public.doctor_profiles FOR SELECT USING (
    user_id = auth.uid() OR 
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid())
);
CREATE POLICY "Doctors can update their own profile" ON public.doctor_profiles FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "System can delete doctor profiles" ON public.doctor_profiles FOR DELETE USING (false);

-- App configs table policies
CREATE POLICY "Admins can view app configs" ON public.app_configs FOR SELECT USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "Admins can create app configs" ON public.app_configs FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "Admins can update app configs" ON public.app_configs FOR UPDATE USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "System can delete app configs" ON public.app_configs FOR DELETE USING (false);

-- Appointments table policies
CREATE POLICY "Users can view their own appointments" ON public.appointments FOR SELECT USING (user_id = auth.uid() OR doctor_id = auth.uid());
CREATE POLICY "Users can create their own appointments" ON public.appointments FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update their own appointments" ON public.appointments FOR UPDATE USING (user_id = auth.uid() OR doctor_id = auth.uid());
CREATE POLICY "System can delete appointments" ON public.appointments FOR DELETE USING (false);

-- Availabilities table policies
CREATE POLICY "Users can view availabilities" ON public.availabilities FOR SELECT USING (true);
CREATE POLICY "Users can create their own availabilities" ON public.availabilities FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update their own availabilities" ON public.availabilities FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Users can delete their own availabilities" ON public.availabilities FOR DELETE USING (user_id = auth.uid());

-- Doctor notes table policies
CREATE POLICY "Doctors and patients can view notes" ON public.doctor_notes FOR SELECT USING (patient_id = auth.uid() OR doctor_id = auth.uid());
CREATE POLICY "Doctors can create notes for their appointments" ON public.doctor_notes FOR INSERT WITH CHECK (doctor_id = auth.uid());
CREATE POLICY "Doctors can update their own notes" ON public.doctor_notes FOR UPDATE USING (doctor_id = auth.uid());
CREATE POLICY "Doctors can delete their own notes" ON public.doctor_notes FOR DELETE USING (doctor_id = auth.uid());

-- Invoices table policies
CREATE POLICY "Users can view their own invoices" ON public.invoices FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.appointments 
        WHERE appointments.id = invoices.appointment_id 
        AND (appointments.user_id = auth.uid() OR appointments.doctor_id = auth.uid())
    )
);
CREATE POLICY "System can create invoices" ON public.invoices FOR INSERT WITH CHECK (true);
CREATE POLICY "System can update invoices" ON public.invoices FOR UPDATE USING (true);
CREATE POLICY "System can delete invoices" ON public.invoices FOR DELETE USING (false);

-- Prescriptions table policies
CREATE POLICY "Doctors and patients can view prescriptions" ON public.prescriptions FOR SELECT USING (patient_id = auth.uid() OR doctor_id = auth.uid());
CREATE POLICY "Doctors can create prescriptions for their appointments" ON public.prescriptions FOR INSERT WITH CHECK (doctor_id = auth.uid());
CREATE POLICY "Doctors can update their own prescriptions" ON public.prescriptions FOR UPDATE USING (doctor_id = auth.uid());
CREATE POLICY "Doctors can delete their own prescriptions" ON public.prescriptions FOR DELETE USING (doctor_id = auth.uid());

-- Medications table policies
CREATE POLICY "Doctors and patients can view medications" ON public.medications FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.prescriptions WHERE id = prescription_id AND (patient_id = auth.uid() OR doctor_id = auth.uid()))
);
CREATE POLICY "System can manage medications" ON public.medications FOR ALL USING (true) WITH CHECK (true);

-- Tokens table policies
CREATE POLICY "Users can view their own tokens" ON public.tokens FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "System can manage tokens" ON public.tokens FOR ALL USING (true) WITH CHECK (true);

-- Medical histories table policies
CREATE POLICY "Patients and their doctors can view medical histories" ON public.medical_histories FOR SELECT USING (
    patient_id = auth.uid() OR 
    doctor_id = auth.uid() OR
    EXISTS (
        SELECT 1 FROM public.appointments 
        WHERE appointments.id = medical_histories.appointment_id 
        AND (appointments.user_id = auth.uid() OR appointments.doctor_id = auth.uid())
    )
);
CREATE POLICY "Doctors can create medical histories for their patients" ON public.medical_histories FOR INSERT WITH CHECK (doctor_id = auth.uid());
CREATE POLICY "Doctors can update medical histories they created" ON public.medical_histories FOR UPDATE USING (doctor_id = auth.uid());
CREATE POLICY "System can delete medical histories" ON public.medical_histories FOR DELETE USING (false);

-- Create Audit Logging Function
CREATE OR REPLACE FUNCTION public.log_changes()
RETURNS TRIGGER AS $$
DECLARE
    user_id TEXT;
BEGIN
    -- Get the user ID from the JWT claims
    user_id := current_setting('request.jwt.claim.sub', true);
    
    -- If we can't get the user ID, use the current user
    IF user_id IS NULL THEN
        user_id := current_user;
    END IF;
    
    -- Insert the audit log entry
    INSERT INTO public.audit_logs (table_name, operation, record_id, old_values, new_values, changed_by)
    VALUES (
        TG_TABLE_NAME,
        TG_OP,
        COALESCE(NEW.id, OLD.id),
        CASE WHEN TG_OP IN ('UPDATE', 'DELETE') THEN row_to_json(OLD)::TEXT ELSE NULL END,
        CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN row_to_json(NEW)::TEXT ELSE NULL END,
        user_id
    );
    
    -- Return the appropriate record
    IF TG_OP = 'DELETE' THEN
        RETURN OLD;
    ELSE
        RETURN NEW;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create Audit Logs Table
CREATE TABLE public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    table_name TEXT NOT NULL,
    operation TEXT NOT NULL,
    record_id UUID,
    old_values JSONB,
    new_values JSONB,
    changed_by TEXT,
    changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create audit triggers for all tables
CREATE TRIGGER users_audit_trigger AFTER INSERT OR UPDATE OR DELETE ON public.users FOR EACH ROW EXECUTE FUNCTION public.log_changes();
CREATE TRIGGER user_profiles_audit_trigger AFTER INSERT OR UPDATE OR DELETE ON public.user_profiles FOR EACH ROW EXECUTE FUNCTION public.log_changes();
CREATE TRIGGER doctor_profiles_audit_trigger AFTER INSERT OR UPDATE OR DELETE ON public.doctor_profiles FOR EACH ROW EXECUTE FUNCTION public.log_changes();
CREATE TRIGGER app_configs_audit_trigger AFTER INSERT OR UPDATE OR DELETE ON public.app_configs FOR EACH ROW EXECUTE FUNCTION public.log_changes();
CREATE TRIGGER appointments_audit_trigger AFTER INSERT OR UPDATE OR DELETE ON public.appointments FOR EACH ROW EXECUTE FUNCTION public.log_changes();
CREATE TRIGGER availabilities_audit_trigger AFTER INSERT OR UPDATE OR DELETE ON public.availabilities FOR EACH ROW EXECUTE FUNCTION public.log_changes();
CREATE TRIGGER doctor_notes_audit_trigger AFTER INSERT OR UPDATE OR DELETE ON public.doctor_notes FOR EACH ROW EXECUTE FUNCTION public.log_changes();
CREATE TRIGGER invoices_audit_trigger AFTER INSERT OR UPDATE OR DELETE ON public.invoices FOR EACH ROW EXECUTE FUNCTION public.log_changes();
CREATE TRIGGER prescriptions_audit_trigger AFTER INSERT OR UPDATE OR DELETE ON public.prescriptions FOR EACH ROW EXECUTE FUNCTION public.log_changes();
CREATE TRIGGER medications_audit_trigger AFTER INSERT OR UPDATE OR DELETE ON public.medications FOR EACH ROW EXECUTE FUNCTION public.log_changes();
CREATE TRIGGER tokens_audit_trigger AFTER INSERT OR UPDATE OR DELETE ON public.tokens FOR EACH ROW EXECUTE FUNCTION public.log_changes();
CREATE TRIGGER medical_histories_audit_trigger AFTER INSERT OR UPDATE OR DELETE ON public.medical_histories FOR EACH ROW EXECUTE FUNCTION public.log_changes();

-- Comments
COMMENT ON TABLE public.users IS 'User profiles and account information';
COMMENT ON COLUMN public.users.id IS 'Unique identifier for the user';
COMMENT ON COLUMN public.users.name IS 'User''s full name';
COMMENT ON COLUMN public.users.email IS 'User''s email address (unique)';
COMMENT ON COLUMN public.users.phone IS 'User''s phone number (unique)';
COMMENT ON COLUMN public.users.role IS 'User role (user, doctor, admin)';
COMMENT ON COLUMN public.users.is_email_verified IS 'Whether the user''s email has been verified';
COMMENT ON COLUMN public.users.profile_picture IS 'URL to the user''s profile picture';
COMMENT ON COLUMN public.users.is_status IS 'Current status of the user account';
COMMENT ON COLUMN public.users.stream_user_id IS 'User ID in the Stream chat system';
COMMENT ON COLUMN public.users.is_archived IS 'Whether the user account is archived';
COMMENT ON COLUMN public.users.archived_at IS 'Timestamp when the user account was archived';
COMMENT ON COLUMN public.users.invitation_token IS 'Token for user invitation';
COMMENT ON COLUMN public.users.invitation_expires IS 'Expiration timestamp for the invitation token';
COMMENT ON COLUMN public.users.is_invitation IS 'Whether the user was invited';
COMMENT ON COLUMN public.users.deletion_request_token IS 'Token for account deletion request';
COMMENT ON COLUMN public.users.deletion_request_expires IS 'Expiration timestamp for the deletion request token';
COMMENT ON COLUMN public.users.created_at IS 'Timestamp when the user account was created';
COMMENT ON COLUMN public.users.updated_at IS 'Timestamp when the user account was last updated';

COMMENT ON TABLE public.user_profiles IS 'Extended user profile information';
COMMENT ON COLUMN public.user_profiles.user_id IS 'Reference to the user';
COMMENT ON COLUMN public.user_profiles.language IS 'Preferred language of the user';
COMMENT ON COLUMN public.user_profiles.nickname IS 'User''s preferred nickname';
COMMENT ON COLUMN public.user_profiles.dob IS 'User''s date of birth';
COMMENT ON COLUMN public.user_profiles.gender IS 'User''s gender';
COMMENT ON COLUMN public.user_profiles.phone_number IS 'User''s phone number';
COMMENT ON COLUMN public.user_profiles.nationality IS 'User''s nationality';

COMMENT ON TABLE public.doctor_profiles IS 'Doctor-specific profile information';
COMMENT ON COLUMN public.doctor_profiles.user_id IS 'Reference to the user (doctor)';
COMMENT ON COLUMN public.doctor_profiles.specialisation IS 'Doctor''s medical specialisation';
COMMENT ON COLUMN public.doctor_profiles.rating IS 'Doctor''s average rating';
COMMENT ON COLUMN public.doctor_profiles.rating_count IS 'Number of ratings received by the doctor';
COMMENT ON COLUMN public.doctor_profiles.address IS 'Doctor''s practice address';
COMMENT ON COLUMN public.doctor_profiles.working_hours IS 'Doctor''s working hours';
COMMENT ON COLUMN public.doctor_profiles.bio IS 'Doctor''s biography';
COMMENT ON COLUMN public.doctor_profiles.is_listed IS 'Whether the doctor is listed in the directory';
COMMENT ON COLUMN public.doctor_profiles.supported_languages IS 'Languages supported by the doctor';

COMMENT ON TABLE public.app_configs IS 'Application configuration settings';
COMMENT ON COLUMN public.app_configs.id IS 'Unique identifier for the config';
COMMENT ON COLUMN public.app_configs.key IS 'Unique key for the configuration';
COMMENT ON COLUMN public.app_configs.description IS 'Description of the configuration';
COMMENT ON COLUMN public.app_configs.configs IS 'JSONB object containing configuration values';
COMMENT ON COLUMN public.app_configs.creator IS 'User who created the configuration';
COMMENT ON COLUMN public.app_configs.created_at IS 'Timestamp when the config was created';
COMMENT ON COLUMN public.app_configs.updated_at IS 'Timestamp when the config was last updated';

COMMENT ON TABLE public.appointments IS 'Patient appointment bookings';
COMMENT ON COLUMN public.appointments.id IS 'Unique identifier for the appointment';
COMMENT ON COLUMN public.appointments.user_id IS 'Reference to the patient user';
COMMENT ON COLUMN public.appointments.doctor_id IS 'Reference to the doctor user';
COMMENT ON COLUMN public.appointments.date IS 'Date of the appointment';
COMMENT ON COLUMN public.appointments.start_time IS 'Start time of the appointment';
COMMENT ON COLUMN public.appointments.end_time IS 'End time of the appointment';
COMMENT ON COLUMN public.appointments.status IS 'Current status of the appointment';
COMMENT ON COLUMN public.appointments.stream_channel_id IS 'Stream channel ID for the appointment';
COMMENT ON COLUMN public.appointments.consultation_type IS 'Type of consultation (home, online, chat, video)';
COMMENT ON COLUMN public.appointments.symptoms IS 'Array of symptoms reported by the patient';
COMMENT ON COLUMN public.appointments.additional_note IS 'Additional notes for the appointment';
COMMENT ON COLUMN public.appointments.visit_location IS 'Location information for home visits';
COMMENT ON COLUMN public.appointments.created_at IS 'Timestamp when the appointment was created';
COMMENT ON COLUMN public.appointments.updated_at IS 'Timestamp when the appointment was last updated';

COMMENT ON TABLE public.availabilities IS 'Doctor availability schedules';
COMMENT ON COLUMN public.availabilities.id IS 'Unique identifier for the availability slot';
COMMENT ON COLUMN public.availabilities.user_id IS 'Reference to the doctor user';
COMMENT ON COLUMN public.availabilities.start_date IS 'Start date of the availability';
COMMENT ON COLUMN public.availabilities.end_date IS 'End date of the availability';
COMMENT ON COLUMN public.availabilities.start_time IS 'Start time of the availability';
COMMENT ON COLUMN public.availabilities.end_time IS 'End time of the availability';
COMMENT ON COLUMN public.availabilities.is_recurring IS 'Whether the availability is recurring';
COMMENT ON COLUMN public.availabilities.recurrence IS 'Recurrence pattern (daily, weekly, monthly)';
COMMENT ON COLUMN public.availabilities.recurrence_end_date IS 'End date for recurring availability';
COMMENT ON COLUMN public.availabilities.consultation_types IS 'Types of consultations offered during this availability';
COMMENT ON COLUMN public.availabilities.created_at IS 'Timestamp when the availability was created';
COMMENT ON COLUMN public.availabilities.updated_at IS 'Timestamp when the availability was last updated';

COMMENT ON TABLE public.doctor_notes IS 'Doctor notes for patient appointments';
COMMENT ON COLUMN public.doctor_notes.id IS 'Unique identifier for the note';
COMMENT ON COLUMN public.doctor_notes.patient_id IS 'Reference to the patient user';
COMMENT ON COLUMN public.doctor_notes.doctor_id IS 'Reference to the doctor user';
COMMENT ON COLUMN public.doctor_notes.appointment_id IS 'Reference to the appointment';
COMMENT ON COLUMN public.doctor_notes.note IS 'The note content';
COMMENT ON COLUMN public.doctor_notes.created_at IS 'Timestamp when the note was created';
COMMENT ON COLUMN public.doctor_notes.updated_at IS 'Timestamp when the note was last updated';

COMMENT ON TABLE public.invoices IS 'Appointment invoices';
COMMENT ON COLUMN public.invoices.id IS 'Unique identifier for the invoice';
COMMENT ON COLUMN public.invoices.appointment_id IS 'Reference to the appointment';
COMMENT ON COLUMN public.invoices.status IS 'Current status of the invoice';
COMMENT ON COLUMN public.invoices.mips_id_order IS 'Order ID in the MIPS payment system';
COMMENT ON COLUMN public.invoices.payment_link IS 'Payment link for the invoice';
COMMENT ON COLUMN public.invoices.amount IS 'Invoice amount';
COMMENT ON COLUMN public.invoices.currency IS 'Currency code (default: MUR)';
COMMENT ON COLUMN public.invoices.details IS 'Additional details about the invoice';
COMMENT ON COLUMN public.invoices.created_at IS 'Timestamp when the invoice was created';
COMMENT ON COLUMN public.invoices.updated_at IS 'Timestamp when the invoice was last updated';

COMMENT ON TABLE public.prescriptions IS 'Prescription information for patient appointments';
COMMENT ON COLUMN public.prescriptions.id IS 'Unique identifier for the prescription';
COMMENT ON COLUMN public.prescriptions.patient_id IS 'Reference to the patient user';
COMMENT ON COLUMN public.prescriptions.doctor_id IS 'Reference to the doctor user';
COMMENT ON COLUMN public.prescriptions.appointment_id IS 'Reference to the appointment';
COMMENT ON COLUMN public.prescriptions.medications IS 'JSONB array of medications with name, dosage, duration, strength and ideal times';
COMMENT ON COLUMN public.prescriptions.created_at IS 'Timestamp when the prescription was created';
COMMENT ON COLUMN public.prescriptions.updated_at IS 'Timestamp when the prescription was last updated';

COMMENT ON TABLE public.medications IS 'Detailed medication information';
COMMENT ON COLUMN public.medications.id IS 'Unique identifier for the medication';
COMMENT ON COLUMN public.medications.prescription_id IS 'Reference to the prescription';
COMMENT ON COLUMN public.medications.name IS 'Name of the medication';
COMMENT ON COLUMN public.medications.dosage IS 'Dosage of the medication';
COMMENT ON COLUMN public.medications.duration IS 'Duration of the medication treatment';
COMMENT ON COLUMN public.medications.strength IS 'Strength of the medication';
COMMENT ON COLUMN public.medications.ideal_times IS 'Ideal times to take the medication';

COMMENT ON TABLE public.medical_histories IS 'Patient medical history records';
COMMENT ON COLUMN public.medical_histories.id IS 'Unique identifier for the medical history record';
COMMENT ON COLUMN public.medical_histories.patient_id IS 'Reference to the patient user';
COMMENT ON COLUMN public.medical_histories.doctor_id IS 'Reference to the doctor user';
COMMENT ON COLUMN public.medical_histories.appointment_id IS 'Reference to the appointment';
COMMENT ON COLUMN public.medical_histories.condition IS 'Medical condition description';
COMMENT ON COLUMN public.medical_histories.diagnosis_date IS 'Date when the condition was diagnosed';
COMMENT ON COLUMN public.medical_histories.notes IS 'Additional notes about the condition';
COMMENT ON COLUMN public.medical_histories.created_at IS 'Timestamp when the record was created';
COMMENT ON COLUMN public.medical_histories.updated_at IS 'Timestamp when the record was last updated';

COMMENT ON TABLE public.tokens IS 'Authentication tokens';
COMMENT ON COLUMN public.tokens.id IS 'Unique identifier for the token';
COMMENT ON COLUMN public.tokens.token IS 'The token value';
COMMENT ON COLUMN public.tokens.user_id IS 'Reference to the user';
COMMENT ON COLUMN public.tokens.type IS 'Type of token';
COMMENT ON COLUMN public.tokens.expires IS 'Expiration timestamp for the token';
COMMENT ON COLUMN public.tokens.blacklisted IS 'Whether the token is blacklisted';
COMMENT ON COLUMN public.tokens.created_at IS 'Timestamp when the token was created';

COMMENT ON TABLE public.audit_logs IS 'Audit trail for database changes';
COMMENT ON COLUMN public.audit_logs.id IS 'Unique identifier for the audit log entry';
COMMENT ON COLUMN public.audit_logs.table_name IS 'Name of the table that was modified';
COMMENT ON COLUMN public.audit_logs.operation IS 'Type of operation (INSERT, UPDATE, DELETE)';
COMMENT ON COLUMN public.audit_logs.record_id IS 'ID of the record that was modified';
COMMENT ON COLUMN public.audit_logs.old_values IS 'JSON representation of the record before modification';
COMMENT ON COLUMN public.audit_logs.new_values IS 'JSON representation of the record after modification';
COMMENT ON COLUMN public.audit_logs.changed_by IS 'User who performed the modification';
COMMENT ON COLUMN public.audit_logs.changed_at IS 'Timestamp when the modification occurred';

-- Create seeding procedure
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

END;
$$;

-- Execute the seeding procedure
CALL public.seed_database();