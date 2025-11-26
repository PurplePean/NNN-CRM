-- Migration: Partner Returns Calculator v2
-- Description: Add lease terms columns to properties table and create partner_deals table
-- Date: 2025-11-26

-- Add lease terms columns to properties table
ALTER TABLE properties
ADD COLUMN IF NOT EXISTS initial_lease_term_years INTEGER,
ADD COLUMN IF NOT EXISTS renewal_option_count INTEGER,
ADD COLUMN IF NOT EXISTS renewal_term_years INTEGER,
ADD COLUMN IF NOT EXISTS annual_rent_escalator NUMERIC(5,2),
ADD COLUMN IF NOT EXISTS option_rent_escalator NUMERIC(5,2);

-- Create partner_deals table to store partner investments in properties
CREATE TABLE IF NOT EXISTS partner_deals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  partner_id UUID NOT NULL REFERENCES partners(id) ON DELETE CASCADE,
  investment_amount NUMERIC(15,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  UNIQUE(property_id, partner_id)
);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_partner_deals_property_id ON partner_deals(property_id);
CREATE INDEX IF NOT EXISTS idx_partner_deals_partner_id ON partner_deals(partner_id);
CREATE INDEX IF NOT EXISTS idx_partner_deals_user_id ON partner_deals(user_id);

-- Enable RLS on partner_deals table
ALTER TABLE partner_deals ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for partner_deals
CREATE POLICY "Users can view their own partner_deals"
  ON partner_deals FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own partner_deals"
  ON partner_deals FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own partner_deals"
  ON partner_deals FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own partner_deals"
  ON partner_deals FOR DELETE
  USING (auth.uid() = user_id);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_partner_deals_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_partner_deals_timestamp
  BEFORE UPDATE ON partner_deals
  FOR EACH ROW
  EXECUTE FUNCTION update_partner_deals_updated_at();
