# Infrastructure Documentation
**NNN CRM - Deployment & Backend Setup**

---

## Quick Links

| Document | Purpose | When to Use |
|----------|---------|-------------|
| **[CURRENT-STATUS.md](./CURRENT-STATUS.md)** | Current deployment state & issues | Start here - check what's working/broken |
| **[DEPLOYMENT-GUIDE.md](./DEPLOYMENT-GUIDE.md)** | Complete deployment procedures | Deploy code, rollback, troubleshooting |
| **[BACKEND-INFRASTRUCTURE.md](./BACKEND-INFRASTRUCTURE.md)** | Supabase database & Google Auth | Understand database schema, RLS, authentication |
| **[IMPLEMENTATION-PLAN.md](./IMPLEMENTATION-PLAN.md)** | Original roadmap | Historical context |
| **[DEPLOYMENT-SETUP.md](./DEPLOYMENT-SETUP.md)** | GitHub Actions & FTP setup | Already done - reference only |

---

## Documentation Overview

### 📊 CURRENT-STATUS.md
**Read this first!**

- What's deployed and working right now
- Known issues with Phase 2 (Supabase integration)
- Step-by-step fix for column name mismatch
- Rollback procedures if needed
- Next steps to complete setup

**Use when:**
- Starting a new session
- Troubleshooting issues
- Need quick status check
- Planning next steps

---

### 🚀 DEPLOYMENT-GUIDE.md
**Comprehensive deployment reference**

- GitHub Actions workflow explained
- How to deploy (automatic & manual)
- Environment variables setup
- FTP configuration details
- Rollback procedures (4 methods)
- Monitoring & logs
- Common deployment scenarios
- Pre/post-deployment checklists

**Use when:**
- Deploying code changes
- Setting up CI/CD for first time
- Need to rollback deployment
- Troubleshooting deployment failures
- Updating dependencies

---

### 🗄️ BACKEND-INFRASTRUCTURE.md
**Database & API reference + Google Authentication**

- Complete database schema (7 tables)
- SQL table creation scripts
- Row Level Security policies
- Supabase service layer structure
- API usage examples
- Environment variables
- **Google OAuth setup (step-by-step)**
- **Auth state management code**
- **Email whitelist implementation**
- **Multi-user testing procedures**

**Use when:**
- Understanding database structure
- Adding new fields to tables
- Modifying RLS policies
- Creating new API services
- Debugging data issues
- **Ready to add Google sign-in**
- **Implementing authentication**

---

### 📋 IMPLEMENTATION-PLAN.md
**Original roadmap & planning**

- 5-phase implementation breakdown
- Time estimates for each phase
- Prerequisites and requirements
- Risk assessment
- Historical context

**Use when:**
- Planning future work
- Estimating time for features
- Understanding original design decisions
- Onboarding new developers

---

### ⚙️ DEPLOYMENT-SETUP.md
**Initial setup (already completed)**

- GitHub Actions workflow creation
- cPanel FTP configuration
- GitHub Secrets setup
- Manual deployment procedures

**Use when:**
- Setting up from scratch (new environment)
- Reference for how things were configured
- Recreating setup if repo moved

---

## Current Project Status

### ✅ Phase 0: Static Deployment
**Status:** COMPLETE

- Live at https://crm.axispoint.llc
- SSL enabled (HTTPS working)
- GitHub Actions auto-deploy working
- FTP deployment configured

### ⚠️ Phase 2: Supabase Integration
**Status:** DEPLOYED BUT NOT WORKING

**Issue:** PostgreSQL column name case-sensitivity mismatch

- Code deployed with Supabase integration
- Database tables created but missing some columns
- Test data load fails with "column not found" errors
- App falls back to localStorage (still functional)

**Fix:** Run SQL in CURRENT-STATUS.md to recreate tables with proper column names

### ❌ Phase 1: Supabase Setup
**Status:** PARTIALLY COMPLETE

- Supabase project created ✅
- Tables created (but need schema fix) ⚠️
- RLS policies configured ✅
- API credentials in GitHub Secrets ✅

### ⬜ Phase 3: Google Authentication
**Status:** NOT STARTED

- Waiting for Phase 2 to be fully working
- Documentation complete (see BACKEND-INFRASTRUCTURE.md)
- Estimated 2-4 hours once Phase 2 works

---

## Quick Start Guides

### 🆕 New to This Project?

**Read in this order:**
1. [CURRENT-STATUS.md](./CURRENT-STATUS.md) - Understand current state
2. [DEPLOYMENT-GUIDE.md](./DEPLOYMENT-GUIDE.md) - Learn deployment process
3. [BACKEND-INFRASTRUCTURE.md](./BACKEND-INFRASTRUCTURE.md) - Understand data layer

### 🐛 Fixing Phase 2 Issues?

1. Open [CURRENT-STATUS.md](./CURRENT-STATUS.md)
2. Go to "How to Fix Phase 2" section
3. Run the SQL in Supabase
4. Test at https://crm.axispoint.llc

### 🚀 Deploying Changes?

1. Make code changes
2. `git add . && git commit -m "Description"`
3. `git push origin main`
4. Watch deployment at https://github.com/PurplePean/NNN-CRM/actions
5. Verify at https://crm.axispoint.llc

### 🔙 Need to Rollback?

1. Open [DEPLOYMENT-GUIDE.md](./DEPLOYMENT-GUIDE.md)
2. Go to "Rollback Procedures" section
3. Choose method (git revert, re-run workflow, manual)
4. Execute rollback

### 🔐 Adding Authentication?

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

## Configuration Reference

### GitHub Secrets
| Secret | Value | Purpose |
|--------|-------|---------|
| FTP_SERVER | 162.0.209.114 | Namecheap FTP IP |
| FTP_USERNAME | deploy@crm.axispoint.llc | FTP user |
| FTP_PASSWORD | rYzjyb-kimtes-0sywky | FTP password |
| REACT_APP_SUPABASE_URL | https://acwtflofdabmfpjdixmv.supabase.co | Supabase project |
| REACT_APP_SUPABASE_ANON_KEY | eyJhbGc... | Supabase public key |

### Local Environment (.env.local)
```bash
REACT_APP_SUPABASE_URL=https://acwtflofdabmfpjdixmv.supabase.co
REACT_APP_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Database Tables
- `properties` - Property listings
- `brokers` - Broker contacts
- `partners` - Investment partners
- `gatekeepers` - Decision makers
- `events` - Calendar events
- `follow_ups` - Follow-up tasks
- `notes` - Contact notes

---

## Troubleshooting Quick Reference

### App shows empty state
→ Check CURRENT-STATUS.md "Phase 2 Issues"
→ Supabase tables likely need schema fix

### Deployment failed
→ Check GitHub Actions logs
→ See DEPLOYMENT-GUIDE.md "Monitoring & Logs"

### Can't connect to database
→ Verify GitHub Secrets exist
→ Check Supabase dashboard for downtime

### Changes not appearing on production
→ Hard refresh browser (Cmd+Shift+R)
→ Check GitHub Actions completed successfully

### Need to undo deployment
→ See DEPLOYMENT-GUIDE.md "Rollback Procedures"
→ Choose fastest method for situation

---

## Maintenance Schedule

### Daily
- Monitor https://crm.axispoint.llc for availability

### Weekly
- Check GitHub Actions for failed deployments
- Review Supabase dashboard for errors

### Monthly
- Review Supabase database size (500MB limit)
- Check SSL certificate status
- Run `npm audit` for security updates

### As Needed
- Update dependencies when security patches released
- Review and archive old data
- Optimize database queries if slow

---

## Getting Help

### Documentation Issues
If documentation is unclear or outdated:
1. Check CURRENT-STATUS.md first
2. Review recent commits for changes
3. Test in development before production

### Technical Issues
**GitHub Actions failures:**
- Check logs at /actions
- See DEPLOYMENT-GUIDE.md troubleshooting

**Supabase issues:**
- Check status.supabase.com
- Review RLS policies
- Verify API keys

**Deployment issues:**
- See DEPLOYMENT-GUIDE.md
- Check FTP credentials
- Verify SSL certificate

### Emergency Contacts
- **Namecheap Support:** https://www.namecheap.com/support/
- **Supabase Status:** https://status.supabase.com
- **GitHub Status:** https://www.githubstatus.com

---

## Version History

| Date | Phase | Description |
|------|-------|-------------|
| Nov 18, 2025 | Phase 0 | Deployed static app to crm.axispoint.llc |
| Nov 18, 2025 | Phase 1 | Created Supabase project & tables |
| Nov 18, 2025 | Phase 2 | Deployed Supabase integration (needs fix) |
| TBD | Phase 2 Fix | Fix PostgreSQL column schema |
| TBD | Phase 3 | Add Google OAuth authentication |

---

## Next Actions

### Immediate (To Complete Phase 2)
1. ✅ Read CURRENT-STATUS.md
2. ⏳ Run SQL to fix database schema
3. ⏳ Test "Load Test Data" at crm.axispoint.llc
4. ⏳ Verify data in Supabase tables

### Short Term (Next Week)
1. Complete Phase 2 (fix schema)
2. Test multi-device data sync
3. Have partner test from their laptop
4. Verify data persists correctly

### Medium Term (Next Month)
1. Implement Phase 3 (Google Auth)
2. Remove test data buttons
3. Add production data
4. Train partner on using system

### Long Term (Future)
1. Real-time updates (Supabase Realtime)
2. Document uploads (Supabase Storage)
3. Email notifications
4. Advanced analytics
5. Mobile app (React Native)

---

## Document Maintenance

**Keep Updated:**
- CURRENT-STATUS.md (after each phase)
- This README (when adding new docs)

**Archive When Obsolete:**
- Old implementation plans
- Temporary troubleshooting notes

**Never Delete:**
- DEPLOYMENT-GUIDE.md (permanent reference)
- BACKEND-INFRASTRUCTURE.md (permanent reference)

---

## Contact & Support

**Repository:** https://github.com/PurplePean/NNN-CRM

**For Issues:**
- Production down: Check GitHub Actions & Namecheap
- Data problems: Check Supabase dashboard
- Code issues: Check browser console & logs

**For Questions:**
- Read relevant documentation first
- Check CURRENT-STATUS.md for known issues
- Test in local environment before production
