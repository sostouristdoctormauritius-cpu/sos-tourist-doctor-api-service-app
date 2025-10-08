# Final Invoice Status Distribution Instructions

## Current State

All 71 invoices currently have the "cancelled" status because that's the only valid value in the `invoice_status_enum`. This is not an error - it's simply the limitation of the current database schema.

## Invoice Data Overview

- **Total invoices**: 71
- **Total amount**: $13,200
- **Average invoice**: $185.92
- **Date range**: 2025-10-08 to 2025-11-06
- **Patients**: 2 (John Doe: 58 invoices, Anthony Thompson: 13 invoices)
- **Doctors**: 10 (7 invoices each for most doctors)

## Ideal Status Distribution

If multiple statuses were available, the proper distribution would be:

| Status    | Count | Percentage | Purpose                          |
|-----------|-------|------------|----------------------------------|
| paid      | 36    | 50%        | Successfully processed payments  |
| pending   | 21    | 30%        | Awaiting payment processing      |
| overdue   | 11    | 15%        | Past due payments                |
| cancelled | 3     | 5%         | Cancelled/refunded transactions  |

## Steps to Properly Distribute Invoice Statuses

### Step 1: Add New Status Values to Enum

You need to run these SQL commands in your Supabase dashboard:

1. Open your Supabase project dashboard
2. Navigate to the **SQL Editor**
3. Run these commands:

```sql
ALTER TYPE invoice_status_enum ADD VALUE 'paid';
ALTER TYPE invoice_status_enum ADD VALUE 'pending';
ALTER TYPE invoice_status_enum ADD VALUE 'overdue';
```

### Step 2: Run the Distribution Script

After adding the new enum values, run this JavaScript script to distribute the invoices:

```javascript
const { createClient } = require('@supabase/supabase-js');

// Supabase configuration
const supabaseUrl = 'https://rsbcbiyvkjqsdtlqwibk.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJzYmNiaXl2a2pxc2R0bHF3aWJrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTY4NTI2NiwiZXhwIjoyMDc1MjYxMjY2fQ.uXwokqlWkfj--W64476PTG4OJCpE_sQjlbiArsSOvUo';

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false
  }
});

async function distributeInvoiceStatuses() {
  // Get all invoices
  const { data: invoices, error } = await supabase
    .from('invoices')
    .select('id');
    
  if (error) {
    console.log('Error fetching invoices:', error.message);
    return;
  }
  
  // Sort for consistent distribution
  invoices.sort((a, b) => a.id.localeCompare(b.id));
  
  // Update invoices based on position to achieve proper distribution
  for (let i = 0; i < invoices.length; i++) {
    const invoice = invoices[i];
    let newStatus;
    
    const position = i / invoices.length;
    if (position < 0.50) {
      newStatus = 'paid';      // 50% (36 invoices)
    } else if (position < 0.80) {
      newStatus = 'pending';   // 30% (21 invoices)
    } else if (position < 0.95) {
      newStatus = 'overdue';   // 15% (11 invoices)
    } else {
      newStatus = 'cancelled'; // 5% (3 invoices)
    }
    
    const { error: updateError } = await supabase
      .from('invoices')
      .update({ status: newStatus })
      .eq('id', invoice.id);
      
    if (updateError) {
      console.log(`Error updating invoice ${invoice.id}:`, updateError.message);
    } else {
      console.log(`Updated invoice ${invoice.id} to ${newStatus}`);
    }
  }
  
  console.log('Invoice status distribution completed!');
}

distributeInvoiceStatuses();
```

### Step 3: Verify the Distribution

After running the distribution script, you can verify the results with this query in your Supabase SQL Editor:

```sql
SELECT status, COUNT(*) as count, 
       ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM invoices), 1) as percentage
FROM invoices 
GROUP BY status 
ORDER BY count DESC;
```

This should show a distribution similar to:
- paid: ~36 invoices (50%)
- pending: ~21 invoices (30%)
- overdue: ~11 invoices (15%)
- cancelled: ~3 invoices (5%)

## Expected Results

After proper distribution, your invoice statuses should represent a realistic billing system:
- Most invoices (50%) are paid - indicating successful transactions
- Some invoices (30%) are pending - payments in process
- A few invoices (15%) are overdue - past due payments requiring follow-up
- Very few invoices (5%) are cancelled - refunds or voided transactions

## Benefits of Proper Status Distribution

1. **Realistic Data**: Makes the system more realistic for testing and demonstration
2. **Financial Tracking**: Enables proper financial reporting and analytics
3. **Workflow Simulation**: Allows simulation of different payment workflows
4. **Dashboard Accuracy**: Ensures dashboards and reports show meaningful data
5. **Business Intelligence**: Enables better business decisions based on payment patterns

## Important Notes

1. The invoices are already properly created and linked to appointments
2. All financial data (amounts, currencies, etc.) is correct
3. The only limitation is the status field due to enum constraints
4. Once the enum is updated, distributing statuses is straightforward
5. No other data changes are needed - only the status field will be updated