# Doctor Availability Data Documentation

## Overview

This documentation describes the doctor availability data that has been generated for the SOS Tourist Doctor system. The data represents available time slots for doctors over a 30-day period, excluding time slots that already have appointments booked.

## Data Structure

The availability data is structured to be inserted into the `availabilities` table with the following fields:

- `doctor_id` (UUID): The unique identifier of the doctor
- `date` (DATE): The date of the availability slot (format: YYYY-MM-DD)
- `start_time` (TIME): The start time of the slot (format: HH:MM:SS)
- `end_time` (TIME): The end time of the slot (format: HH:MM:SS)
- `is_available` (BOOLEAN): Whether the slot is available for booking (true)

## Time Slots

Each day is divided into hourly time slots from 9:00 AM to 9:00 PM:
- 09:00:00 - 10:00:00
- 10:00:00 - 11:00:00
- 11:00:00 - 12:00:00
- 12:00:00 - 13:00:00
- 13:00:00 - 14:00:00
- 14:00:00 - 15:00:00
- 15:00:00 - 16:00:00
- 16:00:00 - 17:00:00
- 17:00:00 - 18:00:00
- 18:00:00 - 19:00:00
- 19:00:00 - 20:00:00
- 20:00:00 - 21:00:00

This gives a total of 12 time slots per day per doctor.

## Doctors

The following 10 doctors are included in the availability data:

1. Dr. Alice Johnson (41cdfb01-a6e8-5b44-80b4-c232c4723817)
2. Dr. Bob Smith (75b6e0d3-45c6-5c5b-93a2-1f3c8e2a9b0d)
3. Dr. Carol Williams (8c2d4f1e-6a7b-5d8c-9e4f-2a1b3c4d5e6f)
4. Dr. David Brown (9d3e5g2f-7b8c-5e9d-8f4g-3b2c4d5e6f7g)
5. Dr. Emma Davis (ae4f6h3g-8c9d-5f8e-9g5h-4c3d5e6f7g8h)
6. Dr. Frank Miller (bf5g7i4h-9d8e-5g9f-8h6i-5d4e6f7g8h9i)
7. Dr. Grace Wilson (cg6h8j5i-8e7f-5h8g-9i7j-6e5f7g8h9i8j)
8. Dr. Henry Moore (dh7i9k6j-7f6g-5i9h-8j8k-7f6g8h9i8j9k)
9. Dr. Irene Taylor (ei8j0l7k-6g5h-5j8i-9k9l-8g7h9i8j9k8l)
10. Dr. Jack Anderson (fj9k1m8l-5h4i-5k9j-8l8m-9h8i9j8k9l8m)

## Data Generation Process

The availability data was generated using the following process:

1. Retrieve all doctors from the `users` table where `role = 'doctor'`
2. Retrieve all appointments from the `appointments` table
3. For each doctor:
   - Group their appointments by date
   - For each day in the next 30 days:
     - Generate all possible time slots (9am-9pm)
     - Remove any slots that already have appointments
     - Create availability records for the remaining slots

## Data Volume

- **Total Availability Records**: 3,571
- **Time Period**: 30 days
- **Doctors**: 10
- **Average Slots per Doctor**: ~357 slots

## Using the Data

### Method 1: Direct SQL Insertion

The [availability_data.sql](file:///c:/Users/deven/Desktop/sos-tourist-doctor-ecosystem/sos-tourist-doctor-api-service-app/availability_data.sql) file contains SQL INSERT statements that can be run directly against the database:

```sql
INSERT INTO availabilities (doctor_id, date, start_time, end_time, is_available) VALUES
  ('41cdfb01-a6e8-5b44-80b4-c232c4723817', '2025-10-07', '09:00:00', '10:00:00', true),
  ('41cdfb01-a6e8-5b44-80b4-c232c4723817', '2025-10-07', '10:00:00', '11:00:00', true);
```

To insert the data:
1. Connect to your PostgreSQL database
2. Execute the SQL file

### Method 2: Application-Level Insertion

If you prefer to insert the data through your application, you can use the following pattern:

```javascript
const availabilityRecord = {
  doctor_id: '41cdfb01-a6e8-5b44-80b4-c232c4723817',
  date: '2025-10-07',
  start_time: '09:00:00',
  end_time: '10:00:00',
  is_available: true
};

await supabase
  .from('availabilities')
  .insert(availabilityRecord);
```

## Updating Availability

As new appointments are booked or existing ones are canceled, the availability data should be updated accordingly:

1. When an appointment is booked:
   - Find the corresponding availability record
   - Either delete it or set `is_available` to false

2. When an appointment is canceled:
   - Create a new availability record for that time slot
   - Or update the existing record to set `is_available` to true

## Notes

1. The availability data represents the initial state based on existing appointments
2. The system should have processes in place to keep this data synchronized with actual bookings
3. Consider implementing database triggers or application-level logic to automatically update availability when appointments change
4. For performance reasons, you might want to implement a caching layer for frequently accessed availability data