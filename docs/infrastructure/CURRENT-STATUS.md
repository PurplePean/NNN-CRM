# Current Deployment Status
**NNN CRM - As of November 18, 2025**

---

## ✅ What's Working

### Phase 0: Static Deployment - COMPLETE
- **Live URL:** https://crm.axispoint.llc
- **SSL:** Enabled and working
- **GitHub Actions:** Auto-deploys on push to `main`
- **Build:** Compiles successfully with CI=false for ESLint warnings
- **FTP Deployment:** Working correctly to Namecheap

### GitHub Secrets Configured
- `FTP_SERVER`: 162.0.209.114
- `FTP_USERNAME`: deploy@crm.axispoint.llc
- `FTP_PASSWORD`: (configured)
- `REACT_APP_SUPABASE_URL`: https://acwtflofdabmfpjdixmv.supabase.co
- `REACT_APP_SUPABASE_ANON_KEY`: (configured)

### Supabase Infrastructure
- **Project:** NNN-CRM created
- **Database:** PostgreSQL running
- **Tables:** 7 tables created (properties, brokers, partners, gatekeepers, events, follow_ups, notes)
- **Row Level Security:** Enabled on all tables
- **Policies:** Authenticated users have full access (shared data model)

---

## ⚠️ Phase 2: Supabase Integration - INCOMPLETE

### What's Deployed
- Supabase client library installed (@supabase/supabase-js v2.81.1)
- Service layer created (src/services/supabase.js)
- App.jsx updated to load from Supabase on mount
- Load Test Data function attempts to insert into Supabase
- Clear All Data function attempts to delete from Supabase
- Build includes Supabase environment variables

### The Problem
**PostgreSQL column name case-sensitivity mismatch**

The test data uses camelCase column names (e.g., `noteHistory`, `relatedTo`, `squareFeet`), but PostgreSQL converts unquoted column names to lowercase unless explicitly quoted during table creation.

**Errors observed:**
```
PGRST204: Could not find the 'noteHistory' column of 'brokers' in the schema cache
PGRST204: Could not find the 'relatedTo' column of 'gatekeepers' in the schema cache
PGRST204: Could not find the 'assetClass' column of 'partners' in the schema cache
```

**Current behavior:**
- App loads but shows empty state
- "Load Test Data" button fails to insert data
- Supabase tables remain empty
- localStorage still works as fallback

---

## 🔧 How to Fix Phase 2

### Option A: Fix Database Schema (Recommended)

Re-create tables with properly quoted camelCase column names to match the app code.

**Run this SQL in Supabase SQL Editor:**

```sql
-- Drop existing tables
DROP TABLE IF EXISTS properties CASCADE;
DROP TABLE IF EXISTS brokers CASCADE;
DROP TABLE IF EXISTS partners CASCADE;
DROP TABLE IF EXISTS gatekeepers CASCADE;
DROP TABLE IF EXISTS events CASCADE;
DROP TABLE IF EXISTS follow_ups CASCADE;
DROP TABLE IF EXISTS notes CASCADE;

-- Create brokers with quoted columns
CREATE TABLE brokers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  company TEXT,
  email TEXT,
  phone TEXT,
  "noteHistory" JSONB DEFAULT '[]',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id)
);

-- Create partners with quoted columns
CREATE TABLE partners (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  type TEXT,
  "commitmentAmount" TEXT,
  "assetClass" TEXT,
  email TEXT,
  phone TEXT,
  "noteHistory" JSONB DEFAULT '[]',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id)
);

-- Create gatekeepers with quoted columns
CREATE TABLE gatekeepers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  title TEXT,
  company TEXT,
  "relatedTo" TEXT,
  email TEXT,
  phone TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id)
);

-- Create properties with quoted columns
CREATE TABLE properties (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  address TEXT,
  "squareFeet" TEXT,
  "monthlyBaseRentPerSqft" TEXT,
  "purchasePrice" TEXT,
  improvements TEXT,
  "closingCosts" TEXT,
  "ltvPercent" TEXT,
  "interestRate" TEXT,
  "loanTerm" TEXT,
  "debtServiceType" TEXT,
  "exitCapRate" TEXT,
  "holdingPeriodMonths" TEXT,
  "brokerIds" UUID[],
  "noteHistory" JSONB DEFAULT '[]',
  photos JSONB DEFAULT '[]',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id)
);

-- Create events with quoted columns
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  type TEXT,
  date TEXT,
  location TEXT,
  description TEXT,
  "createdAt" TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id)
);

-- Create follow_ups with quoted columns
CREATE TABLE follow_ups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT,
  "contactName" TEXT,
  type TEXT,
  "dueDate" TEXT,
  priority TEXT,
  status TEXT,
  notes TEXT,
  "createdAt" TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id)
);

-- Create notes
CREATE TABLE notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  contact_type TEXT NOT NULL,
  contact_id UUID NOT NULL,
  content TEXT NOT NULL,
  category TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id)
);

-- Enable Row Level Security
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE brokers ENABLE ROW LEVEL SECURITY;
ALTER TABLE partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE gatekeepers ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE follow_ups ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;

-- Create policies (shared data - all authenticated users can access everything)
CREATE POLICY "Allow all" ON properties FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON brokers FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON partners FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON gatekeepers FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON events FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON follow_ups FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON notes FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Force schema reload
NOTIFY pgrst, 'reload schema';
```

**After running SQL:**
1. Visit https://crm.axispoint.llc
2. Hard refresh (Cmd+Shift+R or Ctrl+Shift+R)
3. Click "Load Test Data"
4. Check Supabase Table Editor → properties table
5. Should see 5 properties

### Option B: Update App Code to Use Lowercase

Alternatively, update the app to use lowercase column names to match PostgreSQL defaults. This requires:
1. Update src/App.jsx test data to use lowercase (e.g., `notehistory` instead of `noteHistory`)
2. Update all data transformations
3. Commit, push, and redeploy

**This is more work and may break existing functionality.**

---

## 🔄 Rollback Procedures

### If Phase 2 Breaks Production

**Quick Rollback (Revert Last Commit):**
```bash
git revert HEAD
git push origin main
```
GitHub Actions will auto-deploy the previous working version in ~3-5 minutes.

**Selective Rollback (Keep Some Changes):**
```bash
# Create new branch
git checkout -b fix/rollback-supabase

# Remove Supabase from App.jsx (keep localStorage only)
# Edit files manually

# Commit and push
git add -A
git commit -m "Rollback to localStorage only"
git push -u origin fix/rollback-supabase

# Create PR and merge to main
```

**Manual Deployment (Emergency):**
1. Locally: `npm run build`
2. cPanel File Manager → /home/axisipak/crm.axispoint.llc/
3. Delete all files except `.well-known/` and `cgi-bin/`
4. Upload contents of `build/` folder
5. Site restored in ~1 minute

---

## 📋 Phase 3: Google Authentication (Not Started)

### Prerequisites
- Phase 2 must be working (Supabase integration complete)
- SSL must be enabled (✅ already done)
- Partner's Google email address

### What Phase 3 Involves
1. Enable Google OAuth provider in Supabase
2. Configure authorized redirect URLs
3. Add Google sign-in button to app
4. Implement auth state management
5. Update RLS policies to filter by user_id
6. Whitelist 2 Google emails
7. Remove "Load Test Data" and "Clear All Data" buttons
8. Deploy to production

**Estimated Time:** 2-4 hours

---

## 📊 Architecture Overview

```
┌─────────────────────────────────────────┐
│  crm.axispoint.llc (Namecheap Stellar) │
│  - React App (Static Files)             │
│  - SSL via AutoSSL                      │
└─────────────────┬───────────────────────┘
                  │ HTTPS API Calls
                  ↓
┌─────────────────────────────────────────┐
│  Supabase PostgreSQL (Free Tier)       │
│  - 7 Tables (properties, brokers, etc.) │
│  - Row Level Security                   │
│  - Automatic Backups                    │
└─────────────────┬───────────────────────┘
                  │ OAuth (Phase 3)
                  ↓
┌─────────────────────────────────────────┐
│  Google Authentication                  │
│  - Email Whitelist (2 users)            │
└─────────────────────────────────────────┘
```

---

## 🔍 Troubleshooting

### App Shows Empty State
**Cause:** Supabase integration not working, falling back to localStorage
**Solution:** Check browser console for errors, verify Supabase tables exist and have correct column names

### "Load Test Data" Does Nothing
**Cause:** PostgreSQL column name mismatch
**Solution:** Run Option A SQL above to recreate tables with quoted column names

### Build Fails in GitHub Actions
**Cause:** ESLint warnings treated as errors
**Solution:** Already fixed with `CI: false` in workflow

### Deployment Succeeds But Shows Old Version
**Cause:** Browser cache
**Solution:** Hard refresh (Cmd+Shift+R or Ctrl+Shift+R)

### FTP Deployment Fails with 403
**Cause:** FTP_SERVER uses hostname instead of IP
**Solution:** Already fixed - using IP 162.0.209.114

---

## 📞 Support Resources

- **Namecheap Support:** For cPanel, FTP, SSL issues
- **Supabase Docs:** https://supabase.com/docs
- **GitHub Actions Logs:** https://github.com/PurplePean/NNN-CRM/actions
- **Repository:** https://github.com/PurplePean/NNN-CRM

---

## ✅ Next Steps

1. **To Complete Phase 2:**
   - Run Option A SQL in Supabase (see above)
   - Test "Load Test Data" at https://crm.axispoint.llc
   - Verify data appears in Supabase Table Editor
   - Test on partner's laptop to confirm cloud sync

2. **When Ready for Phase 3:**
   - Get partner's Google email address
   - Follow Google Authentication implementation guide
   - Remove test data buttons
   - Configure email whitelist
   - Test login flow

3. **If Abandoning Phase 2:**
   - Run rollback procedure (see above)
   - App works fine with localStorage for single-user
   - Revisit cloud sync later when needed
