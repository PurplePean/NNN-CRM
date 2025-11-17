# Deployment Setup
**NNN CRM - CI/CD & Deployment Tools**

---

## Overview

**Goal:** Auto-deploy React app to crm.axispoint.llc when code is pushed to GitHub

**Method:** GitHub Actions → Build → FTP to Namecheap

**Trigger:** Push to `main` branch

**Time:** 2-3 minutes from push to live

---

## Tools

### GitHub Actions
**Purpose:** CI/CD pipeline (build + deploy)
**Cost:** Free (2,000 minutes/month)
**Why:** Industry standard, works with Namecheap, already using GitHub

### FTP Deploy
**Purpose:** Upload built files to Namecheap
**Method:** SamKirkland/FTP-Deploy-Action
**Why:** Namecheap shared hosting = FTP access

### Git Tags
**Purpose:** Version tracking for rollback
**Format:** v1.0.0, v1.0.1, v1.0.2, etc.
**Why:** Easy to identify and rollback to specific versions

---

## Deployment Flow

```
Developer pushes to main
    ↓
GitHub Actions triggered
    ↓
Install dependencies (npm ci)
    ↓
Build React app (npm run build)
    ↓
Create version tag (v1.0.X)
    ↓
Upload build/ to Namecheap via FTP
    ↓
Live at crm.axispoint.llc
    ↓
Notify on success/failure
```

---

## Setup Steps

### 1. cPanel Configuration

**Create Subdomain:**
1. Log into Namecheap account
2. Go to hosting dashboard → cPanel
3. Domains → Subdomains
4. Subdomain: `crm`
5. Domain: `axispoint.llc`
6. Document root: `/public_html/crm`
7. Create

**Create FTP User:**
1. cPanel → FTP Accounts
2. Create FTP Account
3. Login: `deploy@axispoint.llc` (or similar)
4. Password: Generate strong password
5. Directory: `/public_html/crm`
6. Quota: Unlimited
7. Create

**Enable SSL:**
1. cPanel → SSL/TLS Status
2. Find `crm.axispoint.llc`
3. Run AutoSSL
4. Wait 5-10 minutes

**Credentials to save:**
- FTP Server: `ftp.axispoint.llc`
- FTP Username: `deploy@axispoint.llc`
- FTP Password: (generated above)
- Server Path: `/public_html/crm/`

---

### 2. GitHub Secrets

**Add to GitHub (Settings → Secrets and variables → Actions):**

| Secret Name | Value | Purpose |
|-------------|-------|---------|
| `FTP_SERVER` | `ftp.axispoint.llc` | FTP host |
| `FTP_USERNAME` | `deploy@axispoint.llc` | FTP login |
| `FTP_PASSWORD` | (from cPanel) | FTP password |
| `SUPABASE_URL` | (from Supabase dashboard) | Backend API |
| `SUPABASE_ANON_KEY` | (from Supabase dashboard) | Backend auth |

**How to add:**
1. Go to https://github.com/PurplePean/NNN-CRM/settings/secrets/actions
2. Click "New repository secret"
3. Name: `FTP_SERVER`
4. Secret: `ftp.axispoint.llc`
5. Click "Add secret"
6. Repeat for each secret

---

### 3. GitHub Actions Workflow

**File:** `.github/workflows/deploy.yml`

```yaml
name: Deploy to Production

on:
  push:
    branches: [ main ]
  workflow_dispatch:

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build React app
        env:
          REACT_APP_SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
          REACT_APP_SUPABASE_ANON_KEY: ${{ secrets.SUPABASE_ANON_KEY }}
        run: npm run build

      - name: Get version
        id: version
        run: |
          VERSION=$(node -p "require('./package.json').version")
          echo "version=$VERSION" >> $GITHUB_OUTPUT

      - name: Deploy to Namecheap
        uses: SamKirkland/FTP-Deploy-Action@4.3.3
        with:
          server: ${{ secrets.FTP_SERVER }}
          username: ${{ secrets.FTP_USERNAME }}
          password: ${{ secrets.FTP_PASSWORD }}
          local-dir: ./build/
          server-dir: /public_html/crm/
          dangerous-clean-slate: false

      - name: Create release tag
        if: success()
        run: |
          git config user.name github-actions
          git config user.email github-actions@github.com
          git tag -a "v${{ steps.version.outputs.version }}-${{ github.run_number }}" -m "Deploy to production"
          git push origin "v${{ steps.version.outputs.version }}-${{ github.run_number }}"
```

---

## Rollback Methods

### Method 1: Re-run Workflow (Easiest)

**Steps:**
1. Go to https://github.com/PurplePean/NNN-CRM/actions
2. Click "Deploy to Production" workflow
3. Find last successful run (green checkmark)
4. Click the run
5. Click "Re-run all jobs" (top right)
6. Wait 2-3 minutes

**When to use:** Quick rollback, no git commands needed

---

### Method 2: Git Revert

**Steps:**
```bash
git revert HEAD
git push origin main
```

**When to use:** Want to preserve history of rollback

---

### Method 3: Deploy Specific Tag

**Steps:**
1. Go to https://github.com/PurplePean/NNN-CRM/actions
2. Click "Deploy to Production"
3. Click "Run workflow" (right side)
4. Select branch: `main`
5. Click "Run workflow"
6. Modify workflow to accept tag input (advanced)

**When to use:** Need to rollback to specific version (not just previous)

---

## Manual Deployment (Fallback)

**If GitHub Actions is down:**

```bash
# Build locally
npm run build

# Upload via FTP client (FileZilla, etc.)
# Host: ftp.axispoint.llc
# Username: deploy@axispoint.llc
# Password: (your FTP password)
# Upload: build/* to /public_html/crm/
```

---

## Monitoring

### GitHub Actions Dashboard
- View deployment history
- See build logs
- Check success/failure rates
- https://github.com/PurplePean/NNN-CRM/actions

### Deployment Notifications
**Built-in GitHub:**
- Email on workflow failure
- Configure in GitHub settings → Notifications

**Optional Sentry:**
- JavaScript errors in production
- Email alerts
- Stack traces for debugging

---

## Workflow Triggers

### Automatic Triggers
- Push to `main` branch
- Merged PR to `main`

### Manual Triggers
- Click "Run workflow" in GitHub Actions UI
- Useful for re-deploying without code changes

---

## Build Process

**Steps:**
1. `npm ci` - Clean install (faster, more reliable than `npm install`)
2. `npm run build` - Creates optimized production build
3. Environment variables injected during build
4. Output: `build/` directory with static files

**Build output:**
```
build/
  ├── index.html
  ├── static/
  │   ├── css/
  │   ├── js/
  │   └── media/
  └── ...
```

---

## Version Numbering

**Format:** `v1.0.0-123`
- `1.0.0` = from package.json
- `123` = GitHub run number

**Example tags:**
- `v1.0.0-1` (first deploy)
- `v1.0.0-2` (second deploy)
- `v1.1.0-15` (after version bump)

**Bump version:**
```bash
npm version patch   # 1.0.0 → 1.0.1
npm version minor   # 1.0.0 → 1.1.0
npm version major   # 1.0.0 → 2.0.0
git push && git push --tags
```

---

## Troubleshooting

### Deploy fails with FTP error
- Check FTP credentials in GitHub Secrets
- Verify FTP user has write access to `/public_html/crm/`
- Check Namecheap server is accessible

### Build succeeds but site shows old version
- Hard refresh browser (Ctrl+Shift+R or Cmd+Shift+R)
- Check FTP uploaded files correctly
- Verify cPanel shows correct files in `/public_html/crm/`

### Environment variables not working
- Check secrets are set in GitHub
- Verify they start with `REACT_APP_` prefix
- Rebuild app (delete node_modules, npm ci, npm run build)

### Deploy takes too long
- Normal: 2-3 minutes
- Slow: 5+ minutes (check FTP connection, try different time)
- Stuck: Cancel and re-run

---

## Security Notes

**GitHub Secrets:**
- Never exposed in logs
- Encrypted at rest
- Only accessible during workflow execution

**FTP Credentials:**
- Use dedicated deploy user (not cPanel main account)
- Limit access to /public_html/crm/ only
- Change password if compromised

**Environment Variables:**
- `REACT_APP_SUPABASE_ANON_KEY` is safe to expose (client-side)
- Never add service_role key to frontend

---

## Performance

**Deploy time breakdown:**
- Checkout code: 5-10 seconds
- Install dependencies: 30-60 seconds
- Build React app: 20-40 seconds
- Upload via FTP: 30-60 seconds
- **Total: 2-3 minutes**

**Optimization:**
- npm ci uses package-lock.json (faster)
- Node.js cache speeds up installs
- FTP only uploads changed files

---

## Cost

| Tool | Monthly | Annual |
|------|---------|--------|
| GitHub Actions | $0 | $0 |
| FTP | $0 (included in hosting) | $0 |
| SSL | $0 (AutoSSL) | $0 |
| **TOTAL** | **$0** | **$0** |

**Free tier limits:**
- GitHub Actions: 2,000 minutes/month
- Your usage: ~3 min/deploy = ~660 deploys/month
- Well within limits

---

## Next Steps

1. Complete cPanel setup (subdomain + FTP user)
2. Add GitHub Secrets
3. Create `.github/workflows/deploy.yml`
4. Test first deployment
5. Verify at crm.axispoint.llc

---

**Status:** Documented
**Dependencies:** cPanel access, GitHub repository
