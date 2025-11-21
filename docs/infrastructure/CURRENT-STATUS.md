# Current Deployment Status
**NNN CRM - As of November 21, 2025**

---

## What's Working

### Phase 0: Static Deployment - COMPLETE
- **Live URL:** https://crm.axispoint.llc
- **SSL:** Enabled and working
- **GitHub Actions:** Auto-deploys on push to `main`
- **Build:** Compiles successfully with CI=false for ESLint warnings
- **FTP Deployment:** Working correctly to Namecheap

### Phase 2: Supabase Integration - COMPLETE
- **Database:** PostgreSQL running on Supabase
- **Tables:** 7 tables created with proper schema
- **Schema:** All column names match App.jsx exactly (camelCase preserved)
- **Row Level Security:** Enabled on all tables
- **Policies:** Authenticated users have full access (shared data model)

### GitHub Secrets Configured
- `FTP_SERVER`: 162.0.209.114
- `FTP_USERNAME`: deploy@crm.axispoint.llc
- `FTP_PASSWORD`: (configured)
- `REACT_APP_SUPABASE_URL`: https://acwtflofdabmfpjdixmv.supabase.co
- `REACT_APP_SUPABASE_ANON_KEY`: (configured)

---

## Test Results

### Data Persistence - All Working
| Entity | Create | Read | Update | Delete |
|--------|--------|------|--------|--------|
| Brokers | Pass | Pass | Pass | Pass |
| Partners | Pass | Pass | Pass | Pass |
| Gatekeepers | Pass | Pass | Pass | Pass |
| Properties | Pass | Pass | Pass | Pass |
| Events | Pass | Pass | Pass | Pass |
| Follow-ups | Pass | Pass | Pass | Pass |

### Load Test Data Function
- Successfully inserts sample data to Supabase
- 5 properties, 4 brokers, 4 partners, 3 gatekeepers, 4 follow-ups, 5 events

### Data Sync
- Data persists across browser refreshes
- Data syncs between devices when logged into same account

---

## Database Schema

The complete schema is in `sql/01-production-schema.sql` and includes all fields from App.jsx:

### Tables
| Table | Primary Fields |
|-------|---------------|
| brokers | name, email, phone, firmName, firmWebsite, crexiLink, licenseNumber |
| partners | name, entityName, email, phone, checkSize, assetClasses, creExperience |
| gatekeepers | name, title, email, phone, company, relatedTo |
| properties | address, squareFeet, purchasePrice, ltvPercent, interestRate, brokerIds |
| events | title, type, date, location, description |
| follow_ups | contactName, type, dueDate, priority, notes, status |
| notes | entityType, entityId, content, category |

### To Apply Schema
Run `sql/01-production-schema.sql` in Supabase SQL Editor:
1. Go to https://app.supabase.com/project/acwtflofdabmfpjdixmv
2. Open SQL Editor
3. Paste contents of `sql/01-production-schema.sql`
4. Click "Run"

---

## Architecture Overview

```
+---------------------------------------------+
|  crm.axispoint.llc (Namecheap Stellar)      |
|  - React App (Static Files)                 |
|  - SSL via AutoSSL                          |
+---------------------+-----------------------+
                      | HTTPS API Calls
                      v
+---------------------------------------------+
|  Supabase PostgreSQL (Free Tier)            |
|  - 7 Tables (properties, brokers, etc.)     |
|  - Row Level Security                       |
|  - Automatic Backups                        |
+---------------------+-----------------------+
                      | OAuth (Phase 3)
                      v
+---------------------------------------------+
|  Google Authentication (Not Started)        |
|  - Email Whitelist (2 users)                |
+---------------------------------------------+
```

---

## Next Steps

### Phase 3: Google Authentication (Not Started)

**Prerequisites:**
- Phase 2 must be working (done)
- SSL must be enabled (done)
- Partner's Google email address

**What Phase 3 Involves:**
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

## Rollback Procedures

### If Something Breaks

**Quick Rollback (Revert Last Commit):**
```bash
git revert HEAD
git push origin main
```
GitHub Actions will auto-deploy the previous working version in ~3-5 minutes.

**Manual Deployment (Emergency):**
1. Locally: `npm run build`
2. cPanel File Manager -> /home/axisipak/crm.axispoint.llc/
3. Delete all files except `.well-known/` and `cgi-bin/`
4. Upload contents of `build/` folder
5. Site restored in ~1 minute

---

## Support Resources

- **Namecheap Support:** For cPanel, FTP, SSL issues
- **Supabase Docs:** https://supabase.com/docs
- **GitHub Actions Logs:** https://github.com/PurplePean/NNN-CRM/actions
- **Repository:** https://github.com/PurplePean/NNN-CRM
