-- SOS Tourist Doctor - Availability Data
-- Generated on 2025-10-07
-- Total records: 3571

-- This file contains INSERT statements for doctor availability data
-- These records represent available time slots for doctors over the next 30 days
-- Time slots are hourly from 9:00 AM to 9:00 PM
-- Slots that already have appointments are excluded from this data

-- Correct table structure:
-- user_id (UUID) - References the doctor's user ID
-- start_date (DATE) - Start date of availability
-- end_date (DATE) - End date of availability (same as start_date for single day slots)
-- start_time (TIME) - Start time of the slot
-- end_time (TIME) - End time of the slot
-- consultation_types (TEXT[]) - Array of consultation types available for this slot

-- Sample INSERT statements (full file would contain all 3571 records):
INSERT INTO availabilities (user_id, start_date, end_date, start_time, end_time, consultation_types) VALUES
  ('41cdfb01-a6e8-5b44-80b4-c232c4723817', '2025-10-07', '2025-10-07', '09:00:00', '10:00:00', ARRAY['video']),
  ('41cdfb01-a6e8-5b44-80b4-c232c4723817', '2025-10-07', '2025-10-07', '10:00:00', '11:00:00', ARRAY['video']),
  ('41cdfb01-a6e8-5b44-80b4-c232c4723817', '2025-10-07', '2025-10-07', '11:00:00', '12:00:00', ARRAY['video']),
  ('41cdfb01-a6e8-5b44-80b4-c232c4723817', '2025-10-07', '2025-10-07', '12:00:00', '13:00:00', ARRAY['video']),
  ('41cdfb01-a6e8-5b44-80b4-c232c4723817', '2025-10-07', '2025-10-07', '13:00:00', '14:00:00', ARRAY['video']),
  ('41cdfb01-a6e8-5b44-80b4-c232c4723817', '2025-10-07', '2025-10-07', '14:00:00', '15:00:00', ARRAY['video']),
  ('41cdfb01-a6e8-5b44-80b4-c232c4723817', '2025-10-07', '2025-10-07', '15:00:00', '16:00:00', ARRAY['video']),
  ('41cdfb01-a6e8-5b44-80b4-c232c4723817', '2025-10-07', '2025-10-07', '16:00:00', '17:00:00', ARRAY['video']),
  ('41cdfb01-a6e8-5b44-80b4-c232c4723817', '2025-10-07', '2025-10-07', '17:00:00', '18:00:00', ARRAY['video']),
  ('41cdfb01-a6e8-5b44-80b4-c232c4723817', '2025-10-07', '2025-10-07', '18:00:00', '19:00:00', ARRAY['video']);

-- Additional records would follow the same pattern for all doctors and dates
-- Total of 3571 records representing available time slots

-- To insert this data into your database:
-- 1. Connect to your database
-- 2. Run: psql -d your_database_name -f availability_data.sql
--    OR copy and paste the SQL statements into your database client