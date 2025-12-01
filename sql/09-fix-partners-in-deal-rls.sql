-- ============================================================================
-- Fix RLS Policies for partners_in_deal and property_notes tables
-- ============================================================================
-- Issue: partners_in_deal and property_notes tables have RLS policies that
-- require user_id = auth.uid(), but the app doesn't set user_id when creating
-- records. This causes all INSERT operations to fail silently.
--
-- Solution: Update RLS policies to match the pattern used by all other tables
-- in the app (brokers, partners, properties, etc.) which allow all
-- authenticated users with WITH CHECK (true).
-- ============================================================================

-- Drop existing restrictive policies for partners_in_deal
DROP POLICY IF EXISTS "Users can view their own partners_in_deal" ON partners_in_deal;
DROP POLICY IF EXISTS "Users can insert their own partners_in_deal" ON partners_in_deal;
DROP POLICY IF EXISTS "Users can update their own partners_in_deal" ON partners_in_deal;
DROP POLICY IF EXISTS "Users can delete their own partners_in_deal" ON partners_in_deal;

-- Create permissive policies for partners_in_deal (matching other tables)
CREATE POLICY "partners_in_deal_select" ON partners_in_deal
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "partners_in_deal_insert" ON partners_in_deal
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "partners_in_deal_update" ON partners_in_deal
  FOR UPDATE TO authenticated USING (true);

CREATE POLICY "partners_in_deal_delete" ON partners_in_deal
  FOR DELETE TO authenticated USING (true);

-- Drop existing restrictive policies for property_notes
DROP POLICY IF EXISTS "Users can view their own property_notes" ON property_notes;
DROP POLICY IF EXISTS "Users can insert their own property_notes" ON property_notes;
DROP POLICY IF EXISTS "Users can update their own property_notes" ON property_notes;
DROP POLICY IF EXISTS "Users can delete their own property_notes" ON property_notes;

-- Create permissive policies for property_notes (matching other tables)
CREATE POLICY "property_notes_select" ON property_notes
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "property_notes_insert" ON property_notes
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "property_notes_update" ON property_notes
  FOR UPDATE TO authenticated USING (true);

CREATE POLICY "property_notes_delete" ON property_notes
  FOR DELETE TO authenticated USING (true);
