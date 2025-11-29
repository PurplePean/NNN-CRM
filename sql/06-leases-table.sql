-- Migration: Leases Table for User-Defined Lease Options
-- Description: Create leases table for user-created lease options and add selected_lease_id to properties
-- Date: 2025-11-29

-- ==========================================
-- LEASES TABLE
-- ==========================================

CREATE TABLE IF NOT EXISTS leases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  price_per_sf_month NUMERIC(10,4) NOT NULL,
  term_years INTEGER NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_leases_user_id ON leases(user_id);
CREATE INDEX IF NOT EXISTS idx_leases_created_at ON leases(created_at DESC);

-- Enable RLS on leases table
ALTER TABLE leases ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for leases
CREATE POLICY "Users can view their own leases"
  ON leases FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own leases"
  ON leases FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own leases"
  ON leases FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own leases"
  ON leases FOR DELETE
  USING (auth.uid() = user_id);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_leases_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_leases_timestamp
  BEFORE UPDATE ON leases
  FOR EACH ROW
  EXECUTE FUNCTION update_leases_updated_at();

-- ==========================================
-- PROPERTIES TABLE: Add Selected Lease ID
-- ==========================================

ALTER TABLE properties
ADD COLUMN IF NOT EXISTS selected_lease_id UUID REFERENCES leases(id) ON DELETE SET NULL;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_properties_selected_lease_id ON properties(selected_lease_id);

-- ==========================================
-- COMMENTS
-- ==========================================

COMMENT ON TABLE leases IS 'User-created lease options with pricing and terms';
COMMENT ON COLUMN leases.name IS 'Lease name (e.g., "Triple Net", "Lease Option 1")';
COMMENT ON COLUMN leases.price_per_sf_month IS 'Monthly price per square foot';
COMMENT ON COLUMN leases.term_years IS 'Lease term in years';
COMMENT ON COLUMN properties.selected_lease_id IS 'Reference to selected lease option for this property';
