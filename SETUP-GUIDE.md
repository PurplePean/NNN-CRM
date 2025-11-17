# NNN CRM - Complete Setup Guide
**Deployment & Backend Configuration**

---

## Overview

This guide walks you through setting up the complete deployment and backend infrastructure for the NNN CRM application.

**What you'll set up:**
- Supabase PostgreSQL database (backend)
- GitHub Actions CI/CD pipeline (auto-deployment)
- Production hosting on crm.axispoint.llc
- Google OAuth authentication

**Time required:** 2-4 hours
**Cost:** $0 (all free tier services)

---

## Prerequisites

Before you begin, ensure you have:

- [x] Namecheap hosting account with cPanel access
- [x] GitHub repository access (PurplePean/NNN-CRM)
- [x] Google account for OAuth
- [x] Partner's email address (for whitelist)

---

## Phase 1: Install Dependencies

### Step 1: Install Supabase Client

```bash
npm install
```

This will install the `@supabase/supabase-js` package that was added to `package.json`.

**Verify installation:**
```bash
npm list @supabase/supabase-js
```

You should see version `^2.39.0` or higher.

---

## Phase 2: Supabase Database Setup

### Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Click **"Start your project"**
3. Sign in with GitHub
4. Click **"New project"**
5. Fill in project details:
   - **Name:** `nnn-crm` (or your preferred name)
   - **Database Password:** Generate strong password (save this!)
   - **Region:** Choose closest to your users (e.g., US West)
   - **Pricing Plan:** Free
6. Click **"Create new project"**
7. Wait 2-3 minutes for project creation

### Step 2: Run Database Schema

1. In Supabase dashboard, click **"SQL Editor"** in left sidebar
2. Click **"New query"**
3. Open the file `docs/database/schema.sql` from this repository
4. Copy the entire SQL content
5. Paste into Supabase SQL Editor
6. Click **"Run"** (or press Cmd+Enter / Ctrl+Enter)
7. Wait for success message: "Success. No rows returned"

**Verify tables created:**
1. Click **"Table Editor"** in left sidebar
2. You should see 7 tables:
   - properties
   - brokers
   - partners
   - gatekeepers
   - events
   - follow_ups
   - notes

### Step 3: Get API Credentials

1. Click **"Settings"** (gear icon) in left sidebar
2. Click **"API"** under Project Settings
3. Copy the following values:
   - **Project URL:** `https://xxxxx.supabase.co`
   - **anon public key:** `eyJxxx...` (long string)

**Save these securely!** You'll need them in the next steps.

---

## Phase 3: Configure Environment Variables

### Step 1: Local Development Setup

Create a `.env.local` file in the project root:

```bash
cp .env.example .env.local
```

Edit `.env.local` and add your Supabase credentials:

```bash
REACT_APP_SUPABASE_URL=https://your-project.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your_anon_key_here
```

**Test local connection:**

```bash
npm start
```

Open browser DevTools console. You should NOT see any Supabase configuration errors.

### Step 2: GitHub Secrets Setup (for Production)

1. Go to [GitHub repository settings](https://github.com/PurplePean/NNN-CRM/settings/secrets/actions)
2. Click **"New repository secret"**
3. Add the following secrets one by one:

| Secret Name | Value | Where to get it |
|-------------|-------|----------------|
| `SUPABASE_URL` | `https://xxxxx.supabase.co` | Supabase Settings → API |
| `SUPABASE_ANON_KEY` | `eyJxxx...` | Supabase Settings → API |
| `FTP_SERVER` | `ftp.axispoint.llc` | Namecheap cPanel (see Phase 4) |
| `FTP_USERNAME` | `deploy@axispoint.llc` | Namecheap cPanel (see Phase 4) |
| `FTP_PASSWORD` | (from cPanel) | Namecheap cPanel (see Phase 4) |

**Important:** Never commit `.env.local` to git! It's already in `.gitignore`.

---

## Phase 4: Namecheap cPanel Configuration

### Step 1: Create Subdomain

1. Log into [Namecheap hosting dashboard](https://www.namecheap.com)
2. Click **"Manage"** next to your hosting plan
3. Click **"cPanel"**
4. Scroll to **"Domains"** section
5. Click **"Subdomains"**
6. Fill in:
   - **Subdomain:** `crm`
   - **Domain:** `axispoint.llc`
   - **Document Root:** `/public_html/crm` (auto-filled)
7. Click **"Create"**

### Step 2: Create FTP Deploy User

1. In cPanel, scroll to **"Files"** section
2. Click **"FTP Accounts"**
3. Click **"Add FTP Account"**
4. Fill in:
   - **Login:** `deploy` (will become `deploy@axispoint.llc`)
   - **Password:** Generate strong password (save this!)
   - **Directory:** `/public_html/crm`
   - **Quota:** Unlimited
5. Click **"Create FTP Account"**

**Save these credentials:**
- FTP Server: `ftp.axispoint.llc`
- FTP Username: `deploy@axispoint.llc`
- FTP Password: (the one you just generated)

### Step 3: Enable SSL Certificate

1. In cPanel, scroll to **"Security"** section
2. Click **"SSL/TLS Status"**
3. Find `crm.axispoint.llc` in the list
4. Click **"Run AutoSSL"**
5. Wait 5-10 minutes for SSL certificate installation

**Verify SSL:**
- Visit `https://crm.axispoint.llc`
- You should see a valid SSL certificate (green lock icon)

---

## Phase 5: GitHub Actions Deployment

The GitHub Actions workflow file is already created at `.github/workflows/deploy.yml`.

### Step 1: Verify GitHub Secrets

Make sure all 5 secrets are added (from Phase 3):
1. Go to [GitHub Secrets](https://github.com/PurplePean/NNN-CRM/settings/secrets/actions)
2. Verify you see:
   - SUPABASE_URL
   - SUPABASE_ANON_KEY
   - FTP_SERVER
   - FTP_USERNAME
   - FTP_PASSWORD

### Step 2: Trigger First Deployment

**Option A: Push to main branch**
```bash
git add .
git commit -m "Setup deployment and backend infrastructure"
git push origin main
```

**Option B: Manual trigger**
1. Go to [GitHub Actions](https://github.com/PurplePean/NNN-CRM/actions)
2. Click **"Deploy to Production"** workflow
3. Click **"Run workflow"** (right side)
4. Select branch: `main`
5. Click **"Run workflow"**

### Step 3: Monitor Deployment

1. Go to [GitHub Actions](https://github.com/PurplePean/NNN-CRM/actions)
2. Click on the running workflow
3. Watch the build progress (2-3 minutes)
4. Wait for green checkmark ✅

**If deployment fails:**
- Check the error logs in GitHub Actions
- Verify FTP credentials are correct
- Ensure cPanel directory exists: `/public_html/crm/`

### Step 4: Verify Production Deployment

1. Visit [crm.axispoint.llc](https://crm.axispoint.llc)
2. App should load successfully
3. Check browser console for errors
4. Verify Supabase connection (no config errors)

---

## Phase 6: Google OAuth Setup (Optional)

**Note:** You can skip this phase initially and add authentication later.

### Step 1: Enable Google Provider in Supabase

1. Go to Supabase dashboard
2. Click **"Authentication"** in left sidebar
3. Click **"Providers"**
4. Find **"Google"** and toggle it **ON**
5. Keep this page open (you'll need to paste credentials here)

### Step 2: Create Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Click **"Select a project"** → **"New Project"**
3. Name: `NNN CRM` → Click **"Create"**
4. Select the new project
5. Click **"APIs & Services"** → **"OAuth consent screen"**
6. User Type: **External** → Click **"Create"**
7. Fill in:
   - App name: `NNN CRM`
   - User support email: Your email
   - Developer contact: Your email
8. Click **"Save and Continue"** (skip scopes, test users)
9. Click **"Credentials"** in left sidebar
10. Click **"Create Credentials"** → **"OAuth client ID"**
11. Application type: **Web application**
12. Name: `NNN CRM Web`
13. Authorized redirect URIs:
    - Add: `https://your-project.supabase.co/auth/v1/callback`
    - (Replace `your-project` with your actual Supabase project URL)
14. Click **"Create"**
15. Copy **Client ID** and **Client Secret**

### Step 3: Configure Supabase Google Provider

1. Return to Supabase → Authentication → Providers → Google
2. Paste:
   - **Client ID:** (from Google Cloud Console)
   - **Client Secret:** (from Google Cloud Console)
3. Click **"Save"**

### Step 4: Add Email Whitelist

1. In Supabase → Authentication → Policies
2. Create RLS policies to restrict access to specific emails
3. Add your email and partner's email to whitelist

**Implementation Note:** You'll need to add authentication components to the React app. See `docs/infrastructure/BACKEND-INFRASTRUCTURE.md` for details.

---

## Phase 7: Testing

### Test Checklist

**Local Development:**
- [ ] `npm start` runs without errors
- [ ] Can connect to Supabase (check console)
- [ ] No environment variable warnings

**Production:**
- [ ] Site loads at crm.axispoint.llc
- [ ] SSL certificate is valid (green lock)
- [ ] No console errors
- [ ] Supabase connection works

**Deployment:**
- [ ] Push to main triggers auto-deploy
- [ ] Deployment completes in 2-3 minutes
- [ ] Changes appear on production site

---

## Troubleshooting

### Supabase connection fails

**Error:** "Missing Supabase environment variables"

**Fix:**
1. Verify `.env.local` exists and has correct values
2. Restart dev server: `npm start`
3. Check environment variables start with `REACT_APP_`

### GitHub Actions deployment fails

**Error:** "FTP connection failed"

**Fix:**
1. Verify FTP credentials in GitHub Secrets
2. Test FTP connection manually (FileZilla)
3. Check cPanel directory exists: `/public_html/crm/`

### SSL certificate not working

**Error:** "Your connection is not private"

**Fix:**
1. Wait 10-15 minutes for AutoSSL to complete
2. Run AutoSSL again in cPanel
3. Contact Namecheap support if issue persists

### Build succeeds but site shows old version

**Fix:**
1. Hard refresh browser: Ctrl+Shift+R (Cmd+Shift+R on Mac)
2. Check FTP uploaded files correctly
3. Verify cPanel shows new files in `/public_html/crm/`

---

## Next Steps

After completing this setup:

1. **Integrate Services into React App**
   - Replace localStorage calls with Supabase service calls
   - Add loading states and error handling
   - See example usage in service files

2. **Add Authentication**
   - Create Login component
   - Protect routes
   - Add sign-out functionality

3. **Test with Partner**
   - Share production URL
   - Add partner's email to whitelist
   - Test data sync between users

4. **Monitor Usage**
   - Check Supabase dashboard for API usage
   - Monitor GitHub Actions for deployment success
   - Set up error tracking (optional: Sentry)

---

## File Structure

After setup, your project structure will include:

```
NNN-CRM/
├── .github/
│   └── workflows/
│       └── deploy.yml          # ✅ CI/CD pipeline
├── docs/
│   ├── database/
│   │   └── schema.sql          # ✅ Database schema
│   └── infrastructure/
│       ├── BACKEND-INFRASTRUCTURE.md
│       ├── DEPLOYMENT-SETUP.md
│       └── IMPLEMENTATION-PLAN.md
├── src/
│   ├── services/
│   │   ├── supabase.js         # ✅ Client config
│   │   ├── properties.js       # ✅ Property CRUD
│   │   ├── contacts.js         # ✅ Contacts CRUD
│   │   ├── events.js           # ✅ Events CRUD
│   │   ├── followUps.js        # ✅ Follow-ups CRUD
│   │   ├── notes.js            # ✅ Notes CRUD
│   │   └── index.js            # ✅ Exports
│   └── ...
├── .env.example                # ✅ Template
├── .env.local                  # ✅ Local config (git-ignored)
├── .env.production             # ✅ Production config
├── package.json                # ✅ Updated with Supabase
└── SETUP-GUIDE.md              # ✅ This file
```

---

## Support

**Issues?**
- Check troubleshooting section above
- Review error logs in GitHub Actions
- Check Supabase dashboard for API errors
- Open GitHub issue with error details

**Additional Resources:**
- [Supabase Documentation](https://supabase.com/docs)
- [GitHub Actions Documentation](https://docs.github.com/actions)
- [React Documentation](https://react.dev)

---

**Status:** Ready to deploy
**Last Updated:** 2025-11-17
**Version:** 1.0.0
