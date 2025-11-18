# Deployment Guide
**NNN CRM - Production Deployment & Maintenance**

---

## Quick Reference

- **Production URL:** https://crm.axispoint.llc
- **Deployment Method:** GitHub Actions (automatic on push to `main`)
- **Hosting:** Namecheap Stellar (162.0.209.114)
- **Database:** Supabase PostgreSQL (https://acwtflofdabmfpjdixmv.supabase.co)
- **Actions Dashboard:** https://github.com/PurplePean/NNN-CRM/actions

---

## Deployment Workflow

### Automatic Deployment (Primary Method)

**Trigger:** Any push to `main` branch

```bash
# Make changes locally
git add .
git commit -m "Your commit message"
git push origin main
```

**What Happens:**
1. GitHub Actions triggers (watch at /actions)
2. Checkout code from main branch
3. Setup Node.js 18
4. Install dependencies (`npm ci`)
5. Build React app with environment variables
6. Deploy to Namecheap via FTP
7. Completion notification

**Duration:** 3-5 minutes

**Monitoring:**
- Go to https://github.com/PurplePean/NNN-CRM/actions
- Click on the latest workflow run
- Watch each step in real-time
- Green checkmarks = success
- Red X = failure (check logs)

### Manual Deployment Trigger

**When to use:** Deploy without code changes (e.g., after fixing Supabase schema)

**Steps:**
1. Go to: https://github.com/PurplePean/NNN-CRM/actions/workflows/deploy.yml
2. Click "Run workflow" button
3. Select branch: `main`
4. Click green "Run workflow" button
5. Watch deployment progress

### Feature Branch Deployment

**For testing before merging to main:**

```bash
# Create feature branch
git checkout -b feature/your-feature-name

# Make changes
git add .
git commit -m "Description of changes"
git push -u origin feature/your-feature-name

# Create Pull Request on GitHub
# Review changes
# Merge to main (triggers auto-deployment)
```

**Branch naming convention:**
- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation only
- `refactor/` - Code refactoring

---

## Environment Variables

### GitHub Secrets (Required)

Configure at: https://github.com/PurplePean/NNN-CRM/settings/secrets/actions

| Secret Name | Value | Purpose |
|------------|-------|---------|
| `FTP_SERVER` | 162.0.209.114 | Namecheap FTP server IP |
| `FTP_USERNAME` | deploy@crm.axispoint.llc | FTP deployment user |
| `FTP_PASSWORD` | rYzjyb-kimtes-0sywky | FTP password |
| `REACT_APP_SUPABASE_URL` | https://acwtflofdabmfpjdixmv.supabase.co | Supabase project URL |
| `REACT_APP_SUPABASE_ANON_KEY` | eyJhbGc... | Supabase public API key |

### Local Development (.env.local)

**Never commit this file!** Already in `.gitignore`.

```bash
# Create in project root
REACT_APP_SUPABASE_URL=https://acwtflofdabmfpjdixmv.supabase.co
REACT_APP_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFjd3RmbG9mZGFibWZwamRpeG12Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM0MTk5MzAsImV4cCI6MjA3ODk5NTkzMH0.8W-fqEUmrOhU1OjSIbJKguRJQ2N1yuJz3yg_jQl5b-A
```

**After creating .env.local:**
```bash
# Restart dev server
npm start
```

---

## Build Process

### Local Build (Testing)

```bash
# Install dependencies
npm install

# Run build
npm run build

# Test build output
ls -la build/
# Should see: index.html, static/, asset-manifest.json

# Serve locally to test
npx serve -s build
# Open http://localhost:3000
```

**Build includes:**
- Optimized production JavaScript (minified)
- CSS bundled and minified
- Source maps disabled (GENERATE_SOURCEMAP=false)
- ESLint warnings ignored (CI=false)
- Supabase environment variables baked in

### Build Artifacts

**build/ directory structure:**
```
build/
├── index.html
├── asset-manifest.json
└── static/
    ├── css/
    │   └── main.[hash].css
    └── js/
        └── main.[hash].js
```

---

## FTP Deployment Details

### FTP Configuration

**Action Used:** SamKirkland/FTP-Deploy-Action@4.3.3

**Settings:**
- `local-dir`: ./build/ (trailing slash important!)
- `server-dir`: ./ (FTP user home is already /home/axisipak/crm.axispoint.llc/)
- `dangerous-clean-slate`: false (don't delete everything first)
- `exclude`: .htaccess, .well-known/, cgi-bin/

### Files Deployed

**Deployed to:** /home/axisipak/crm.axispoint.llc/

```
/home/axisipak/crm.axispoint.llc/
├── index.html
├── asset-manifest.json
├── static/
│   ├── css/
│   └── js/
├── .well-known/ (preserved, not overwritten)
└── cgi-bin/ (preserved, not overwritten)
```

### FTP Troubleshooting

**Error: getaddrinfo ENOTFOUND**
- Cause: FTP hostname not resolving
- Fix: Use IP address (162.0.209.114) instead of hostname

**Error: 403 Forbidden**
- Cause: Incorrect credentials or IP address
- Fix: Verify GitHub Secrets are correct

**Files uploaded to wrong location**
- Cause: `server-dir` includes full path when FTP user home is already set
- Fix: Use `server-dir: ./` instead of full path

---

## SSL Certificate

### Current Status
- ✅ SSL Enabled
- ✅ HTTPS working at https://crm.axispoint.llc
- ✅ AutoSSL certificate installed

### Certificate Management

**AutoSSL (Automatic):**
- Managed by Namecheap cPanel
- Renews automatically before expiration
- No manual intervention required

**Verify SSL:**
```bash
# Check certificate
curl -I https://crm.axispoint.llc

# Should see:
# HTTP/2 200
# (not HTTP/1.1 and not certificate errors)
```

**If SSL breaks:**
1. Log into cPanel
2. Go to Security → SSL/TLS Status
3. Find crm.axispoint.llc
4. Click "Run AutoSSL"
5. Wait 2-5 minutes for certificate installation

---

## Rollback Procedures

### Method 1: Git Revert (Fastest)

**When to use:** Latest deployment broke the app

```bash
# Revert last commit
git revert HEAD

# Push to trigger re-deployment
git push origin main

# Watch deployment
# https://github.com/PurplePean/NNN-CRM/actions
```

**Duration:** ~5 minutes total (1 min to revert + 3-4 min to deploy)

### Method 2: Re-run Previous Workflow

**When to use:** Need exact previous version without new commits

**Steps:**
1. Go to: https://github.com/PurplePean/NNN-CRM/actions
2. Find the last **successful** deployment (green checkmark)
3. Click on it
4. Click "Re-run all jobs" (top right)
5. Confirm re-run

**Duration:** ~3-4 minutes

### Method 3: Deploy Specific Commit

**When to use:** Need to go back multiple commits

```bash
# Find commit hash
git log --oneline

# Example output:
# 8fee313 Phase 2: Connect app to Supabase backend
# d719ccf Fix FTP upload path
# 5031855 Fix CI build warnings

# Reset to specific commit (doesn't delete commits)
git revert --no-commit HEAD~3..HEAD
git commit -m "Rollback to commit 5031855"
git push origin main
```

### Method 4: Manual Upload (Emergency)

**When to use:** GitHub Actions is down or completely broken

**Steps:**
1. Local: `npm run build`
2. Go to Namecheap cPanel → File Manager
3. Navigate to: /home/axisipak/crm.axispoint.llc/
4. **Delete** all files EXCEPT:
   - `.well-known/` folder
   - `cgi-bin/` folder
5. **Upload** everything from local `build/` folder
6. Wait 30 seconds for changes to propagate

**Duration:** ~5 minutes

---

## Monitoring & Logs

### GitHub Actions Logs

**Access:**
- https://github.com/PurplePean/NNN-CRM/actions
- Click any workflow run
- Click any step to see detailed logs

**What to look for:**
- Red X = failure (check error message)
- Yellow circle = in progress
- Green checkmark = success

### Build Logs

**Common errors:**

```
Error: Failed to compile
```
- **Cause:** Syntax error in code
- **Fix:** Check the specific file and line number in error

```
Error: Process completed with exit code 1
```
- **Cause:** ESLint warnings treated as errors
- **Fix:** Already handled with `CI: false`

```
Error: getaddrinfo ENOTFOUND ***
```
- **Cause:** FTP connection failed
- **Fix:** Check FTP_SERVER secret (use IP not hostname)

### Browser Console (Production)

**Check for runtime errors:**
1. Visit https://crm.axispoint.llc
2. Press F12 (or Right-click → Inspect)
3. Click "Console" tab
4. Look for red error messages

**Common errors:**

```
Supabase credentials not found
```
- **Cause:** Build didn't include environment variables
- **Fix:** Re-run build manually, check GitHub Secrets exist

```
PGRST204: Could not find column
```
- **Cause:** Database schema mismatch
- **Fix:** See CURRENT-STATUS.md for schema fix SQL

---

## Maintenance Tasks

### Weekly

- ✅ Check https://crm.axispoint.llc is loading
- ✅ Check GitHub Actions for failed deployments
- ✅ Check Supabase dashboard for unusual activity

### Monthly

- Review Supabase database size (500MB free tier limit)
- Check for npm package security updates: `npm audit`
- Verify SSL certificate is valid (check expiration)

### As Needed

- **After major changes:** Test on production thoroughly
- **Before partner starts using:** Verify data syncs correctly
- **If errors occur:** Check CURRENT-STATUS.md troubleshooting

---

## Common Deployment Scenarios

### Scenario 1: Update App Styling

```bash
# Edit CSS/styles
git add src/
git commit -m "Update button styles"
git push origin main

# Wait 3-4 minutes
# Visit https://crm.axispoint.llc
# Hard refresh (Cmd+Shift+R)
```

### Scenario 2: Add New Feature

```bash
# Create feature branch
git checkout -b feature/new-calculator

# Develop feature
npm start  # Test locally
git add .
git commit -m "Add IRR calculator"

# Create PR on GitHub
# Review and merge to main
# Automatic deployment triggers
```

### Scenario 3: Fix Production Bug

```bash
# Create hotfix branch
git checkout -b fix/property-display-bug

# Fix bug
git add .
git commit -m "Fix property display issue"
git push -u origin fix/property-display-bug

# Create PR, mark as urgent
# Merge to main immediately
# Watch deployment complete
```

### Scenario 4: Update Dependencies

```bash
# Update package
npm update @supabase/supabase-js

# Test locally
npm start

# If working, commit and deploy
git add package.json package-lock.json
git commit -m "Update Supabase client to v2.82.0"
git push origin main
```

---

## Testing Before Deployment

### Pre-Deployment Checklist

- [ ] Code compiles locally (`npm start`)
- [ ] No console errors in browser
- [ ] Test data loads correctly
- [ ] Core features work (add, edit, delete)
- [ ] Responsive design intact (test on mobile)
- [ ] No linter errors (`npm run build` succeeds locally)

### Post-Deployment Verification

- [ ] Visit https://crm.axispoint.llc
- [ ] Hard refresh (Cmd+Shift+R)
- [ ] Check browser console for errors
- [ ] Test critical user flows
- [ ] Verify Supabase connection (if Phase 2 complete)
- [ ] Test on different browser/device

---

## Emergency Contacts

**If deployment fails:**
1. Check GitHub Actions logs first
2. Check CURRENT-STATUS.md troubleshooting section
3. Consider rollback if critical issue

**If Namecheap issues:**
- cPanel: https://axispoint.llc:2083
- Namecheap Support: https://www.namecheap.com/support/

**If Supabase issues:**
- Dashboard: https://app.supabase.com
- Docs: https://supabase.com/docs
- Status: https://status.supabase.com

---

## Best Practices

### Git Workflow

1. **Always** pull before starting work: `git pull origin main`
2. **Never** commit directly to main (use PRs for major changes)
3. **Write** descriptive commit messages
4. **Test** locally before pushing
5. **Watch** GitHub Actions after pushing

### Code Changes

1. **Read** existing code before modifying
2. **Comment** complex logic
3. **Test** on multiple browsers (Chrome, Safari, Firefox)
4. **Check** mobile responsiveness
5. **Verify** no console errors

### Deployment Safety

1. **Deploy** during low-traffic times if possible
2. **Monitor** first 5 minutes after deployment
3. **Have** rollback plan ready
4. **Communicate** with partner about deployments
5. **Document** any configuration changes

---

## Appendix

### Useful Commands

```bash
# Check current branch
git branch --show-current

# View recent commits
git log --oneline -5

# See what changed
git status
git diff

# Undo local changes
git restore <file>

# Update local repo
git fetch origin
git pull origin main

# Force refresh build locally
rm -rf build/ node_modules/
npm install
npm run build
```

### File Paths Reference

```
Repository Root
├── .github/
│   └── workflows/
│       └── deploy.yml          # GitHub Actions workflow
├── docs/
│   └── infrastructure/
│       ├── CURRENT-STATUS.md   # Deployment status
│       ├── DEPLOYMENT-GUIDE.md # This file
│       └── BACKEND-INFRASTRUCTURE.md
├── src/
│   ├── App.jsx                 # Main application
│   ├── services/
│   │   └── supabase.js         # Supabase client
│   └── components/
├── package.json                # Dependencies
└── .env.local                  # Local env vars (gitignored)
```

### Links

- **Production:** https://crm.axispoint.llc
- **Repository:** https://github.com/PurplePean/NNN-CRM
- **Actions:** https://github.com/PurplePean/NNN-CRM/actions
- **Supabase:** https://app.supabase.com/project/acwtflofdabmfpjdixmv
- **cPanel:** https://axispoint.llc:2083
