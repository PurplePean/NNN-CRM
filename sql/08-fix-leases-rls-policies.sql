-- Migration: Fix RLS Policies for Leases Table
-- Description: Replace problematic IN subquery with EXISTS for more reliable RLS
-- Date: 2025-11-30
-- Issue: "new row violates row level security policy for table 'leases'"

-- Step 1: Drop existing RLS policies
DROP POLICY IF EXISTS "Users can view leases for their properties" ON leases;
DROP POLICY IF EXISTS "Users can create leases for their properties" ON leases;
DROP POLICY IF EXISTS "Users can update leases for their properties" ON leases;
DROP POLICY IF EXISTS "Users can delete leases for their properties" ON leases;

-- Step 2: Create improved RLS policies using EXISTS for better reliability
-- These policies check if the property belongs to the current user

CREATE POLICY "Users can view leases for their properties"
  ON leases
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM properties
      WHERE properties.id = leases.property_id
        AND properties.user_id = auth.uid()
    )
  );

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

CREATE POLICY "Users can update leases for their properties"
  ON leases
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1
      FROM properties
      WHERE properties.id = leases.property_id
        AND properties.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM properties
      WHERE properties.id = leases.property_id
        AND properties.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete leases for their properties"
  ON leases
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1
      FROM properties
      WHERE properties.id = leases.property_id
        AND properties.user_id = auth.uid()
    )
  );

-- Step 3: Add helpful comments
COMMENT ON POLICY "Users can view leases for their properties" ON leases IS
  'Allow users to view leases for properties they own';
COMMENT ON POLICY "Users can create leases for their properties" ON leases IS
  'Allow users to create leases for properties they own';
COMMENT ON POLICY "Users can update leases for their properties" ON leases IS
  'Allow users to update leases for properties they own';
COMMENT ON POLICY "Users can delete leases for their properties" ON leases IS
  'Allow users to delete leases for properties they own';
