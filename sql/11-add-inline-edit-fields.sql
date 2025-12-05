-- ============================================================================
-- Add Inline Editing Fields Migration
-- ============================================================================
-- Purpose: Add new fields to partners and gatekeepers tables for inline editing
-- Date: December 5, 2025
-- ============================================================================

-- Add website column to partners table
ALTER TABLE partners ADD COLUMN IF NOT EXISTS website TEXT;

-- Add firmWebsite column to gatekeepers table (using camelCase to match brokers schema)
ALTER TABLE gatekeepers ADD COLUMN IF NOT EXISTS "firmWebsite" TEXT;

-- Add indexes for new URL fields (optional but recommended for search performance)
CREATE INDEX IF NOT EXISTS idx_partners_website ON partners(website) WHERE website IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_gatekeepers_firm_website ON gatekeepers("firmWebsite") WHERE "firmWebsite" IS NOT NULL;

-- Add comments documenting the new fields
COMMENT ON COLUMN partners.website IS 'Partner or LP firm website URL';
COMMENT ON COLUMN gatekeepers."firmWebsite" IS 'Gatekeeper firm website URL';

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================
-- New fields added:
--   - partners.website (TEXT, nullable)
--   - gatekeepers.firmWebsite (TEXT, nullable)
--
-- These fields support the inline editing feature for entity cards
-- ============================================================================
