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

**Status:** Documented
**Next:** Deployment setup documentation
