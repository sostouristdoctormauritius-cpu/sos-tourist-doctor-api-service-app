# Availability Table Troubleshooting Guide

## Issue Summary

We are unable to insert data into the `availabilities` table due to a schema cache issue with Supabase. The error message is:

```
Could not find the 'date' column of 'availabilities' in the schema cache
```

This error occurs even though we've confirmed that:
1. The [availabilities](file:///c:/Users/deven/Desktop/sos-tourist-doctor-ecosystem/sos-tourist-doctor-api-service-app/src/types/database.types.ts#L53-L53) table exists
2. The table is accessible (we can select from it)
3. The table is currently empty

## Root Cause

This is a known issue with Supabase where the local schema cache is out of sync with the actual database schema. The Supabase client maintains a cache of the database schema to improve performance, but this cache sometimes doesn't get updated when the database schema changes.

## Solutions

### Solution 1: Refresh Supabase Schema Cache (Recommended)

1. Go to your Supabase Dashboard
2. Navigate to **Settings** → **API**
3. Under **Schema Cache**, click **Regenerate**
4. Wait 5-10 minutes for the cache to refresh
5. Try your insert operation again

This is the most straightforward solution and resolves the issue in most cases.

### Solution 2: Use Supabase CLI to Refresh Types

If you have the Supabase CLI installed:

```bash
# Navigate to your project directory
cd /path/to/your/project

# Regenerate the TypeScript types
supabase gen types typescript --project-id your-project-id > src/types/database.types.ts
```

This will refresh the local type definitions which may help resolve the cache issue.

### Solution 3: Clear Local Development Cache

If you're working in a local development environment:

1. Stop your development server
2. Clear the Node.js module cache:
   ```bash
   rm -rf node_modules/.cache
   ```
3. Restart your development server

### Solution 4: Use Direct Database Connection

If the above solutions don't work, you can bypass the Supabase client entirely and connect directly to the PostgreSQL database:

```javascript
const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://[user]:[password]@db.[project-ref].supabase.co:5432/postgres'
});

await client.connect();

const query = `
  INSERT INTO availabilities (doctor_id, date, start_time, end_time, is_available)
  VALUES ($1, $2, $3, $4, $5)
`;

const values = [
  '41cdfb01-a6e8-5b44-80b4-c232c4723817',
  '2025-10-08',
  '09:00:00',
  '10:00:00',
  true
];

await client.query(query, values);
```

### Solution 5: Use Supabase SQL Editor

1. Go to your Supabase Dashboard
2. Navigate to **SQL Editor**
3. Run your INSERT statements directly in the editor:

```sql
INSERT INTO availabilities (doctor_id, date, start_time, end_time, is_available)
VALUES ('41cdfb01-a6e8-5b44-80b4-c232c4723817', '2025-10-08', '09:00:00', '10:00:00', true);
```

## Prepared SQL Statements for Availability Data

We have generated the complete set of availability data that should be inserted into the table. You can find the SQL file at [availability_data.sql](file:///c:/Users/deven/Desktop/sos-tourist-doctor-ecosystem/sos-tourist-doctor-api-service-app/availability_data.sql).

To use this file:

1. Download the file
2. Open it in a text editor
3. Execute it using one of the methods above

## Verification Steps

After inserting the data, you can verify the insertion was successful:

```javascript
// Check if data was inserted
const { data, error } = await supabase
  .from('availabilities')
  .select('*')
  .limit(5);

if (error) {
  console.log('Error:', error.message);
} else {
  console.log('Success! Found', data.length, 'records');
  console.log('Sample data:', data);
}
```

## Prevention

To prevent this issue in the future:

1. Always refresh the schema cache after making database schema changes
2. Consider implementing a retry mechanism in your code for schema-related errors
3. Keep your Supabase client library updated to the latest version

## Contact Support

If none of the above solutions work:

1. Go to the [Supabase Discord](https://discord.supabase.com/) or [Support Portal](https://app.supabase.com/support/new)
2. Provide the exact error message
3. Include information about when the table schema was last modified
4. Mention that you've already tried refreshing the schema cache

## Next Steps

1. Try Solution 1 (refreshing the schema cache) first
2. If that doesn't work, try Solution 4 or 5 (direct SQL execution)
3. Once the data is inserted, verify the insertion was successful
4. Document the solution that worked for future reference