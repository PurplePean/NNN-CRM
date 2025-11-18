# Backend & Infrastructure
**NNN CRM - Technical Specifications**

---

## Requirements

**Problem:** 2 remote users need shared access to CRM with cloud data persistence

**Constraints:**
- $0 additional monthly cost
- 2-10 second data sync acceptable
- No sensitive data (don't need encryption at rest)
- Weekly deal volume growth
- Might add users later (not now)

---

## Architecture

```
crm.axispoint.llc (Namecheap Stellar)
    ↓ HTTPS API calls
Supabase PostgreSQL (free tier)
    ↓ OAuth
Google Authentication
```

---

## Components

### 1. Frontend Hosting
**Service:** Namecheap Stellar Hosting
**Subdomain:** crm.axispoint.llc
**Content:** React build files (static)
**SSL:** AutoSSL (free)
**Cost:** $0 (already paying for hosting)

### 2. Database
**Service:** Supabase PostgreSQL
**Tier:** Free (500MB database, 50K MAU, 2GB file storage)
**Tables:**
- `properties` - Property details + financial calculations
- `brokers` - Broker contacts
- `partners` - Partner contacts
- `gatekeepers` - Gatekeeper contacts
- `events` - Scheduled events
- `follow_ups` - Follow-up tasks
- `notes` - Notes attached to contacts

**Sync:** Standard polling (2-10 sec acceptable, no real-time needed)
**Backups:** Automatic daily (Supabase built-in)
**Cost:** $0

### 3. Authentication
**Service:** Google OAuth via Supabase
**Method:** "Sign in with Google" button
**Access Control:** Email whitelist (2 emails)
**Cost:** $0

---

## Database Schema

### Properties Table
```sql
CREATE TABLE properties (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  address TEXT NOT NULL,
  crexi_link TEXT,
  sqft NUMERIC,
  monthly_base_rent NUMERIC,
  purchase_price NUMERIC,
  improvements NUMERIC,
  closing_costs NUMERIC,
  ltv NUMERIC,
  interest_rate NUMERIC,
  amortization_years INTEGER,
  interest_only BOOLEAN,
  exit_cap_rate NUMERIC,
  broker_ids UUID[],
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id)
);
```

### Contacts Tables (Brokers, Partners, Gatekeepers)
```sql
CREATE TABLE brokers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  firm_name TEXT,
  firm_website TEXT,
  crexi_profile TEXT,
  license_number TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id)
);

-- Similar structure for partners and gatekeepers tables
```

### Events & Follow-ups
```sql
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  date DATE NOT NULL,
  time TEXT,
  contact_type TEXT,
  contact_id UUID,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id)
);

CREATE TABLE follow_ups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  due_date DATE NOT NULL,
  priority TEXT,
  contact_type TEXT,
  contact_id UUID,
  status TEXT,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id)
);
```

### Notes Table
```sql
CREATE TABLE notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  contact_type TEXT NOT NULL,
  contact_id UUID NOT NULL,
  content TEXT NOT NULL,
  category TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id)
);
```

---

## API Service Layer

**Package:** `@supabase/supabase-js`

**Structure:**
```
src/services/
  ├── supabase.js           # Client initialization
  ├── properties.js         # Property CRUD
  ├── contacts.js           # Broker/Partner/Gatekeeper CRUD
  ├── events.js             # Events CRUD
  ├── followUps.js          # Follow-ups CRUD
  └── notes.js              # Notes CRUD
```

**Example Service (properties.js):**
```javascript
import { supabase } from './supabase';

export const propertyService = {
  async getAll() {
    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async create(property) {
    const { data, error } = await supabase
      .from('properties')
      .insert([property])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async update(id, updates) {
    const { data, error } = await supabase
      .from('properties')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async delete(id) {
    const { error } = await supabase
      .from('properties')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
};
```

---

## Environment Variables

### Local Development (`.env.local`)
```bash
REACT_APP_SUPABASE_URL=https://yourproject.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your_anon_key_here
```

### Production (GitHub Secrets)
```bash
SUPABASE_URL=https://yourproject.supabase.co
SUPABASE_ANON_KEY=your_anon_key_here
```

**Note:** Never commit `.env.local` to git

---

## Security

**Row Level Security (RLS):**
- All tables have RLS enabled
- Users can only read/write their own data (or shared data)
- Enforced at database level

**Authentication:**
- Google OAuth only
- Email whitelist (2 emails initially)
- Session management via Supabase

**API Keys:**
- Anon key is safe for client-side (RLS enforces security)
- Service role key NEVER exposed to frontend

---

## Monitoring

**Supabase Dashboard:**
- API request count
- Database storage usage
- Active connections
- Query performance

**Optional: Sentry**
- JavaScript error tracking
- Email alerts on errors
- Free tier: 5K errors/month

---

## Scaling Considerations

**Current (Free Tier):**
- 500MB database (thousands of properties)
- 50K monthly active users (you have 2)
- 2GB file storage

**If you outgrow free tier:**
- Supabase Pro: $25/month
  - 8GB database
  - 100K MAU
  - 100GB file storage
  - No 7-day pause

**Unlikely to need upgrade for:**
- <10,000 properties
- <10 users
- Moderate usage

---

## Cost Breakdown

| Component | Monthly | Annual |
|-----------|---------|--------|
| Namecheap Hosting | Already paying | Already paying |
| Supabase | $0 | $0 |
| Google OAuth | $0 | $0 |
| SSL Certificate | $0 | $0 |
| **TOTAL** | **$0** | **$0** |

---

## Migration Notes

**Current:** localStorage (test data only)
**Future:** Supabase PostgreSQL

**Migration Plan:**
- No migration needed (test data can be discarded)
- Start fresh with Supabase
- Manually re-enter any critical test data if needed

---

## Decisions Made

- ✅ No staging environment (test locally)
- ✅ No real-time sync (2-10 sec polling fine)
- ✅ No user permissions (shared data model)
- ✅ No API subdomain (Supabase hosts API)
- ✅ Free tier sufficient for current needs

---

## Google Authentication Implementation

### Overview

**Goal:** Replace "Load Test Data" with secure Google sign-in for 2 users (you + partner)

**Prerequisites:**
- Phase 0 complete (deployed to crm.axispoint.llc) ✅
- Phase 2 complete (Supabase integration working)
- SSL enabled (HTTPS required for OAuth) ✅
- Partner's Google email address

**Time Estimate:** 2-4 hours

---

### Step 1: Enable Google OAuth in Supabase

**In Supabase Dashboard:**
1. Go to: https://app.supabase.com/project/acwtflofdabmfpjdixmv
2. Click **"Authentication"** in left sidebar
3. Click **"Providers"**
4. Find **"Google"** and click **"Enable"**

**Create Google OAuth App:**
1. Go to: https://console.cloud.google.com
2. Create new project (or select existing)
3. Go to **"APIs & Services" → "Credentials"**
4. Click **"Create Credentials" → "OAuth 2.0 Client ID"**
5. Application type: **"Web application"**
6. Name: `NNN CRM Production`

**Authorized JavaScript origins:**
```
https://crm.axispoint.llc
```

**Authorized redirect URIs:**
```
https://acwtflofdabmfpjdixmv.supabase.co/auth/v1/callback
```

7. Click **"Create"**
8. Copy **Client ID** and **Client Secret**

**Configure in Supabase:**
1. Supabase → Authentication → Providers → Google
2. Paste **Client ID**
3. Paste **Client Secret**
4. Click **"Save"**

---

### Step 2: Update Database RLS Policies

**Supabase SQL Editor:**

```sql
-- Since you and your partner share everything, allow all authenticated users
-- But tracking which user created each record via user_id

DROP POLICY IF EXISTS "Allow all" ON properties;
DROP POLICY IF EXISTS "Allow all" ON brokers;
DROP POLICY IF EXISTS "Allow all" ON partners;
DROP POLICY IF EXISTS "Allow all" ON gatekeepers;
DROP POLICY IF EXISTS "Allow all" ON events;
DROP POLICY IF EXISTS "Allow all" ON follow_ups;
DROP POLICY IF EXISTS "Allow all" ON notes;

CREATE POLICY "Allow authenticated users full access" ON properties
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow authenticated users full access" ON brokers
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow authenticated users full access" ON partners
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow authenticated users full access" ON gatekeepers
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow authenticated users full access" ON events
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow authenticated users full access" ON follow_ups
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow authenticated users full access" ON notes
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

NOTIFY pgrst, 'reload schema';
```

---

### Step 3: Add Auth to App.jsx

**Add auth state management:**

```javascript
import { supabase } from './services/supabase';

export default function IndustrialCRM() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check auth state on mount
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          // Email whitelist check
          const allowedEmails = [
            'your.email@gmail.com',
            'partner.email@gmail.com'
          ];

          if (!allowedEmails.includes(session.user.email)) {
            await supabase.auth.signOut();
            alert('Access denied. This email is not authorized.');
            return;
          }
        }
        setUser(session?.user ?? null);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // Sign in with Google
  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: 'https://crm.axispoint.llc'
      }
    });
    if (error) console.error('Error signing in:', error);
  };

  // Sign out
  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) console.error('Error signing out:', error);
  };

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div>Loading...</div>
      </div>
    );
  }

  // Show login screen if not authenticated
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white mb-8">NNN CRM</h1>
          <button
            onClick={signInWithGoogle}
            className="bg-white text-gray-900 px-6 py-3 rounded-lg font-medium hover:bg-gray-100 transition"
          >
            Sign in with Google
          </button>
        </div>
      </div>
    );
  }

  // Main app (existing code continues here)
  return (
    <div className={darkMode ? 'dark' : ''}>
      {/* Add sign out button in header */}
      <div className="flex justify-between items-center p-4">
        <div>Logged in as: {user.email}</div>
        <button onClick={signOut} className="text-sm">
          Sign Out
        </button>
      </div>
      {/* Rest of existing app JSX */}
    </div>
  );
}
```

---

### Step 4: Update Data Operations

**Include user_id when creating records:**

```javascript
// Example: Creating a property
const { data, error } = await supabase
  .from('properties')
  .insert([{
    ...propertyData,
    user_id: user.id  // Add current user's ID
  }])
  .select()
  .single();
```

---

### Step 5: Remove Test Data Features

**Delete from App.jsx:**
- "Load Test Data" button
- "Clear All Data" button
- `loadTestData()` function
- `clearAllData()` function
- Test data arrays

**Keep:**
- All CRUD operations for individual records
- Supabase service layer
- Form components

---

### Step 6: Testing

**Single User Test:**
1. Visit https://crm.axispoint.llc
2. Click "Sign in with Google"
3. Authenticate with your Google account
4. Should see email in header
5. Add a property
6. Sign out and sign in again
7. Property should persist

**Multi-User Test:**
1. Sign in with your account → Add property
2. Sign out
3. Partner signs in with their account
4. Partner should see your property
5. Partner adds a broker
6. You sign in → Should see both property and broker

---

### Troubleshooting

**Error: redirect_uri_mismatch**
- **Fix:** Verify redirect URI in Google Console matches exactly:
  `https://acwtflofdabmfpjdixmv.supabase.co/auth/v1/callback`

**Error: Access denied**
- **Fix:** Add email to `allowedEmails` array in auth code

**User signs in then immediately signs out**
- **Fix:** Email whitelist is rejecting user - check array

**Data not appearing after sign-in**
- **Fix:** Verify RLS policies allow authenticated users (see Step 2)

---

### Security

**What's Secure:**
- ✅ OAuth handled by Supabase (industry standard)
- ✅ No passwords stored in app
- ✅ Session tokens managed securely
- ✅ HTTPS enforced (SSL certificate)
- ✅ Row Level Security at database level
- ✅ Email whitelist prevents unauthorized access

**What to Monitor:**
- ⚠️ Email whitelist is client-side (can be bypassed by advanced users)
- ⚠️ Shared data model means both users see everything
- ⚠️ Supabase anon key exposed in client (normal - RLS protects data)

**Future Enhancements:**
- Server-side email validation (Supabase Edge Functions)
- Audit log for data changes
- More granular permissions if needed
- Two-factor authentication for sensitive data

---

### Complete Auth Flow

```
User visits crm.axispoint.llc
         ↓
    No session found
         ↓
 Show "Sign in with Google" button
         ↓
    User clicks button
         ↓
Supabase redirects to Google OAuth
         ↓
   User authorizes app
         ↓
Google redirects to Supabase callback
         ↓
  Supabase creates session
         ↓
Redirect to crm.axispoint.llc
         ↓
  App checks email whitelist
         ↓
   Email allowed? → Yes → Show app
         ↓
        No → Sign out → Show denied message
```

---

**Status:** Documented
**Next:** Deploy authentication when Phase 2 is complete
