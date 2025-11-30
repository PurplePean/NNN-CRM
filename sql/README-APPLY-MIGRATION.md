# How to Apply SQL Migrations

## For the Leases RLS Fix (08-fix-leases-rls-policies.sql)

### Problem
The current RLS policies on the `leases` table are blocking INSERT operations with the error:
```
"new row violates row level security policy for table 'leases'"
```

### Solution
The migration `08-fix-leases-rls-policies.sql` fixes this by replacing the problematic `IN` subquery with an `EXISTS` clause, which is more reliable for RLS policies.

### Steps to Apply

1. **Go to Supabase Dashboard**
   - URL: https://acwtflofdabmfpjdixmv.supabase.co
   - Navigate to: **SQL Editor**

2. **Open New Query**
   - Click "+ New query" button

3. **Copy Migration SQL**
   - Open `sql/08-fix-leases-rls-policies.sql`
   - Copy the entire contents

4. **Paste and Run**
   - Paste the SQL into the editor
   - Click "Run" button (or press Ctrl/Cmd + Enter)

5. **Verify Success**
   - You should see: "Success. No rows returned"
   - The policies will now allow lease operations for properties owned by the user

### What Changed

**Before (problematic):**
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

**After (fixed):**
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

### Testing

After applying the migration, test by:
1. Creating a new lease for one of your properties
2. The INSERT should now succeed
3. Verify that you can only create leases for properties you own

### Rollback (if needed)

If you need to revert, you can re-run the old migration:
```bash
# In Supabase SQL Editor, run:
# sql/07-property-specific-leases.sql (lines 12-53)
```

## General Migration Process

For any future migrations:

1. Migrations are numbered sequentially (01, 02, 03, etc.)
2. Always test in a development environment first if possible
3. Run migrations in order
4. Each migration file is idempotent (can be run multiple times safely)
5. Use Supabase SQL Editor to execute migration scripts
