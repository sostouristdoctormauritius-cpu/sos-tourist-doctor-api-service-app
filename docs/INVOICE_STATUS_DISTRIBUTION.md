# Invoice Status Distribution Report

## Current Situation

After thorough investigation of the invoices table, I found that:

1. **All 71 invoices** currently have the status **"cancelled"**
2. This is the **only valid value** in the `invoice_status_enum`
3. Attempts to use other common status values like "paid", "pending", "overdue" all fail

## Analysis

The invoices are properly linked to appointments and contain all necessary financial information:
- Each invoice has an amount (ranging from $100 to $800)
- All invoices are linked to valid appointments
- Each invoice has complete patient and doctor information

## Ideal Status Distribution

If multiple statuses were available in the enum, a proper distribution would be:

| Status    | Percentage | Count (of 71) | Description                          |
|-----------|------------|---------------|--------------------------------------|
| paid      | 50%        | ~36 invoices  | Payments successfully processed      |
| pending   | 30%        | ~21 invoices  | Awaiting payment processing          |
| overdue   | 15%        | ~11 invoices  | Past due payments                    |
| cancelled | 5%         | ~3 invoices   | Cancelled or refunded transactions   |

## Solution

To properly distribute invoice statuses, the database needs to be updated:

### Step 1: Add Status Values to Enum

Execute the following SQL commands in the Supabase SQL editor:

```sql
-- Add new status values to the invoice_status_enum
ALTER TYPE invoice_status_enum ADD VALUE 'paid';
ALTER TYPE invoice_status_enum ADD VALUE 'pending';
ALTER TYPE invoice_status_enum ADD VALUE 'overdue';
```

### Step 2: Distribute Existing Invoices

After adding the new enum values, run a script to distribute the existing invoices:

```javascript
// This would be implemented in a Node.js script similar to what we've been using
// Approximately 36 invoices would be updated to 'paid'
// Approximately 21 invoices would be updated to 'pending'
// Approximately 11 invoices would be updated to 'overdue'
// Approximately 3 invoices would remain 'cancelled'
```

## Sample Implementation Script

Once the enum values are added, you can use a script like this to distribute the statuses:

```javascript
// After enum values are added, this would properly distribute the statuses
async function distributeInvoiceStatuses() {
  const { data: invoices, error } = await supabase
    .from('invoices')
    .select('id');
    
  if (error) {
    console.log('Error fetching invoices:', error.message);
    return;
  }
  
  // Update invoices based on position to achieve proper distribution
  for (let i = 0; i < invoices.length; i++) {
    const invoice = invoices[i];
    let newStatus;
    
    const position = i / invoices.length;
    if (position < 0.5) {
      newStatus = 'paid';      // 50%
    } else if (position < 0.8) {
      newStatus = 'pending';   // 30%
    } else if (position < 0.95) {
      newStatus = 'overdue';   // 15%
    } else {
      newStatus = 'cancelled'; // 5%
    }
    
    await supabase
      .from('invoices')
      .update({ status: newStatus })
      .eq('id', invoice.id);
  }
}
```

## Verification

After implementing the changes, you should see a distribution similar to:

- **Paid invoices**: ~36 (50%)
- **Pending invoices**: ~21 (30%)
- **Overdue invoices**: ~11 (15%)
- **Cancelled invoices**: ~3 (5%)

This would provide a realistic representation of a medical billing system where payments are in various states of processing.