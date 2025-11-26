-- Migration: Partner Returns Calculator
-- Description: Add lease terms columns to properties table and create partners_in_deal table
-- Date: 2025-11-25

-- Add lease terms columns to properties table
ALTER TABLE properties
ADD COLUMN IF NOT EXISTS "initialLeaseTermYears" INTEGER,
ADD COLUMN IF NOT EXISTS "renewalOptionCount" INTEGER,
ADD COLUMN IF NOT EXISTS "renewalTermYears" INTEGER,
ADD COLUMN IF NOT EXISTS "annualRentEscalator" NUMERIC(5,2),
ADD COLUMN IF NOT EXISTS "optionRentEscalator" NUMERIC(5,2);

-- Create partners_in_deal table to store partner investments
CREATE TABLE IF NOT EXISTS partners_in_deal (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  partner_id UUID NOT NULL REFERENCES partners(id) ON DELETE CASCADE,
  investment_amount NUMERIC(15,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  UNIQUE(property_id, partner_id)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_partners_in_deal_property_id ON partners_in_deal(property_id);
CREATE INDEX IF NOT EXISTS idx_partners_in_deal_partner_id ON partners_in_deal(partner_id);
CREATE INDEX IF NOT EXISTS idx_partners_in_deal_user_id ON partners_in_deal(user_id);

-- Enable RLS on partners_in_deal table
ALTER TABLE partners_in_deal ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for partners_in_deal
CREATE POLICY "Users can view their own partners_in_deal"
  ON partners_in_deal FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own partners_in_deal"
  ON partners_in_deal FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own partners_in_deal"
  ON partners_in_deal FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own partners_in_deal"
  ON partners_in_deal FOR DELETE
  USING (auth.uid() = user_id);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_partners_in_deal_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_partners_in_deal_timestamp
  BEFORE UPDATE ON partners_in_deal
  FOR EACH ROW
  EXECUTE FUNCTION update_partners_in_deal_updated_at();

-- Add notes table for property notes if not exists
CREATE TABLE IF NOT EXISTS property_notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  note_text TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_property_notes_property_id ON property_notes(property_id);
CREATE INDEX IF NOT EXISTS idx_property_notes_user_id ON property_notes(user_id);

-- Enable RLS on property_notes table
ALTER TABLE property_notes ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for property_notes
CREATE POLICY "Users can view their own property_notes"
  ON property_notes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own property_notes"
  ON property_notes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own property_notes"
  ON property_notes FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own property_notes"
  ON property_notes FOR DELETE
  USING (auth.uid() = user_id);

-- Create trigger to update updated_at timestamp
CREATE TRIGGER update_property_notes_timestamp
  BEFORE UPDATE ON property_notes
  FOR EACH ROW
  EXECUTE FUNCTION update_partners_in_deal_updated_at();
