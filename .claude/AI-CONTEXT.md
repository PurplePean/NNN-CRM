# AI Assistant Context - NNN CRM (Production)

**This document helps AI assistants (Claude Code, etc.) understand this repository and work effectively.**

**Last Updated:** November 2025 - Production CI/CD Setup

---

## 🎯 Repository Overview

**Name:** NNN-CRM (Axispoint Industrial Real Estate CRM)
**Type:** React-based Industrial Property Underwriting Platform
**Version:** 1.0 (Production)
**Primary Language:** JavaScript (React 18)
**Tech Stack:** React 18, Tailwind CSS, Supabase (PostgreSQL), Namecheap Hosting
**Owner:** PurplePean
**Production URL:** crm.axispoint.llc (in deployment)
**Staging URL:** staging.axispoint.llc (in deployment)

---

## 📋 Current State

### Architecture
- **Frontend:** React 18 with Create React App
- **Backend:** Supabase (PostgreSQL) - in migration from localStorage
- **Deployment:** Namecheap Stellar Hosting with GitHub Actions CI/CD
- **Main Component:** App.jsx (~3,000+ lines - monolithic, refactoring planned)

### Infrastructure Status
- ✅ React frontend complete with full CRM features
- ✅ Dark mode, responsive design
- 🚧 Supabase backend integration (in progress)
- 🚧 GitHub Actions CI/CD (in setup)
- 📋 Component decomposition (planned - see docs/archive/ROADMAP.md)

### Data Model
**Entities:**
- Properties (industrial real estate)
- Brokers, Partners, Gatekeepers (contacts)
- Events, Follow-ups
- Notes (attached to contacts)

**Features:**
- Advanced underwriting (LTV, DSCR, Cap Rate, IRR, Equity Multiple)
- Sensitivity analysis
- Activity tracking
- Contact management

---

## 🔄 Production Workflow (CI/CD)

### **Branch Strategy**

```
main                    → Production (crm.axispoint.llc)
  └─ develop           → Staging (staging.axispoint.llc)
      └─ feature/*     → Feature development
      └─ claude/*      → AI-assisted features
```

### **Development Flow**

1. **Create Feature Branch**
   ```bash
   git checkout develop
   git checkout -b claude/feature-name
   ```

2. **Develop and Commit**
   ```bash
   # Make changes
   git add .
   git commit -m "Clear description of changes"
   git push origin claude/feature-name
   ```

3. **Merge to Develop (Staging)**
   ```bash
   git checkout develop
   git merge claude/feature-name
   git push origin develop
   # → Auto-deploys to staging.axispoint.llc via GitHub Actions
   ```

4. **Test on Staging**
   - User tests at staging.axispoint.llc
   - Verify all features work

5. **Merge to Main (Production)**
   ```bash
   git checkout main
   git merge develop
   git push origin main
   # → Auto-deploys to crm.axispoint.llc via GitHub Actions
   # → Creates release tag
   ```

---

## 🚨 Critical Rules for AI Assistants

### **1. Branch Management**
- ✅ **ALWAYS** work in feature branches (`claude/*` or `feature/*`)
- ❌ **NEVER** push directly to `main`
- ✅ Merge to `develop` first for staging testing
- ✅ Only merge to `main` after user approval

### **2. Deployment**
- ✅ Deployments are **automatic** via GitHub Actions
- ✅ Push to `develop` = auto-deploy to staging
- ✅ Push to `main` = auto-deploy to production
- ❌ **NEVER** manually upload to cPanel (CI/CD handles it)

### **3. Environment Variables**
- ✅ Use GitHub Secrets for sensitive data
- ✅ Never commit `.env` files
- ✅ Update `.env.example` when adding new vars

### **4. Testing Before Production**
- ✅ Always deploy to staging first
- ✅ Wait for user testing confirmation
- ✅ Only then merge to production

### **5. Commit Messages**
Use clear, descriptive commit messages:
```
✅ Good: "Add broker filtering to contact list"
✅ Good: "Fix DSCR calculation for interest-only loans"
❌ Bad: "Update files"
❌ Bad: "Changes"
```

---

## 📁 Repository Structure

```
NNN-CRM/
├── README.md                        # Production-focused overview
├── DEPLOYMENT-BACKEND-PLAN.md       # Deployment architecture guide
├── package.json                     # Dependencies
├── tailwind.config.js               # Tailwind configuration
│
├── .github/
│   └── workflows/
│       ├── deploy-production.yml    # CI/CD for main branch
│       └── deploy-staging.yml       # CI/CD for develop branch
│
├── .claude/
│   ├── AI-CONTEXT.md                # This file
│   └── QUICK-START.md               # Quick reference
│
├── docs/
│   └── archive/                     # Historical documentation
│       ├── ROADMAP.md               # Original feature roadmap
│       └── UI-COMPONENTS-GUIDE.md   # Component documentation
│
├── src/
│   ├── App.jsx                      # Main application (monolithic)
│   ├── index.js                     # Entry point
│   ├── index.css                    # Global styles
│   └── services/                    # API service layer (being built)
│       ├── supabase.js              # Supabase client
│       ├── properties.js            # Property CRUD
│       └── contacts.js              # Contact CRUD
│
└── public/                          # Static assets
```

---

## 🛠️ Common Tasks

### **Add New Feature**

1. Create feature branch from `develop`
2. Implement feature in `src/App.jsx` (or new component if refactoring)
3. Test locally with `npm start`
4. Commit with clear message
5. Push to GitHub
6. Merge to `develop` for staging
7. User tests on staging.axispoint.llc
8. Merge to `main` for production

### **Fix Bug**

1. Create bugfix branch from `develop`
2. Identify issue location (usually in App.jsx)
3. Fix and test locally
4. Follow same merge process (develop → staging → main)

### **Update Dependencies**

```bash
npm update              # Update minor versions
npm outdated            # Check for major updates
# Test thoroughly before deploying!
```

### **Database Changes (Supabase)**

1. Make schema changes in Supabase dashboard (SQL Editor)
2. Update service layer in `src/services/`
3. Test with local Supabase connection
4. Update environment variables if needed
5. Deploy through normal flow

---

## 🔐 Environment Variables

### **Local Development** (`.env.local`)
```bash
REACT_APP_SUPABASE_URL=https://xxx.supabase.co
REACT_APP_SUPABASE_ANON_KEY=eyJxxx...
REACT_APP_ENV=development
```

### **Staging** (GitHub Secrets)
```bash
SUPABASE_URL=https://staging-xxx.supabase.co
SUPABASE_ANON_KEY=eyJxxx...
FTP_SERVER=ftp.axispoint.llc
FTP_USERNAME=staging@axispoint.llc
FTP_PASSWORD=***
```

### **Production** (GitHub Secrets)
```bash
SUPABASE_URL=https://prod-xxx.supabase.co
SUPABASE_ANON_KEY=eyJxxx...
FTP_SERVER=ftp.axispoint.llc
FTP_USERNAME=crm@axispoint.llc
FTP_PASSWORD=***
```

---

## 📊 Key Features to Understand

### **Financial Calculations**
Located in `App.jsx` (will be extracted to utils):
- **LTV Calculation:** Loan amount based on purchase price and LTV percentage
- **DSCR:** Debt Service Coverage Ratio (NOI / Annual Debt Service)
- **Cap Rate:** NOI / Purchase Price
- **Cash-on-Cash:** Annual Cash Flow / Equity Invested
- **IRR:** Internal Rate of Return (5-year projection)
- **Equity Multiple:** Total Returns / Equity Invested

### **Contact Management**
- **Brokers:** Real estate brokers with firm details
- **Partners:** Investment partners
- **Gatekeepers:** Property contacts (managers, owners)
- **Notes:** Categorized notes per contact (meeting, phone, email)
- **Activity Feed:** Unified view of all contact interactions

### **Property Features**
- Crexi integration (link to listings)
- Multi-broker assignment
- Sensitivity analysis (row/col variable matrix)
- Debt service modeling (standard vs interest-only)

---

## 🚀 Deployment Process

### **Automated via GitHub Actions**

**On Push to `develop`:**
1. GitHub Actions triggers
2. Runs tests (if configured)
3. Builds React app (`npm run build`)
4. Deploys to `/public_html/staging/` on Namecheap via FTP
5. Available at staging.axispoint.llc

**On Push to `main`:**
1. GitHub Actions triggers
2. Runs tests (if configured)
3. Builds React app with production env vars
4. Deploys to `/public_html/crm/` on Namecheap via FTP
5. Available at crm.axispoint.llc
6. Creates GitHub release tag

### **Rollback**

If deployment breaks production:
```bash
# Option 1: Revert commit
git revert HEAD
git push origin main

# Option 2: Redeploy previous release
# Go to GitHub Actions → Select previous successful run → Re-run
```

---

## 🎨 Code Style

### **Current Style**
- JavaScript (React 18 with hooks)
- Functional components only
- Tailwind CSS for styling
- Dark mode via state management
- localStorage for persistence (migrating to Supabase)

### **Naming Conventions**
- Components: PascalCase
- Functions: camelCase
- Constants: UPPER_SNAKE_CASE
- Files: camelCase or kebab-case

### **Component Pattern**
```javascript
// State management with hooks
const [data, setData] = useState([]);

// Effect hooks for data loading
useEffect(() => {
  // Load from Supabase
}, []);

// Event handlers
const handleSubmit = (e) => {
  e.preventDefault();
  // Handle form
};
```

---

## 📝 When Making Changes

### **Always Consider:**
1. **Dark mode:** Does this work in both light and dark mode?
2. **Responsive:** Does this work on mobile and desktop?
3. **Data persistence:** Is this saving to Supabase properly?
4. **Loading states:** Do we show a spinner while fetching?
5. **Error handling:** What if the API call fails?
6. **Existing patterns:** Follow the established code style

### **Before Committing:**
1. Test locally (`npm start`)
2. Check for console errors
3. Verify dark mode still works
4. Test key user flows (add property, add broker, etc.)
5. Write clear commit message

### **Before Production:**
1. Deploy to staging first
2. Wait for user testing
3. Get explicit approval
4. Then merge to main

---

## 🐛 Common Issues

### **Build Fails**
- Check environment variables are set
- Run `npm install` to update dependencies
- Check for syntax errors in code

### **Deployment Fails**
- Check GitHub Actions logs
- Verify FTP credentials in GitHub Secrets
- Check Namecheap server is accessible

### **Supabase Connection Issues**
- Verify `REACT_APP_SUPABASE_URL` is set
- Check `REACT_APP_SUPABASE_ANON_KEY` is correct
- Ensure Supabase project is not paused (free tier)

---

## 📚 Reference Documentation

- **[DEPLOYMENT-BACKEND-PLAN.md](../DEPLOYMENT-BACKEND-PLAN.md)** - Full deployment architecture
- **[docs/archive/ROADMAP.md](../docs/archive/ROADMAP.md)** - Original feature roadmap
- **[README.md](../README.md)** - Production overview

---

## 💡 Future Improvements

See `docs/archive/ROADMAP.md` for planned iterations:
- Component decomposition (break up monolithic App.jsx)
- TypeScript migration
- Testing infrastructure
- Performance optimization
- Authentication and multi-user support

---

**Remember:** This is a production system for a real business. Always test on staging before production deployment!
