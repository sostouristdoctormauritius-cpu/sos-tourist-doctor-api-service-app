-- Add timezone column to appointments table
ALTER TABLE public.appointments 
ADD COLUMN timezone TEXT;

COMMENT ON COLUMN public.appointments.timezone IS 'Timezone of the appointment';