-- ============================================================================
-- NNN CRM - Production Database Schema
-- ============================================================================
-- This schema creates all necessary tables for the NNN CRM application
-- with proper data types, security policies, and performance indexes.
--
-- IMPORTANT: This will DROP all existing tables and recreate them.
-- Make sure to backup any important data before running this script.
-- ============================================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- DROP EXISTING TABLES (CASCADE to remove dependencies)
-- ============================================================================
DROP TABLE IF EXISTS notes CASCADE;
DROP TABLE IF EXISTS follow_ups CASCADE;
DROP TABLE IF EXISTS events CASCADE;
DROP TABLE IF EXISTS properties CASCADE;
DROP TABLE IF EXISTS gatekeepers CASCADE;
DROP TABLE IF EXISTS partners CASCADE;
DROP TABLE IF EXISTS brokers CASCADE;

-- ============================================================================
-- TABLE: brokers
-- Purpose: Store information about real estate brokers and agents
-- ============================================================================
CREATE TABLE brokers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  company TEXT,
  email TEXT,
  phone TEXT,
  "noteHistory" JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL
);

-- Add unique constraint on email per user (prevent duplicate emails for same user)
CREATE UNIQUE INDEX idx_brokers_user_email ON brokers(user_id, email) WHERE email IS NOT NULL;

-- Add index for performance
CREATE INDEX idx_brokers_user_id ON brokers(user_id);
CREATE INDEX idx_brokers_email ON brokers(email) WHERE email IS NOT NULL;

-- Add comment
COMMENT ON TABLE brokers IS 'Real estate brokers and agents who facilitate property transactions';

-- ============================================================================
-- TABLE: partners
-- Purpose: Store information about investment partners and capital sources
-- ============================================================================
CREATE TABLE partners (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  type TEXT,
  "commitmentAmount" NUMERIC(15,2),
  "assetClass" TEXT,
  email TEXT,
  phone TEXT,
  "noteHistory" JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL
);

-- Add unique constraint on email per user
CREATE UNIQUE INDEX idx_partners_user_email ON partners(user_id, email) WHERE email IS NOT NULL;

-- Add indexes for performance
CREATE INDEX idx_partners_user_id ON partners(user_id);
CREATE INDEX idx_partners_email ON partners(email) WHERE email IS NOT NULL;

-- Add comment
COMMENT ON TABLE partners IS 'Investment partners, capital providers, and equity sources';

-- ============================================================================
-- TABLE: gatekeepers
-- Purpose: Store information about key decision makers and influencers
-- ============================================================================
CREATE TABLE gatekeepers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  title TEXT,
  company TEXT,
  "relatedTo" TEXT,
  email TEXT,
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL
);

-- Add unique constraint on email per user
CREATE UNIQUE INDEX idx_gatekeepers_user_email ON gatekeepers(user_id, email) WHERE email IS NOT NULL;

-- Add indexes for performance
CREATE INDEX idx_gatekeepers_user_id ON gatekeepers(user_id);
CREATE INDEX idx_gatekeepers_email ON gatekeepers(email) WHERE email IS NOT NULL;

-- Add comment
COMMENT ON TABLE gatekeepers IS 'Key decision makers and influencers at partner organizations';

-- ============================================================================
-- TABLE: properties
-- Purpose: Store industrial real estate properties and their financial data
-- ============================================================================
CREATE TABLE properties (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  address TEXT NOT NULL,
  "squareFeet" INTEGER,
  "monthlyBaseRentPerSqft" NUMERIC(10,2),
  "purchasePrice" NUMERIC(15,2),
  improvements NUMERIC(15,2),
  "closingCosts" NUMERIC(15,2),
  "ltvPercent" NUMERIC(5,2),
  "interestRate" NUMERIC(5,3),
  "loanTerm" INTEGER,
  "debtServiceType" TEXT,
  "exitCapRate" NUMERIC(5,2),
  "holdingPeriodMonths" INTEGER,
  "brokerIds" UUID[] DEFAULT '{}'::UUID[],
  "noteHistory" JSONB DEFAULT '[]'::jsonb,
  photos JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL
);

-- Add indexes for performance
CREATE INDEX idx_properties_user_id ON properties(user_id);
CREATE INDEX idx_properties_address ON properties(address);
CREATE INDEX idx_properties_broker_ids ON properties USING GIN("brokerIds");

-- Add comment
COMMENT ON TABLE properties IS 'Industrial real estate properties with financial analysis data';

-- ============================================================================
-- TABLE: events
-- Purpose: Store calendar events, tours, meetings, and important dates
-- ============================================================================
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  type TEXT,
  date TIMESTAMP WITH TIME ZONE,
  location TEXT,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL
);

-- Add indexes for performance
CREATE INDEX idx_events_user_id ON events(user_id);
CREATE INDEX idx_events_date ON events(date);
CREATE INDEX idx_events_type ON events(type);

-- Add comment
COMMENT ON TABLE events IS 'Calendar events including property tours, meetings, deadlines, and closings';

-- ============================================================================
-- TABLE: follow_ups
-- Purpose: Store follow-up tasks and reminders for contacts
-- ============================================================================
CREATE TABLE follow_ups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  "contactName" TEXT,
  type TEXT,
  "dueDate" DATE,
  priority TEXT,
  notes TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL
);

-- Add indexes for performance
CREATE INDEX idx_follow_ups_user_id ON follow_ups(user_id);
CREATE INDEX idx_follow_ups_due_date ON follow_ups("dueDate");
CREATE INDEX idx_follow_ups_status ON follow_ups(status);
CREATE INDEX idx_follow_ups_priority ON follow_ups(priority);

-- Add comment
COMMENT ON TABLE follow_ups IS 'Follow-up tasks and reminders for maintaining contact relationships';

-- ============================================================================
-- TABLE: notes
-- Purpose: Store notes associated with any entity in the system
-- ============================================================================
CREATE TABLE notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "entityType" TEXT NOT NULL,
  "entityId" UUID NOT NULL,
  content TEXT NOT NULL,
  category TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL
);

-- Add indexes for performance
CREATE INDEX idx_notes_user_id ON notes(user_id);
CREATE INDEX idx_notes_entity ON notes("entityType", "entityId");

-- Add comment
COMMENT ON TABLE notes IS 'Notes and comments associated with brokers, partners, properties, etc.';

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================
-- Enable RLS on all tables
ALTER TABLE brokers ENABLE ROW LEVEL SECURITY;
ALTER TABLE partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE gatekeepers ENABLE ROW LEVEL SECURITY;
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE follow_ups ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- RLS POLICIES: brokers
-- ============================================================================
CREATE POLICY "Users can view their own brokers"
  ON brokers FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own brokers"
  ON brokers FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own brokers"
  ON brokers FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own brokers"
  ON brokers FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- RLS POLICIES: partners
-- ============================================================================
CREATE POLICY "Users can view their own partners"
  ON partners FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own partners"
  ON partners FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own partners"
  ON partners FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own partners"
  ON partners FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- RLS POLICIES: gatekeepers
-- ============================================================================
CREATE POLICY "Users can view their own gatekeepers"
  ON gatekeepers FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own gatekeepers"
  ON gatekeepers FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own gatekeepers"
  ON gatekeepers FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own gatekeepers"
  ON gatekeepers FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- RLS POLICIES: properties
-- ============================================================================
CREATE POLICY "Users can view their own properties"
  ON properties FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own properties"
  ON properties FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own properties"
  ON properties FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own properties"
  ON properties FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- RLS POLICIES: events
-- ============================================================================
CREATE POLICY "Users can view their own events"
  ON events FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own events"
  ON events FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own events"
  ON events FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own events"
  ON events FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- RLS POLICIES: follow_ups
-- ============================================================================
CREATE POLICY "Users can view their own follow_ups"
  ON follow_ups FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own follow_ups"
  ON follow_ups FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own follow_ups"
  ON follow_ups FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own follow_ups"
  ON follow_ups FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- RLS POLICIES: notes
-- ============================================================================
CREATE POLICY "Users can view their own notes"
  ON notes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own notes"
  ON notes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own notes"
  ON notes FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own notes"
  ON notes FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- TRIGGERS: Auto-update updated_at timestamp
-- ============================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_brokers_updated_at BEFORE UPDATE ON brokers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_partners_updated_at BEFORE UPDATE ON partners
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_gatekeepers_updated_at BEFORE UPDATE ON gatekeepers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_properties_updated_at BEFORE UPDATE ON properties
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON events
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_follow_ups_updated_at BEFORE UPDATE ON follow_ups
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notes_updated_at BEFORE UPDATE ON notes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- NOTIFY PostgREST to reload schema cache
-- ============================================================================
NOTIFY pgrst, 'reload schema';

-- ============================================================================
-- SCHEMA CREATION COMPLETE
-- ============================================================================
-- The database schema is now ready for production use.
-- All tables have proper data types, security policies, and performance indexes.
-- ============================================================================
