-- ============================================================================
-- NNN CRM - Production Database Schema (REBUILT)
-- ============================================================================
-- Generated: November 21, 2025
-- Source: All fields extracted from src/App.jsx form handlers and test data
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
-- Source: handleAddBroker() form in App.jsx lines 1054-1067
-- ============================================================================
CREATE TABLE brokers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Core contact info (form fields)
  name TEXT NOT NULL,                    -- Broker Name input
  email TEXT,                            -- Email input
  phone TEXT,                            -- Phone input

  -- Firm details (form fields)
  "firmName" TEXT,                       -- Firm Name input
  "firmWebsite" TEXT,                    -- Firm Website input
  "crexiLink" TEXT,                      -- CREXi Link input
  "licenseNumber" TEXT,                  -- License # input

  -- Additional info
  conversations TEXT,                    -- Conversations textarea (from form)
  company TEXT,                          -- Legacy field from test data

  -- Notes (stored as JSONB array)
  "noteHistory" JSONB DEFAULT '[]'::jsonb,  -- Array of note objects

  -- System fields
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Indexes for brokers
CREATE INDEX idx_brokers_user_id ON brokers(user_id);
CREATE INDEX idx_brokers_email ON brokers(email) WHERE email IS NOT NULL;
CREATE INDEX idx_brokers_firm ON brokers("firmName");

COMMENT ON TABLE brokers IS 'Real estate brokers - fields from handleAddBroker() form';

-- ============================================================================
-- TABLE: partners
-- Source: handleAddPartner() form in App.jsx lines 1264-1278
-- ============================================================================
CREATE TABLE partners (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Core contact info (form fields)
  name TEXT NOT NULL,                    -- Partner Name input
  "entityName" TEXT,                     -- Entity Name input
  email TEXT,                            -- Email input
  phone TEXT,                            -- Phone input

  -- Investment details (form fields)
  "checkSize" TEXT,                      -- Check Size input (commitmentAmount in test data)
  "assetClasses" JSONB DEFAULT '[]'::jsonb,  -- Asset Classes multi-select (array)
  "creExperience" TEXT,                  -- CRE Experience select/input
  background TEXT,                       -- Background textarea
  "riskTolerance" TEXT,                  -- Risk Tolerance select
  "customTags" JSONB DEFAULT '[]'::jsonb,    -- Custom Tags (array)

  -- Legacy fields from test data
  type TEXT,                             -- Partner type (Institutional, Family Office, etc.)
  "commitmentAmount" TEXT,               -- Legacy: commitment amount
  "assetClass" TEXT,                     -- Legacy: single asset class

  -- Notes (stored as JSONB array)
  "noteHistory" JSONB DEFAULT '[]'::jsonb,  -- Array of note objects

  -- System fields
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Indexes for partners
CREATE INDEX idx_partners_user_id ON partners(user_id);
CREATE INDEX idx_partners_email ON partners(email) WHERE email IS NOT NULL;
CREATE INDEX idx_partners_type ON partners(type);

COMMENT ON TABLE partners IS 'Investment partners - fields from handleAddPartner() form';

-- ============================================================================
-- TABLE: gatekeepers
-- Source: handleAddGatekeeper() form in App.jsx lines 1136-1144
-- ============================================================================
CREATE TABLE gatekeepers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Core contact info (form fields)
  name TEXT NOT NULL,                    -- Gatekeeper Name input
  title TEXT,                            -- Title input
  email TEXT,                            -- Email input
  phone TEXT,                            -- Phone input
  company TEXT,                          -- Company input
  "relatedTo" TEXT,                      -- Related To input (partner relationship)

  -- System fields
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Indexes for gatekeepers
CREATE INDEX idx_gatekeepers_user_id ON gatekeepers(user_id);
CREATE INDEX idx_gatekeepers_email ON gatekeepers(email) WHERE email IS NOT NULL;
CREATE INDEX idx_gatekeepers_company ON gatekeepers(company);

COMMENT ON TABLE gatekeepers IS 'Key decision makers - fields from handleAddGatekeeper() form';

-- ============================================================================
-- TABLE: properties
-- Source: handleAddProperty() form in App.jsx lines 631-649
-- ============================================================================
CREATE TABLE properties (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Property details (form fields)
  address TEXT NOT NULL,                 -- Property Address input
  "squareFeet" TEXT,                     -- Square Feet input
  "monthlyBaseRentPerSqft" TEXT,         -- Monthly Base Rent per Sq Ft input

  -- Purchase & costs (form fields)
  "purchasePrice" TEXT,                  -- Purchase Price input
  improvements TEXT,                     -- Improvements (CapEx/Renovation) input
  "closingCosts" TEXT,                   -- Closing Costs input

  -- Financing (form fields)
  "ltvPercent" TEXT,                     -- LTV % input
  "interestRate" TEXT,                   -- Interest Rate input
  "loanTerm" TEXT,                       -- Loan Term input (default '30')
  "debtServiceType" TEXT,                -- Debt Service Type select (standard/interestOnly)

  -- Exit analysis (form fields)
  "exitCapRate" TEXT,                    -- Exit Cap Rate input
  "holdingPeriodMonths" TEXT,            -- Holding Period (months) input

  -- External links (form fields)
  crexi TEXT,                            -- CREXi Listing URL input

  -- Relationships
  "brokerIds" UUID[] DEFAULT '{}'::UUID[],  -- Array of broker IDs

  -- Media and notes
  photos JSONB DEFAULT '[]'::jsonb,      -- Array of photo objects
  "noteHistory" JSONB DEFAULT '[]'::jsonb,  -- Array of note objects
  notes TEXT,                            -- Simple notes field

  -- System fields
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Indexes for properties
CREATE INDEX idx_properties_user_id ON properties(user_id);
CREATE INDEX idx_properties_address ON properties(address);
CREATE INDEX idx_properties_broker_ids ON properties USING GIN("brokerIds");

COMMENT ON TABLE properties IS 'Industrial real estate properties - fields from handleAddProperty() form';

-- ============================================================================
-- TABLE: events
-- Source: testEvents in App.jsx lines 1737-1783
-- ============================================================================
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Event details
  title TEXT NOT NULL,                   -- Event title
  type TEXT,                             -- Event type (Property Tour, Meeting, etc.)
  date TEXT,                             -- Event date/time (ISO string)
  location TEXT,                         -- Event location
  description TEXT,                      -- Event description

  -- Legacy field from test data
  "createdAt" TEXT,                      -- Creation timestamp (string format)

  -- System fields
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Indexes for events
CREATE INDEX idx_events_user_id ON events(user_id);
CREATE INDEX idx_events_date ON events(date);
CREATE INDEX idx_events_type ON events(type);

COMMENT ON TABLE events IS 'Calendar events - fields from testEvents in App.jsx';

-- ============================================================================
-- TABLE: follow_ups
-- Source: testFollowUps in App.jsx lines 1694-1735
-- ============================================================================
CREATE TABLE follow_ups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Follow-up details
  "contactName" TEXT,                    -- Contact name (e.g., "Sarah Mitchell (CBRE)")
  type TEXT,                             -- Follow-up type (Call, Meeting, Email, Property Tour)
  "dueDate" TEXT,                        -- Due date (ISO date string)
  priority TEXT,                         -- Priority (High, Medium, Low)
  notes TEXT,                            -- Follow-up notes
  status TEXT DEFAULT 'pending',         -- Status (pending, completed)

  -- Legacy fields
  title TEXT,                            -- Title field (from old schema)
  "createdAt" TEXT,                      -- Creation timestamp (string format)

  -- System fields
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Indexes for follow_ups
CREATE INDEX idx_follow_ups_user_id ON follow_ups(user_id);
CREATE INDEX idx_follow_ups_due_date ON follow_ups("dueDate");
CREATE INDEX idx_follow_ups_status ON follow_ups(status);
CREATE INDEX idx_follow_ups_priority ON follow_ups(priority);

COMMENT ON TABLE follow_ups IS 'Follow-up tasks - fields from testFollowUps in App.jsx';

-- ============================================================================
-- TABLE: notes
-- Purpose: Standalone notes table for any entity
-- ============================================================================
CREATE TABLE notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Note association
  "entityType" TEXT NOT NULL,            -- Entity type (broker, partner, property, etc.)
  "entityId" UUID NOT NULL,              -- ID of the associated entity

  -- Note content
  content TEXT NOT NULL,                 -- Note content
  category TEXT,                         -- Note category (general, financial, etc.)
  edited BOOLEAN DEFAULT FALSE,          -- Whether note has been edited

  -- System fields
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Indexes for notes
CREATE INDEX idx_notes_user_id ON notes(user_id);
CREATE INDEX idx_notes_entity ON notes("entityType", "entityId");

COMMENT ON TABLE notes IS 'Standalone notes for any entity in the system';

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) - Enable on all tables
-- ============================================================================
ALTER TABLE brokers ENABLE ROW LEVEL SECURITY;
ALTER TABLE partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE gatekeepers ENABLE ROW LEVEL SECURITY;
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE follow_ups ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- RLS POLICIES - Allow all authenticated users (shared data model)
-- ============================================================================

-- Brokers policies
CREATE POLICY "brokers_select" ON brokers FOR SELECT TO authenticated USING (true);
CREATE POLICY "brokers_insert" ON brokers FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "brokers_update" ON brokers FOR UPDATE TO authenticated USING (true);
CREATE POLICY "brokers_delete" ON brokers FOR DELETE TO authenticated USING (true);

-- Partners policies
CREATE POLICY "partners_select" ON partners FOR SELECT TO authenticated USING (true);
CREATE POLICY "partners_insert" ON partners FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "partners_update" ON partners FOR UPDATE TO authenticated USING (true);
CREATE POLICY "partners_delete" ON partners FOR DELETE TO authenticated USING (true);

-- Gatekeepers policies
CREATE POLICY "gatekeepers_select" ON gatekeepers FOR SELECT TO authenticated USING (true);
CREATE POLICY "gatekeepers_insert" ON gatekeepers FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "gatekeepers_update" ON gatekeepers FOR UPDATE TO authenticated USING (true);
CREATE POLICY "gatekeepers_delete" ON gatekeepers FOR DELETE TO authenticated USING (true);

-- Properties policies
CREATE POLICY "properties_select" ON properties FOR SELECT TO authenticated USING (true);
CREATE POLICY "properties_insert" ON properties FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "properties_update" ON properties FOR UPDATE TO authenticated USING (true);
CREATE POLICY "properties_delete" ON properties FOR DELETE TO authenticated USING (true);

-- Events policies
CREATE POLICY "events_select" ON events FOR SELECT TO authenticated USING (true);
CREATE POLICY "events_insert" ON events FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "events_update" ON events FOR UPDATE TO authenticated USING (true);
CREATE POLICY "events_delete" ON events FOR DELETE TO authenticated USING (true);

-- Follow-ups policies
CREATE POLICY "follow_ups_select" ON follow_ups FOR SELECT TO authenticated USING (true);
CREATE POLICY "follow_ups_insert" ON follow_ups FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "follow_ups_update" ON follow_ups FOR UPDATE TO authenticated USING (true);
CREATE POLICY "follow_ups_delete" ON follow_ups FOR DELETE TO authenticated USING (true);

-- Notes policies
CREATE POLICY "notes_select" ON notes FOR SELECT TO authenticated USING (true);
CREATE POLICY "notes_insert" ON notes FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "notes_update" ON notes FOR UPDATE TO authenticated USING (true);
CREATE POLICY "notes_delete" ON notes FOR DELETE TO authenticated USING (true);

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
-- All tables now match the exact field names used in App.jsx
-- Quoted column names preserve camelCase (e.g., "firmName", "noteHistory")
-- RLS enabled with policies allowing all authenticated users
-- ============================================================================
