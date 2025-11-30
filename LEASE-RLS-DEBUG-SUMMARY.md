# Lease RLS Policy DEBUG Summary

## Issue Description
User encounters "new row violates row level security policy for table 'leases'" when trying to create a lease.

## Root Cause Analysis

### The Problem
The RLS (Row Level Security) policy on the `leases` table was using an `IN` subquery pattern:

```sql
CREATE POLICY "Users can create leases for their properties"
  ON leases
  FOR INSERT
  WITH CHECK (
    property_id IN (
      SELECT id FROM properties WHERE user_id = auth.uid()
    )
  );
```

**Why this fails:**
- The `IN` subquery pattern can be unreliable in PostgreSQL RLS contexts
- The policy needs to verify that:
  1. The `property_id` exists in the properties table
  2. The property's `user_id` matches the authenticated user (`auth.uid()`)

### The Solution (Already Committed!)

A fix was already committed in **commit a542cc3** which:
1. Created migration `sql/08-fix-leases-rls-policies.sql`
2. Replaced `IN` subquery with `EXISTS` clause
3. Added comprehensive documentation

**Fixed Policy:**
```sql
CREATE POLICY "Users can create leases for their properties"
  ON leases
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM properties
      WHERE properties.id = leases.property_id
        AND properties.user_id = auth.uid()
    )
  );
```

**Why EXISTS is better:**
- More reliable for RLS contexts
- Explicitly joins the tables
- Better performance in some cases

## Frontend Code Analysis

### Lease Creation Flow (src/App.jsx)

1. **Opening the Modal** (Line 1501: `handleAddLease`)
   - Receives `propertyId` from the button click
   - Stores in `editingPropertyId` state
   - Now includes debugging to verify property exists

2. **Saving the Lease** (Line 1525: `handleSaveLease`)
   - Validates all required fields
   - Checks that `editingPropertyId` exists
   - Creates `leaseData` object with `property_id: editingPropertyId`
   - Now includes debugging to log what's being sent

### Debugging Added

I've added console logging to help diagnose any issues:

**In `handleAddLease` (src/App.jsx:1502-1510):**
```javascript
console.log('Opening lease modal for property_id:', propertyId);
const property = properties.find(p => p.id === propertyId);
if (property) {
  console.log('Property found:', property.name);
  console.log('Property user_id:', property.user_id);
} else {
  console.warn('Property not found in properties array!');
}
```

**In `handleSaveLease` (src/App.jsx:1544-1547):**
```javascript
console.log('Creating lease with property_id:', editingPropertyId);
console.log('Full lease data:', leaseData);
console.log('Current user ID:', (await supabase.auth.getUser())?.data?.user?.id);
```

## Action Required: Apply the Migration

### The migration file exists but needs to be run in Supabase!

**Steps to Fix:**

1. **Go to Supabase Dashboard**
   - URL: https://acwtflofdabmfpjdixmv.supabase.co
   - Navigate to: **SQL Editor**

2. **Open New Query**
   - Click "+ New query" button

3. **Copy Migration SQL**
   - Open `sql/08-fix-leases-rls-policies.sql` in your editor
   - Copy the entire contents (all 80 lines)

4. **Paste and Run**
   - Paste the SQL into the Supabase SQL Editor
   - Click "Run" button (or Ctrl/Cmd + Enter)

5. **Verify Success**
   - You should see: "Success. No rows returned"
   - The new policies are now active!

## Testing After Migration

1. **Open Browser Console** (F12)
2. **Navigate to a Property Profile**
3. **Click "Add Lease Option"**
4. **Check Console Output:**
   ```
   Opening lease modal for property_id: <uuid>
   Property found: <property name>
   Property user_id: <your user id>
   ```

5. **Fill in Lease Details** (name, price, term)
6. **Click Save**
7. **Check Console Output:**
   ```
   Creating lease with property_id: <uuid>
   Full lease data: {lease_name: "...", price_per_sf_month: ..., term_years: ..., property_id: "..."}
   Current user ID: <your user id>
   ```

8. **Verify Success:**
   - Should see "Lease created successfully" toast
   - Lease should appear in the property's lease list

## Troubleshooting

### If lease creation still fails after migration:

1. **Check Console Logs:**
   - Is `property_id` null or undefined?
   - Does the property `user_id` match the current user ID?

2. **Verify Property Ownership:**
   ```sql
   -- Run in Supabase SQL Editor:
   SELECT id, name, user_id FROM properties WHERE id = '<property_id>';
   ```
   - Confirm this returns a row
   - Confirm `user_id` matches your auth user ID

3. **Verify RLS Policy is Active:**
   ```sql
   -- Run in Supabase SQL Editor:
   SELECT * FROM pg_policies WHERE tablename = 'leases';
   ```
   - Should see 4 policies using EXISTS clause
   - Policy names should match the new ones

4. **Check Auth User:**
   ```sql
   -- Run in Supabase SQL Editor:
   SELECT auth.uid();
   ```
   - Should return your user UUID

## Files Modified

1. **sql/08-fix-leases-rls-policies.sql** (already committed)
   - New RLS policies using EXISTS

2. **sql/README-APPLY-MIGRATION.md** (already committed)
   - Instructions for applying migration

3. **src/App.jsx** (this commit)
   - Added debugging to `handleAddLease` (lines 1502-1510)
   - Added debugging to `handleSaveLease` (lines 1544-1547)

## Summary

✅ **Root cause identified:** Unreliable `IN` subquery in RLS policy
✅ **Fix committed:** New migration with `EXISTS` clause
✅ **Debugging added:** Console logs for property_id verification
⚠️ **Action needed:** Apply migration in Supabase Dashboard
📝 **Documentation:** Complete migration guide in sql/README-APPLY-MIGRATION.md

After applying the migration, lease creation should work correctly!
