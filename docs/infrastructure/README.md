# Infrastructure Documentation
**NNN CRM - Deployment & Backend Setup**

---

## Quick Links

| Document | Purpose | When to Use |
|----------|---------|-------------|
| **[CURRENT-STATUS.md](./CURRENT-STATUS.md)** | Current deployment state | Start here - check what's working |
| **[DEPLOYMENT-GUIDE.md](./DEPLOYMENT-GUIDE.md)** | Complete deployment procedures | Deploy code, rollback, troubleshooting |
| **[BACKEND-INFRASTRUCTURE.md](./BACKEND-INFRASTRUCTURE.md)** | Supabase database & Google Auth | Understand database schema, RLS, authentication |
| **[IMPLEMENTATION-PLAN.md](./IMPLEMENTATION-PLAN.md)** | Original roadmap | Historical context |
| **[DEPLOYMENT-SETUP.md](./DEPLOYMENT-SETUP.md)** | GitHub Actions & FTP setup | Already done - reference only |

---

## Current Project Status

### Phase 0: Static Deployment - COMPLETE
- Live at https://crm.axispoint.llc
- SSL enabled (HTTPS working)
- GitHub Actions auto-deploy working
- FTP deployment configured

### Phase 2: Supabase Integration - COMPLETE
- Database schema rebuilt with all App.jsx fields
- All entities persist to Supabase (Brokers, Partners, Gatekeepers, Properties, Events, Follow-ups)
- Column names match App.jsx exactly (camelCase preserved with quoted identifiers)
- RLS enabled with authenticated user policies

### Phase 3: Google Authentication - NOT STARTED
- Waiting for partner's Google email address
- Documentation complete (see BACKEND-INFRASTRUCTURE.md)
- Estimated 2-4 hours

---

## Quick Start Guides

### New to This Project?

**Read in this order:**
1. [CURRENT-STATUS.md](./CURRENT-STATUS.md) - Understand current state
2. [DEPLOYMENT-GUIDE.md](./DEPLOYMENT-GUIDE.md) - Learn deployment process
3. [BACKEND-INFRASTRUCTURE.md](./BACKEND-INFRASTRUCTURE.md) - Understand data layer

### Deploying Changes?

1. Make code changes
2. `git add . && git commit -m "Description"`
3. `git push origin main`
4. Watch deployment at https://github.com/PurplePean/NNN-CRM/actions
5. Verify at https://crm.axispoint.llc

### Applying Database Schema?

1. Open `sql/01-production-schema.sql`
2. Copy entire contents
3. Go to Supabase SQL Editor
4. Paste and run
5. Test "Load Test Data" at crm.axispoint.llc

### Need to Rollback?

1. Open [DEPLOYMENT-GUIDE.md](./DEPLOYMENT-GUIDE.md)
2. Go to "Rollback Procedures" section
3. Choose method (git revert, re-run workflow, manual)
4. Execute rollback

### Adding Authentication?

1. Ensure Phase 2 is working first!
2. Open [BACKEND-INFRASTRUCTURE.md](./BACKEND-INFRASTRUCTURE.md)
3. Go to "Google Authentication Implementation" section
4. Follow step-by-step guide
5. Estimated 2-4 hours

---

## Important URLs

### Production
- **Live Site:** https://crm.axispoint.llc
- **GitHub Repo:** https://github.com/PurplePean/NNN-CRM
- **GitHub Actions:** https://github.com/PurplePean/NNN-CRM/actions

### Infrastructure
- **Supabase Dashboard:** https://app.supabase.com/project/acwtflofdabmfpjdixmv
- **Supabase API URL:** https://acwtflofdabmfpjdixmv.supabase.co
- **cPanel:** https://axispoint.llc:2083

### Development
- **Local Dev:** http://localhost:3000 (after `npm start`)

---

## Database Tables

| Table | Description |
|-------|-------------|
| `brokers` | Real estate broker contacts with firm details |
| `partners` | Investment partners with check size, asset classes |
| `gatekeepers` | Key decision makers at partner organizations |
| `properties` | Property listings with financial analysis data |
| `events` | Calendar events, tours, meetings |
| `follow_ups` | Follow-up tasks and reminders |
| `notes` | Standalone notes for any entity |

See `sql/01-production-schema.sql` for complete schema with all columns.

---

## Configuration Reference

### GitHub Secrets
| Secret | Value | Purpose |
|--------|-------|---------|
| FTP_SERVER | 162.0.209.114 | Namecheap FTP IP |
| FTP_USERNAME | deploy@crm.axispoint.llc | FTP user |
| FTP_PASSWORD | (configured) | FTP password |
| REACT_APP_SUPABASE_URL | https://acwtflofdabmfpjdixmv.supabase.co | Supabase project |
| REACT_APP_SUPABASE_ANON_KEY | (configured) | Supabase public key |

### Local Environment (.env.local)
```bash
REACT_APP_SUPABASE_URL=https://acwtflofdabmfpjdixmv.supabase.co
REACT_APP_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## Troubleshooting Quick Reference

### App shows empty state
- Check browser console for errors
- Verify Supabase tables exist with correct schema
- Run `sql/01-production-schema.sql` in Supabase

### Deployment failed
- Check GitHub Actions logs
- See DEPLOYMENT-GUIDE.md "Monitoring & Logs"

### Can't connect to database
- Verify GitHub Secrets exist
- Check Supabase dashboard for downtime

### Changes not appearing on production
- Hard refresh browser (Cmd+Shift+R)
- Check GitHub Actions completed successfully

### Need to undo deployment
- See DEPLOYMENT-GUIDE.md "Rollback Procedures"

---

## Version History

| Date | Phase | Description |
|------|-------|-------------|
| Nov 18, 2025 | Phase 0 | Deployed static app to crm.axispoint.llc |
| Nov 18, 2025 | Phase 1 | Created Supabase project & tables |
| Nov 21, 2025 | Phase 2 | Schema rebuilt with all App.jsx fields |
| TBD | Phase 3 | Add Google OAuth authentication |

---

## Next Actions

### Immediate
1. Run `sql/01-production-schema.sql` in Supabase
2. Test "Load Test Data" at crm.axispoint.llc
3. Verify all CRUD operations work

### Short Term (Next Week)
1. Test multi-device data sync
2. Have partner test from their laptop
3. Get partner's Google email for Phase 3

### Medium Term (Next Month)
1. Implement Phase 3 (Google Auth)
2. Remove test data buttons
3. Add production data

---

## Support Resources

- **Namecheap Support:** https://www.namecheap.com/support/
- **Supabase Docs:** https://supabase.com/docs
- **Supabase Status:** https://status.supabase.com
- **GitHub Status:** https://www.githubstatus.com
- **Repository:** https://github.com/PurplePean/NNN-CRM
