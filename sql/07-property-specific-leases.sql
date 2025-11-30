-- Migration: Convert leases from global to property-specific
-- This migration adds property_id to leases table to make each lease tied to a specific property

-- Step 1: Add property_id column to leases table
ALTER TABLE leases
ADD COLUMN property_id UUID REFERENCES properties(id) ON DELETE CASCADE;

-- Step 2: Create index for property_id lookups
CREATE INDEX IF NOT EXISTS idx_leases_property_id ON leases(property_id);

-- Step 3: Update RLS policies to be property-specific
-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own leases" ON leases;
DROP POLICY IF EXISTS "Users can insert their own leases" ON leases;
DROP POLICY IF EXISTS "Users can update their own leases" ON leases;
DROP POLICY IF EXISTS "Users can delete their own leases" ON leases;

-- Create new property-specific RLS policies
CREATE POLICY "Users can view leases for their properties"
  ON leases
  FOR SELECT
  USING (
    property_id IN (
      SELECT id FROM properties WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create leases for their properties"
  ON leases
  FOR INSERT
  WITH CHECK (
    property_id IN (
      SELECT id FROM properties WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update leases for their properties"
  ON leases
  FOR UPDATE
  USING (
    property_id IN (
      SELECT id FROM properties WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete leases for their properties"
  ON leases
  FOR DELETE
  USING (
    property_id IN (
      SELECT id FROM properties WHERE user_id = auth.uid()
    )
  );

-- Step 4: Remove user_id column since leases are now scoped by property ownership
ALTER TABLE leases DROP COLUMN IF EXISTS user_id;

-- Step 5: Make property_id NOT NULL (after existing data is migrated/cleaned up)
-- Note: This requires any existing leases to have property_id set first
-- For safety, we'll keep it nullable for now and enforce via application logic
-- Uncomment the following line after existing data is migrated:
-- ALTER TABLE leases ALTER COLUMN property_id SET NOT NULL;

-- Step 6: Update name column to lease_name for clarity
ALTER TABLE leases RENAME COLUMN name TO lease_name;
