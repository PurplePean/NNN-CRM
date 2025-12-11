# NNN CRM - Industrial Property Underwriting

Professional CRM and underwriting platform for NNN (Triple Net) industrial properties.

**Live:** [crm.axispoint.llc](https://crm.axispoint.llc) (Coming Soon)

---

## Features

### Property Management
- Complete property tracking with Crexi integration
- Advanced underwriting calculations (LTV, DSCR, Cap Rate, IRR)
- Sensitivity analysis for investment scenarios
- All-in cost analysis (purchase + improvements + closing)
- Debt service modeling (standard amortization vs interest-only)

### Contact Management
- Broker, Partner, and Gatekeeper tracking
- Activity feed with notes and categorization
- Follow-up tracking and event scheduling
- Full contact profiles with objectives and history

### User Experience
- Dark mode with persistent preferences
- Real-time financial calculations
- Responsive design for desktop and mobile
- Number formatting and professional UI

---

## Tech Stack

**Frontend:**
- React 18
- Tailwind CSS
- Lucide Icons

**Backend:**
- Supabase (PostgreSQL)
- Real-time database sync
- Row-level security

**Deployment:**
- Namecheap Stellar Hosting
- GitHub Actions CI/CD
- Automated staging and production deploys

---

## Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn
- Supabase account (free tier)

### Installation

```bash
# Clone the repository
git clone https://github.com/PurplePean/NNN-CRM.git
cd NNN-CRM

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Add your Supabase credentials to .env.local

# Start development server
npm start
```

App runs at `http://localhost:3000`

### Build for Production

```bash
npm run build
```

Creates optimized production build in `build/` folder.

---

## Environment Variables

Create `.env.local` for local development:

```bash
REACT_APP_SUPABASE_URL=your_supabase_project_url
REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key
```

See `.env.example` for template.

---

## Documentation

- **[DEPLOYMENT-BACKEND-PLAN.md](./DEPLOYMENT-BACKEND-PLAN.md)** - Complete deployment and backend architecture guide
- **[docs/archive/](./docs/archive/)** - Historical documentation and guides

---

## Deployment

This project uses automated CI/CD via GitHub Actions:

- **Production:** Pushes to `main` branch auto-deploy to [crm.axispoint.llc](https://crm.axispoint.llc)
- **Staging:** Pushes to `develop` branch auto-deploy to [staging.axispoint.llc](https://staging.axispoint.llc)

See [DEPLOYMENT-BACKEND-PLAN.md](./DEPLOYMENT-BACKEND-PLAN.md) for setup details.

---

## Development Workflow

```bash
# Create feature branch
git checkout -b feature/your-feature-name

# Make changes, commit
git add .
git commit -m "Add feature description"

# Push to GitHub
git push origin feature/your-feature-name

# Merge to develop for staging testing
# Merge to main for production deployment
```

---

## Project Status

**Current Version:** 1.0 (Production Ready)

**Infrastructure:**
- ✅ React frontend complete
- ✅ Component architecture
- ✅ Dark mode support
- 🚧 Supabase backend integration (in progress)
- 🚧 CI/CD pipeline setup (in progress)
- 📋 Authentication (planned)

---

## License

Private project - All rights reserved

---

## Contact

Built for Axispoint LLC - Industrial real estate professionals.

**Issues?** Contact via GitHub Issues or email.
