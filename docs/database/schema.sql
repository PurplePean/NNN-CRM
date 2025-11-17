-- NNN CRM Database Schema
-- Supabase PostgreSQL Database Setup
-- Run this in Supabase SQL Editor: https://app.supabase.com/project/_/sql

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- PROPERTIES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS properties (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  address TEXT NOT NULL,
  crexi_link TEXT,
  sqft NUMERIC,
  monthly_base_rent NUMERIC,
  purchase_price NUMERIC,
  improvements NUMERIC DEFAULT 0,
  closing_costs NUMERIC DEFAULT 0,
  ltv NUMERIC,
  interest_rate NUMERIC,
  amortization_years INTEGER,
  interest_only BOOLEAN DEFAULT false,
  exit_cap_rate NUMERIC,
  broker_ids UUID[],
  tags TEXT[],
  status TEXT DEFAULT 'active',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

-- ============================================================================
-- BROKERS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS brokers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  firm_name TEXT,
  firm_website TEXT,
  crexi_profile TEXT,
  license_number TEXT,
  tags TEXT[],
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

-- ============================================================================
-- PARTNERS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS partners (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  company TEXT,
  role TEXT,
  website TEXT,
  tags TEXT[],
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

-- ============================================================================
-- GATEKEEPERS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS gatekeepers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  company TEXT,
  role TEXT,
  tags TEXT[],
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

-- ============================================================================
-- EVENTS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  date DATE NOT NULL,
  time TEXT,
  contact_type TEXT,
  contact_id UUID,
  property_id UUID REFERENCES properties(id) ON DELETE SET NULL,
  notes TEXT,
  location TEXT,
  status TEXT DEFAULT 'scheduled',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

-- ============================================================================
-- FOLLOW-UPS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS follow_ups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  due_date DATE NOT NULL,
  priority TEXT DEFAULT 'medium',
  contact_type TEXT,
  contact_id UUID,
  property_id UUID REFERENCES properties(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'pending',
  notes TEXT,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

-- ============================================================================
-- NOTES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  contact_type TEXT NOT NULL,
  contact_id UUID NOT NULL,
  property_id UUID REFERENCES properties(id) ON DELETE SET NULL,
  content TEXT NOT NULL,
  category TEXT,
  tags TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Properties indexes
CREATE INDEX IF NOT EXISTS idx_properties_user_id ON properties(user_id);
CREATE INDEX IF NOT EXISTS idx_properties_created_at ON properties(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_properties_status ON properties(status);

-- Brokers indexes
CREATE INDEX IF NOT EXISTS idx_brokers_user_id ON brokers(user_id);
CREATE INDEX IF NOT EXISTS idx_brokers_email ON brokers(email);

-- Partners indexes
CREATE INDEX IF NOT EXISTS idx_partners_user_id ON partners(user_id);
CREATE INDEX IF NOT EXISTS idx_partners_email ON partners(email);

-- Gatekeepers indexes
CREATE INDEX IF NOT EXISTS idx_gatekeepers_user_id ON gatekeepers(user_id);
CREATE INDEX IF NOT EXISTS idx_gatekeepers_email ON gatekeepers(email);

-- Events indexes
CREATE INDEX IF NOT EXISTS idx_events_user_id ON events(user_id);
CREATE INDEX IF NOT EXISTS idx_events_date ON events(date);
CREATE INDEX IF NOT EXISTS idx_events_contact ON events(contact_type, contact_id);

-- Follow-ups indexes
CREATE INDEX IF NOT EXISTS idx_follow_ups_user_id ON follow_ups(user_id);
CREATE INDEX IF NOT EXISTS idx_follow_ups_due_date ON follow_ups(due_date);
CREATE INDEX IF NOT EXISTS idx_follow_ups_status ON follow_ups(status);
CREATE INDEX IF NOT EXISTS idx_follow_ups_contact ON follow_ups(contact_type, contact_id);

-- Notes indexes
CREATE INDEX IF NOT EXISTS idx_notes_user_id ON notes(user_id);
CREATE INDEX IF NOT EXISTS idx_notes_contact ON notes(contact_type, contact_id);
CREATE INDEX IF NOT EXISTS idx_notes_created_at ON notes(created_at DESC);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE brokers ENABLE ROW LEVEL SECURITY;
ALTER TABLE partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE gatekeepers ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE follow_ups ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;

-- Properties policies
CREATE POLICY "Users can view all properties" ON properties FOR SELECT USING (true);
CREATE POLICY "Users can create their own properties" ON properties FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update all properties" ON properties FOR UPDATE USING (true);
CREATE POLICY "Users can delete all properties" ON properties FOR DELETE USING (true);

-- Brokers policies
CREATE POLICY "Users can view all brokers" ON brokers FOR SELECT USING (true);
CREATE POLICY "Users can create their own brokers" ON brokers FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update all brokers" ON brokers FOR UPDATE USING (true);
CREATE POLICY "Users can delete all brokers" ON brokers FOR DELETE USING (true);

-- Partners policies
CREATE POLICY "Users can view all partners" ON partners FOR SELECT USING (true);
CREATE POLICY "Users can create their own partners" ON partners FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update all partners" ON partners FOR UPDATE USING (true);
CREATE POLICY "Users can delete all partners" ON partners FOR DELETE USING (true);

-- Gatekeepers policies
CREATE POLICY "Users can view all gatekeepers" ON gatekeepers FOR SELECT USING (true);
CREATE POLICY "Users can create their own gatekeepers" ON gatekeepers FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update all gatekeepers" ON gatekeepers FOR UPDATE USING (true);
CREATE POLICY "Users can delete all gatekeepers" ON gatekeepers FOR DELETE USING (true);

-- Events policies
CREATE POLICY "Users can view all events" ON events FOR SELECT USING (true);
CREATE POLICY "Users can create their own events" ON events FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update all events" ON events FOR UPDATE USING (true);
CREATE POLICY "Users can delete all events" ON events FOR DELETE USING (true);

-- Follow-ups policies
CREATE POLICY "Users can view all follow_ups" ON follow_ups FOR SELECT USING (true);
CREATE POLICY "Users can create their own follow_ups" ON follow_ups FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update all follow_ups" ON follow_ups FOR UPDATE USING (true);
CREATE POLICY "Users can delete all follow_ups" ON follow_ups FOR DELETE USING (true);

-- Notes policies
CREATE POLICY "Users can view all notes" ON notes FOR SELECT USING (true);
CREATE POLICY "Users can create their own notes" ON notes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update all notes" ON notes FOR UPDATE USING (true);
CREATE POLICY "Users can delete all notes" ON notes FOR DELETE USING (true);

-- ============================================================================
-- TRIGGER FUNCTIONS FOR UPDATED_AT
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for all tables
CREATE TRIGGER update_properties_updated_at BEFORE UPDATE ON properties
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_brokers_updated_at BEFORE UPDATE ON brokers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_partners_updated_at BEFORE UPDATE ON partners
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_gatekeepers_updated_at BEFORE UPDATE ON gatekeepers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON events
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_follow_ups_updated_at BEFORE UPDATE ON follow_ups
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notes_updated_at BEFORE UPDATE ON notes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- DONE
-- ============================================================================
-- Database schema created successfully!
-- Next steps:
-- 1. Run this SQL in Supabase SQL Editor
-- 2. Verify all 7 tables are created
-- 3. Copy SUPABASE_URL and SUPABASE_ANON_KEY from project settings
-- 4. Add them to .env.local for development
-- 5. Add them to GitHub Secrets for production deployment
