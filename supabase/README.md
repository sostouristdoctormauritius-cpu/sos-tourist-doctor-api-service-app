# SOS Tourist Doctor API - Database Schema

This directory contains the database schema and seeding scripts for the SOS Tourist Doctor API.

## Files

1. `unified_schema.sql` - The complete and consistent schema for the application
2. `seed_unified.sql` - The seeding procedure for populating the database with sample data

## Schema Overview

The database schema includes the following tables:

1. **users** - User profiles and account information
2. **user_profiles** - Extended user profile information
3. **doctor_profiles** - Doctor-specific profile information
4. **app_configs** - Application configuration settings
5. **appointments** - Patient appointment bookings
6. **availabilities** - Doctor availability schedules
7. **doctor_notes** - Doctor notes for patient appointments
8. **invoices** - Appointment invoices
9. **prescriptions** - Prescription information for patient appointments
10. **medications** - Detailed medication information
11. **medical_histories** - Patient medical history records
12. **tokens** - Authentication tokens
13. **audit_logs** - Audit trail for database changes

## How to Apply the Schema

To apply the schema to your Supabase instance:

1. Connect to your Supabase database using psql or the Supabase SQL editor
2. Run the `unified_schema.sql` file to create all tables, types, indexes, and policies
3. Optionally, run the `seed_unified.sql` file to populate the database with sample data

## Key Features

- **Row Level Security (RLS)** - All tables have RLS policies configured to ensure data privacy
- **Audit Logging** - All changes to tables are automatically logged in the `audit_logs` table
- **ENUM Types** - Custom ENUM types are used for status fields and other categorical data
- **Foreign Key Constraints** - Proper relationships between tables with cascading deletes where appropriate
- **Indexes** - Strategic indexes for improved query performance
- **Comments** - Comprehensive comments on all tables and columns for documentation

## Notes

- The schema uses UUIDs as primary keys for all tables
- Timestamps are stored with timezone information
- JSONB is used for flexible data storage where needed
- The schema is designed to work with the Supabase platform and its authentication system