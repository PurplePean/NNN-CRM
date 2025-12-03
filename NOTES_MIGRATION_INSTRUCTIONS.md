# Categorized Notes System - Migration Instructions

## Overview
This migration updates the `notes` table to support the new categorized notes system across all entity types (properties, brokers, partners, gatekeepers, events, follow-ups).

## How to Apply the Migration

### Option 1: Supabase Dashboard (Recommended)
1. Open your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Create a new query
4. Copy the contents of `/sql/06-categorized-notes-migration.sql`
5. Paste into the SQL Editor
6. Click **Run** to execute the migration

### Option 2: Supabase CLI
```bash
supabase db push
```
Or manually run:
```bash
psql <your-connection-string> < sql/06-categorized-notes-migration.sql
```

## What the Migration Does

1. **Updates the notes table schema:**
   - Ensures proper column naming (snake_case)
   - Adds check constraints for valid entity types
   - Sets up proper indexes for performance

2. **Adds Row Level Security (RLS) policies:**
   - Users can view all notes
   - Users can only create, edit, and delete their own notes

3. **Creates triggers:**
   - Auto-updates the `updated_at` timestamp on note edits

4. **Adds indexes:**
   - `idx_notes_entity` - for fast entity lookups
   - `idx_notes_user_id` - for user-specific queries
   - `idx_notes_created_at` - for chronological ordering

## Verification

After applying the migration, verify the changes:

```sql
-- Check table structure
\d notes;

-- Check RLS policies
SELECT * FROM pg_policies WHERE tablename = 'notes';

-- Check indexes
SELECT * FROM pg_indexes WHERE tablename = 'notes';
```

## Rollback (if needed)

If you need to rollback the migration:

```sql
-- Remove new indexes
DROP INDEX IF EXISTS idx_notes_entity;
DROP INDEX IF EXISTS idx_notes_created_at;

-- Remove RLS policies
DROP POLICY IF EXISTS "Users can view notes" ON notes;
DROP POLICY IF EXISTS "Users can create notes" ON notes;
DROP POLICY IF EXISTS "Users can update their own notes" ON notes;
DROP POLICY IF EXISTS "Users can delete their own notes" ON notes;

-- Remove check constraint
ALTER TABLE notes DROP CONSTRAINT IF EXISTS notes_entity_type_check;

-- Note: You may want to keep the table structure changes
```

## Features Enabled

After migration, users can:
- Add categorized notes to Properties (6 categories)
- Add categorized notes to Brokers (4 categories)
- Add categorized notes to Partners (6 categories)
- Add categorized notes to Gatekeepers (5 categories)
- Add categorized notes to Events (4 categories)
- Add categorized notes to Follow-ups (3 categories)

Each note includes:
- Category with icon and color coding
- Timestamp
- Content
- Edit/Delete capabilities
- User attribution
