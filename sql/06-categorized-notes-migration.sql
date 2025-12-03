-- ============================================================================
-- Migration: Categorized Notes System
-- Description: Update notes table for global categorized notes across all entities
-- Date: 2024-12-03
-- ============================================================================

-- Update notes table schema (if columns don't exist, this is idempotent)
ALTER TABLE notes ALTER COLUMN entity_type TYPE TEXT;
ALTER TABLE notes ALTER COLUMN entity_id TYPE UUID;

-- Rename columns to snake_case if needed (handles both camelCase and snake_case)
DO $$
BEGIN
    -- Rename entityType to entity_type if it exists
    IF EXISTS (SELECT 1 FROM information_schema.columns
               WHERE table_name = 'notes' AND column_name = 'entityType') THEN
        ALTER TABLE notes RENAME COLUMN "entityType" TO entity_type;
    END IF;

    -- Rename entityId to entity_id if it exists
    IF EXISTS (SELECT 1 FROM information_schema.columns
               WHERE table_name = 'notes' AND column_name = 'entityId') THEN
        ALTER TABLE notes RENAME COLUMN "entityId" TO entity_id;
    END IF;
END$$;

-- Ensure all required columns exist with proper types
ALTER TABLE notes
  ALTER COLUMN id SET DEFAULT uuid_generate_v4(),
  ALTER COLUMN entity_type SET NOT NULL,
  ALTER COLUMN entity_id SET NOT NULL,
  ALTER COLUMN content SET NOT NULL,
  ALTER COLUMN created_at SET DEFAULT NOW(),
  ALTER COLUMN updated_at SET DEFAULT NOW();

-- Add check constraint for valid entity types
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'notes_entity_type_check') THEN
        ALTER TABLE notes ADD CONSTRAINT notes_entity_type_check
        CHECK (entity_type IN ('property', 'broker', 'partner', 'gatekeeper', 'event', 'follow_up'));
    END IF;
END$$;

-- Recreate indexes (drop and create to ensure they exist correctly)
DROP INDEX IF EXISTS idx_notes_entity;
DROP INDEX IF EXISTS idx_notes_user_id;

CREATE INDEX idx_notes_entity ON notes(entity_type, entity_id);
CREATE INDEX idx_notes_user_id ON notes(user_id);
CREATE INDEX idx_notes_created_at ON notes(created_at DESC);

-- Enable RLS on notes table
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view notes" ON notes;
DROP POLICY IF EXISTS "Users can create notes" ON notes;
DROP POLICY IF EXISTS "Users can update their own notes" ON notes;
DROP POLICY IF EXISTS "Users can delete their own notes" ON notes;

-- RLS Policies: Users can view all notes but only modify their own
CREATE POLICY "Users can view notes"
  ON notes FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can create notes"
  ON notes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own notes"
  ON notes FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own notes"
  ON notes FOR DELETE
  USING (auth.uid() = user_id);

-- Update updated_at trigger function (if it doesn't exist)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add trigger to auto-update updated_at
DROP TRIGGER IF EXISTS update_notes_updated_at ON notes;
CREATE TRIGGER update_notes_updated_at
  BEFORE UPDATE ON notes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add comments
COMMENT ON TABLE notes IS 'Categorized notes for all entities (properties, brokers, partners, gatekeepers, events, follow-ups)';
COMMENT ON COLUMN notes.entity_type IS 'Entity type: property, broker, partner, gatekeeper, event, follow_up';
COMMENT ON COLUMN notes.entity_id IS 'UUID of the associated entity';
COMMENT ON COLUMN notes.category IS 'Note category slug (e.g., site_visit, meeting, phone_call, etc.)';
COMMENT ON COLUMN notes.content IS 'Note content text';
COMMENT ON COLUMN notes.edited IS 'Whether the note has been edited after creation';

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================
