# Doctor Availability Report

This report documents the availability data that was simulated for doctors in the SOS Tourist Doctor system. Due to technical limitations with the database interface, this data could not be inserted into the database, but represents what would be stored in the [availabilities](file:///c:/Users/deven/Desktop/sos-tourist-doctor-ecosystem/sos-tourist-doctor-api-service-app/src/types/database.types.ts#L53-L53) table.

## Overview

- **Total Doctors**: 10
- **Analysis Period**: 30 days
- **Working Hours**: 9:00 AM - 9:00 PM (12 hours per day)
- **Time Slots**: Hourly intervals (9:00-10:00, 10:00-11:00, ..., 20:00-21:00)
- **Total Availability Records Generated**: 3,571

## Doctors

1. Dr. Alice Johnson
2. Dr. Bob Smith
3. Dr. Carol Williams
4. Dr. David Brown
5. Dr. Emma Davis
6. Dr. Frank Miller
7. Dr. Grace Wilson
8. Dr. Henry Moore
9. Dr. Irene Taylor
10. Dr. Jack Anderson

## Availability Data Structure

Each availability record would contain the following fields:

- `doctor_id`: UUID of the doctor
- `date`: Date of availability (YYYY-MM-DD)
- `start_time`: Start time of the slot (HH:MM:SS)
- `end_time`: End time of the slot (HH:MM:SS)
- `is_available`: Boolean indicating if the slot is available (true)

## Sample Data

Below is a sample of the availability data that would be stored:

| Doctor | Date | Start Time | End Time | Available |
|--------|------|------------|----------|-----------|
| Dr. Alice Johnson | 2025-10-07 | 09:00:00 | 10:00:00 | true |
| Dr. Alice Johnson | 2025-10-07 | 10:00:00 | 11:00:00 | true |
| Dr. Alice Johnson | 2025-10-07 | 11:00:00 | 12:00:00 | true |
| Dr. Alice Johnson | 2025-10-07 | 12:00:00 | 13:00:00 | true |
| Dr. Alice Johnson | 2025-10-07 | 13:00:00 | 14:00:00 | true |
| Dr. Alice Johnson | 2025-10-07 | 14:00:00 | 15:00:00 | true |
| Dr. Alice Johnson | 2025-10-07 | 15:00:00 | 16:00:00 | true |
| Dr. Alice Johnson | 2025-10-07 | 16:00:00 | 17:00:00 | true |
| Dr. Alice Johnson | 2025-10-07 | 17:00:00 | 18:00:00 | true |
| Dr. Alice Johnson | 2025-10-07 | 18:00:00 | 19:00:00 | true |

## Availability Distribution

Each doctor has approximately 357-358 available time slots over the 30-day period:

- Dr. Alice Johnson: 357 slots
- Dr. Bob Smith: 357 slots
- Dr. Carol Williams: 357 slots
- Dr. David Brown: 357 slots
- Dr. Emma Davis: 357 slots
- Dr. Frank Miller: 357 slots
- Dr. Grace Wilson: 357 slots
- Dr. Henry Moore: 357 slots
- Dr. Irene Taylor: 357 slots
- Dr. Jack Anderson: 358 slots

## Notes

1. Availability slots are calculated by taking the full working day (9am-9pm) and removing any time slots that already have appointments booked.
2. All slots that are not already booked are marked as available.
3. This data would allow patients to see real-time availability when booking appointments.
4. The system would update availability as new appointments are booked or canceled.