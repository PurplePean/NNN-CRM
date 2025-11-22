-- ============================================================================
-- Follow-Ups Schema Improvements
-- ============================================================================
-- Created: November 22, 2025
-- Purpose: Add smart contact selector fields to follow_ups table
--
-- Changes:
-- 1. Add contactType field to track contact type (broker, partner, gatekeeper, manual)
-- 2. Add contactId field to store UUID reference to the actual contact
-- 3. Add relatedContact field for backward compatibility
-- 4. Keep existing fields: contactName, type, dueDate, priority, notes, status
--
-- Migration is safe to run multiple times (uses IF NOT EXISTS)
-- ============================================================================

-- Add new columns to follow_ups table
ALTER TABLE follow_ups
ADD COLUMN IF NOT EXISTS "contactType" TEXT,
ADD COLUMN IF NOT EXISTS "contactId" UUID,
ADD COLUMN IF NOT EXISTS "relatedContact" TEXT;

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_follow_ups_contact_type ON follow_ups("contactType");
CREATE INDEX IF NOT EXISTS idx_follow_ups_contact_id ON follow_ups("contactId");

-- Add comments for documentation
COMMENT ON COLUMN follow_ups."contactType" IS 'Type of contact: broker, partner, gatekeeper, or manual for manually entered names';
COMMENT ON COLUMN follow_ups."contactId" IS 'UUID reference to the contact (broker, partner, or gatekeeper table)';
COMMENT ON COLUMN follow_ups."relatedContact" IS 'Legacy field - stores contact identifier in format: {type}-{id} or manual entry';

-- ============================================================================
-- NOTIFY PostgREST to reload schema cache
-- ============================================================================
NOTIFY pgrst, 'reload schema';

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================
-- The follow_ups table now supports:
-- - Smart contact selection with contactId + contactType
-- - Manual text entry with contactType = 'manual'
-- - Backward compatibility with existing relatedContact field
-- ============================================================================
