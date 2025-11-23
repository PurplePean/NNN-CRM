-- ============================================================================
-- Google Calendar Sync Schema
-- ============================================================================
-- Created: November 23, 2025
-- Purpose: Add Google Calendar 2-way sync support to events and follow_ups
--
-- Changes:
-- 1. Add google_event_id to track Google Calendar event IDs
-- 2. Add synced_to_google flag to track sync status
-- 3. Add last_synced_at timestamp for sync tracking
-- 4. Add sync_error field to store sync errors
-- 5. Create sync_settings table for configuration
--
-- Migration is safe to run multiple times (uses IF NOT EXISTS)
-- ============================================================================

-- ============================================================================
-- TABLE: sync_settings
-- Purpose: Store Google Calendar sync configuration and state
-- ============================================================================
CREATE TABLE IF NOT EXISTS sync_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Sync configuration
  setting_key TEXT UNIQUE NOT NULL,          -- Setting key (e.g., 'google_calendar_id', 'last_sync_time')
  setting_value TEXT,                        -- Setting value

  -- Metadata
  description TEXT,                          -- Setting description

  -- System fields
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Indexes for sync_settings
CREATE INDEX IF NOT EXISTS idx_sync_settings_key ON sync_settings(setting_key);
CREATE INDEX IF NOT EXISTS idx_sync_settings_user_id ON sync_settings(user_id);

COMMENT ON TABLE sync_settings IS 'Google Calendar sync configuration and state';

-- ============================================================================
-- UPDATE: events table - Add Google Calendar sync fields
-- ============================================================================

-- Add Google Calendar sync columns to events table
ALTER TABLE events
ADD COLUMN IF NOT EXISTS google_event_id TEXT,
ADD COLUMN IF NOT EXISTS synced_to_google BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS last_synced_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS sync_error TEXT;

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_events_google_event_id ON events(google_event_id);
CREATE INDEX IF NOT EXISTS idx_events_synced_to_google ON events(synced_to_google);
CREATE INDEX IF NOT EXISTS idx_events_last_synced_at ON events(last_synced_at);

-- Add comments for documentation
COMMENT ON COLUMN events.google_event_id IS 'Google Calendar event ID for synced events';
COMMENT ON COLUMN events.synced_to_google IS 'Flag indicating if event is synced to Google Calendar';
COMMENT ON COLUMN events.last_synced_at IS 'Timestamp of last successful sync to Google Calendar';
COMMENT ON COLUMN events.sync_error IS 'Error message if sync failed';

-- ============================================================================
-- UPDATE: follow_ups table - Add Google Calendar sync fields
-- ============================================================================

-- Add Google Calendar sync columns to follow_ups table
ALTER TABLE follow_ups
ADD COLUMN IF NOT EXISTS google_event_id TEXT,
ADD COLUMN IF NOT EXISTS synced_to_google BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS last_synced_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS sync_error TEXT;

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_follow_ups_google_event_id ON follow_ups(google_event_id);
CREATE INDEX IF NOT EXISTS idx_follow_ups_synced_to_google ON follow_ups(synced_to_google);
CREATE INDEX IF NOT EXISTS idx_follow_ups_last_synced_at ON follow_ups(last_synced_at);

-- Add comments for documentation
COMMENT ON COLUMN follow_ups.google_event_id IS 'Google Calendar event ID for synced follow-ups';
COMMENT ON COLUMN follow_ups.synced_to_google IS 'Flag indicating if follow-up is synced to Google Calendar';
COMMENT ON COLUMN follow_ups.last_synced_at IS 'Timestamp of last successful sync to Google Calendar';
COMMENT ON COLUMN follow_ups.sync_error IS 'Error message if sync failed';

-- ============================================================================
-- RLS POLICIES - sync_settings table
-- ============================================================================
ALTER TABLE sync_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "sync_settings_select" ON sync_settings FOR SELECT TO authenticated USING (true);
CREATE POLICY IF NOT EXISTS "sync_settings_insert" ON sync_settings FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY IF NOT EXISTS "sync_settings_update" ON sync_settings FOR UPDATE TO authenticated USING (true);
CREATE POLICY IF NOT EXISTS "sync_settings_delete" ON sync_settings FOR DELETE TO authenticated USING (true);

-- ============================================================================
-- TRIGGERS: Auto-update updated_at timestamp
-- ============================================================================
CREATE TRIGGER IF NOT EXISTS update_sync_settings_updated_at BEFORE UPDATE ON sync_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- INSERT DEFAULT SETTINGS
-- ============================================================================
INSERT INTO sync_settings (setting_key, setting_value, description)
VALUES
  ('google_calendar_id', 'c_c6da83c28bffd2cb7bb374dc8376bbc54d31eac404f3b26023d82e42dffae709@group.calendar.google.com', 'Company shared Google Calendar ID'),
  ('sync_enabled', 'true', 'Enable/disable Google Calendar sync'),
  ('sync_interval_minutes', '5', 'Sync interval in minutes for Google Calendar to CRM'),
  ('last_successful_sync', NULL, 'Timestamp of last successful sync from Google Calendar')
ON CONFLICT (setting_key) DO NOTHING;

-- ============================================================================
-- NOTIFY PostgREST to reload schema cache
-- ============================================================================
NOTIFY pgrst, 'reload schema';

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================
-- The events and follow_ups tables now support Google Calendar 2-way sync:
-- - google_event_id: Links to Google Calendar event
-- - synced_to_google: Tracks sync status
-- - last_synced_at: Timestamp of last sync
-- - sync_error: Stores any sync errors
-- - sync_settings table: Stores sync configuration
-- ============================================================================
