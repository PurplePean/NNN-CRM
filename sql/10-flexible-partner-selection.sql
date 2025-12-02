-- Migration: Flexible Partner Selection
-- Description: Allow custom on-the-fly partners in addition to existing partner links
-- Date: 2025-12-02

-- ==========================================
-- PARTNERS_IN_DEAL TABLE: Add Flexible Partner Support
-- ==========================================

-- 1. Make partner_id nullable to support custom partners
ALTER TABLE partners_in_deal
ALTER COLUMN partner_id DROP NOT NULL;

-- 2. Add partner_name column to store custom partner names
ALTER TABLE partners_in_deal
ADD COLUMN IF NOT EXISTS partner_name TEXT;

-- 3. Drop the existing unique constraint
ALTER TABLE partners_in_deal
DROP CONSTRAINT IF EXISTS partners_in_deal_property_id_partner_id_key;

-- 4. Add new constraint: unique on (property_id, partner_id) only when partner_id is not null
-- For custom partners, we rely on application logic to prevent duplicates by name
CREATE UNIQUE INDEX IF NOT EXISTS idx_partners_in_deal_unique_linked_partner
ON partners_in_deal(property_id, partner_id)
WHERE partner_id IS NOT NULL;

-- 5. Add check constraint: either partner_id OR partner_name must be provided
ALTER TABLE partners_in_deal
ADD CONSTRAINT check_partner_id_or_name
CHECK (
  (partner_id IS NOT NULL AND partner_name IS NULL) OR
  (partner_id IS NULL AND partner_name IS NOT NULL)
);

-- 6. Update foreign key constraint to be nullable (already handled by ALTER COLUMN above)
-- The existing foreign key constraint will automatically handle NULL values correctly

-- Note: When querying partners_in_deal, the application should:
-- - If partner_id exists: JOIN with partners table to get full partner details
-- - If partner_id is NULL: Use partner_name field directly for display
