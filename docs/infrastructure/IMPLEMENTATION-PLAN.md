# Implementation Plan
**NNN CRM - Complete Setup Roadmap**

---

## Goal

Transform localhost-only CRM into multi-user cloud application accessible at crm.axispoint.llc

---

## Current State

- React app on local Mac
- localStorage for data (test data only)
- Single user access
- Manual testing only

---

## Target State

- Deployed at crm.axispoint.llc
- 2 users (remote laptops)
- Supabase cloud database (shared data)
- Google OAuth authentication
- Auto-deploy via GitHub Actions
- Manual rollback capability

---

## Prerequisites

**You have:**
- ✅ Namecheap Stellar hosting
- ✅ Domain: axispoint.llc
- ✅ GitHub repository
- ✅ Google account

**You need:**
- Partner's Google email (for whitelist)
- ~1-2 weeks of implementation time
- cPanel access credentials

---

## Implementation Phases

### Phase 0: Deploy Static App
**Time:** 30 minutes
**Status:** Not started

**Tasks:**
1. Access Namecheap cPanel
2. Create `crm.axispoint.llc` subdomain
3. Create FTP deploy user
4. Enable SSL (AutoSSL)
5. Build React app locally (`npm run build`)
6. Upload build/ to `/public_html/crm/` via cPanel File Manager

**Result:**
- ✅ App accessible at crm.axispoint.llc
- ⚠️ Still uses localStorage (not shared yet)
- ⚠️ No authentication

**Validation:**
- Visit crm.axispoint.llc
- App loads and works
- Can add test property

**Documentation:** [DEPLOYMENT-SETUP.md](./DEPLOYMENT-SETUP.md) - Section: Manual Deployment

---

### Phase 1: Supabase Setup
**Time:** 2-4 hours
**Status:** Not started
**Depends on:** Phase 0 (optional)

**Tasks:**
1. Create Supabase account (supabase.com)
2. Create new project
3. Save database password
4. Copy SQL from BACKEND-INFRASTRUCTURE.md
5. Run SQL in Supabase SQL Editor (creates 7 tables)
6. Go to Settings → API
7. Copy `SUPABASE_URL` and `SUPABASE_ANON_KEY`

**Result:**
- ✅ PostgreSQL database with 7 tables
- ✅ API credentials ready
- ⚠️ App not connected yet

**Validation:**
- Check Supabase dashboard shows 7 tables
- API credentials copied safely

**Documentation:** [BACKEND-INFRASTRUCTURE.md](./BACKEND-INFRASTRUCTURE.md)

---

### Phase 2: Connect App to Supabase
**Time:** 1-2 days (6-12 hours)
**Status:** Not started
**Depends on:** Phase 1

**Tasks:**

**Day 1:**
1. Install Supabase client: `npm install @supabase/supabase-js`
2. Create `.env.local` with Supabase credentials
3. Create `src/services/supabase.js` (client initialization)
4. Create `src/services/properties.js` (getAll, create, update, delete)
5. Test: Replace ONE localStorage call with Supabase in App.jsx
6. Verify data saves to Supabase

**Day 2:**
7. Create `src/services/contacts.js` (brokers, partners, gatekeepers)
8. Create `src/services/events.js`
9. Create `src/services/followUps.js`
10. Create `src/services/notes.js`
11. Replace ALL localStorage calls in App.jsx with Supabase calls
12. Add loading states (spinners while fetching)
13. Add error handling (try/catch, show error messages)
14. Test all CRUD operations

**Result:**
- ✅ App reads/writes to Supabase
- ✅ Data persists in cloud
- ✅ Both users see same data
- ⚠️ No authentication yet (anyone can access if they know URL)

**Validation:**
- Add property → Check Supabase dashboard shows it
- Refresh page → Data still there
- Open in different browser → Same data appears

**Documentation:** [BACKEND-INFRASTRUCTURE.md](./BACKEND-INFRASTRUCTURE.md) - Section: API Service Layer

---

### Phase 3: Google Authentication
**Time:** 2-4 hours
**Status:** Not started
**Depends on:** Phase 2

**Tasks:**
1. Supabase dashboard → Authentication → Providers
2. Enable Google provider
3. Go to Google Cloud Console (console.cloud.google.com)
4. Create new project "NNN CRM"
5. Enable Google+ API
6. Create OAuth 2.0 credentials
7. Add authorized redirect URI: `https://yourproject.supabase.co/auth/v1/callback`
8. Copy Client ID and Client Secret
9. Paste into Supabase Google provider settings
10. In React app, create `src/components/Login.jsx`
11. Add Supabase auth flow (signInWithOAuth)
12. Protect routes (redirect to login if not authenticated)
13. Add your email to Supabase Auth → Policies
14. Add partner's email
15. Test login/logout

**Result:**
- ✅ Google "Sign in" button
- ✅ Only whitelisted emails can access
- ✅ Session persists

**Validation:**
- Sign in with your Google → Works
- Sign in with random email → Denied
- Sign out → Redirected to login

**Documentation:** [BACKEND-INFRASTRUCTURE.md](./BACKEND-INFRASTRUCTURE.md) - Section: Authentication

---

### Phase 4: GitHub Actions Deployment
**Time:** 3-4 hours
**Status:** Not started
**Depends on:** Phase 0 (cPanel setup)

**Tasks:**
1. Get FTP credentials from Phase 0
2. Go to GitHub → Settings → Secrets and variables → Actions
3. Add secrets:
   - FTP_SERVER
   - FTP_USERNAME
   - FTP_PASSWORD
   - SUPABASE_URL
   - SUPABASE_ANON_KEY
4. Create `.github/workflows/deploy.yml`
5. Copy workflow from DEPLOYMENT-SETUP.md
6. Commit and push to main branch
7. Go to GitHub Actions tab
8. Watch first deployment
9. Fix any errors
10. Verify site updated at crm.axispoint.llc

**Result:**
- ✅ Push to main → Auto-deploys
- ✅ Version tags created
- ✅ Can rollback via re-run

**Validation:**
- Make small code change
- Push to main
- Wait 2-3 minutes
- Check crm.axispoint.llc shows change

**Documentation:** [DEPLOYMENT-SETUP.md](./DEPLOYMENT-SETUP.md)

---

### Phase 5: Testing & Handoff
**Time:** 2-3 hours
**Status:** Not started
**Depends on:** All previous phases

**Tasks:**
1. Test all features:
   - Add/edit/delete property
   - Add/edit/delete contacts
   - Add notes
   - Add events/follow-ups
   - Financial calculations work
   - Dark mode works
2. Test with partner:
   - Partner signs in with Google
   - Partner adds property
   - You see it (refresh page)
   - You add property
   - Partner sees it
3. Test rollback:
   - Push broken code
   - Rollback via GitHub Actions re-run
4. Document for partner:
   - How to access: crm.axispoint.llc
   - How to sign in
   - How to report issues

**Result:**
- ✅ Both users can work independently
- ✅ Data syncs between users
- ✅ Production-ready

**Validation:**
- Both users successfully using CRM
- No data loss
- Performance acceptable (2-10 sec sync)

---

## Timeline Options

### Option A: Fast Track (Full-time)
- **Week 1:** Phases 0-2 (Deploy + Supabase integration)
- **Week 2:** Phases 3-5 (Auth + CI/CD + Testing)
- **Total:** 2 weeks full-time

### Option B: Part-time (Evenings/Weekends)
- **Week 1:** Phase 0-1 (Deploy + Supabase setup)
- **Week 2:** Phase 2 (Connect app)
- **Week 3:** Phase 3 (Auth)
- **Week 4:** Phase 4-5 (CI/CD + Testing)
- **Total:** 4 weeks part-time (10-15 hrs/week)

### Option C: Minimal Viable (Skip CI/CD)
- **Week 1:** Phases 0-2 (Deploy + Supabase)
- **Week 2:** Phase 3 (Auth)
- Skip Phase 4 (deploy manually for now)
- **Total:** 2 weeks, add CI/CD later

---

## Rollback Plan

**Per Phase:**

| Phase | Rollback Method | Time |
|-------|----------------|------|
| Phase 0 | Delete subdomain, start over | 5 min |
| Phase 1 | Delete Supabase project | 1 min |
| Phase 2 | Git revert commits | 5 min |
| Phase 3 | Disable Google auth provider | 2 min |
| Phase 4 | Delete workflow file | 1 min |

**Nothing is permanent. All phases reversible.**

---

## Risk Assessment

### Low Risk
- Phase 0 (Deploy static) - Can't break existing setup
- Phase 1 (Supabase setup) - Separate from app
- Phase 4 (CI/CD) - Just automates what you do manually

### Medium Risk
- Phase 2 (Connect to Supabase) - Changes how app works
- **Mitigation:** Test thoroughly, can revert to localStorage

### Minimal Risk
- Phase 3 (Auth) - Just adds login screen
- **Mitigation:** Can disable temporarily if issues

---

## Success Criteria

**Must have:**
- ✅ Both users can access crm.axispoint.llc
- ✅ Data persists across sessions
- ✅ Data shared between users
- ✅ Secure Google login
- ✅ Can add/edit/delete properties and contacts

**Nice to have:**
- ✅ Auto-deploy on push
- ✅ Easy rollback
- ✅ Error tracking (Sentry)

**Can skip:**
- Staging environment
- Automated tests
- Performance monitoring

---

## Dependencies

**Phase dependencies:**
```
Phase 0 (Deploy) ─────┐
                      ├─→ Phase 4 (CI/CD)
Phase 1 (Supabase) ───┤
                      ├─→ Phase 2 (Connect) ─→ Phase 3 (Auth) ─→ Phase 5 (Testing)
                      │
                      └─→ Can do in parallel
```

**External dependencies:**
- cPanel access
- Supabase account
- Google Cloud Console access
- Partner's email address

---

## Cost Summary

**Setup:** $0
**Monthly:** $0
**Annual:** $0

**All services use free tiers:**
- Namecheap hosting (already paying)
- Supabase free tier (500MB)
- GitHub Actions free tier (2K min/month)
- Google OAuth (free)

**Upgrade only if:**
- Exceed 500MB database (unlikely)
- Free tier pauses (use it weekly to prevent)

---

## Documentation References

- **Backend & Infrastructure:** [BACKEND-INFRASTRUCTURE.md](./BACKEND-INFRASTRUCTURE.md)
- **Deployment Setup:** [DEPLOYMENT-SETUP.md](./DEPLOYMENT-SETUP.md)

---

## Next Steps

**Immediate:**
1. Review this plan
2. Confirm timeline (Option A, B, or C)
3. Get partner's Google email
4. Schedule Phase 0 (30 min to start)

**Then:**
5. Execute phases sequentially
6. Test after each phase
7. Document any issues

---

**Status:** Planning complete
**Ready to start:** Yes (pending timeline decision)
**Estimated completion:** 1-4 weeks depending on timeline option
