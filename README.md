# NNN CRM - Industrial Property Underwriting

Professional CRM and underwriting platform for NNN (Triple Net) industrial properties.

**Live:** [crm.axispoint.llc](https://crm.axispoint.llc)

---

## Features

### Property Management
- Complete property tracking with Crexi integration
- Advanced underwriting calculations (LTV, DSCR, Cap Rate, IRR)
- Sensitivity analysis for investment scenarios
- All-in cost analysis (purchase + improvements + closing)
- Debt service modeling (standard amortization vs interest-only)

### Contact Management
- **Brokers:** Track brokers, firms, and license details
- **Partners:** Manage equity partners and investment criteria
- **Gatekeepers:** Track attorneys, accountants, and other defined gatekeepers
- Activity feed with notes and categorization
- Follow-up tracking and event scheduling

### User Experience
- Dark mode with persistent preferences
- Real-time financial calculations
- Responsive design for desktop and mobile
- Number formatting and professional UI

---

## Tech Stack

**Frontend:**
- **Framework:** React 18 (Create React App)
- **Styling:** Tailwind CSS + Vanilla CSS (Glassmorphism design)
- **Icons:** Lucide React
- **Router:** React Router DOM

**Backend:**
- **Database:** Supabase (PostgreSQL)
- **Data Standard:** `snake_case` column naming convention
- **Service Layer:** Custom adapter pattern for automatic `snake_case` (DB) <-> `camelCase` (Frontend) conversion

**Infrastructure:**
- **Hosting:** Namecheap Stellar Hosting
- **CI/CD:** GitHub Actions (Automated building and deployment via FTP)
- **Environment:** Node.js 20+

---

## Quick Start

### Prerequisites
- Node.js 20+
- npm
- Supabase account

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

## Project Structure

- **`src/pages/`**: core application pages (Properties, Brokers, etc.)
- **`src/components/`**: Reusable UI components (NotesSidebar, InlineEditField, etc.)
- **`src/services/`**: API and Database interaction (Supabase adapter)
- **`src/utils/`**: Helper functions (Calculations, Formatters, Date handlers)
- **`sql/`**: Database migration scripts

---

## Database Architecture

The project uses a standard **snake_case** naming convention for all database columns.
The frontend automatically converts this to **camelCase** for React usage via the `supabaseService` adapter.

### Migrations
If you need to update the schema:
1.  Write a SQL script in the `sql/` directory.
2.  Use `snake_case` for all new columns.
3.  Apply the script via Supabase SQL Editor.

---

## Deployment

This project uses automated CI/CD via GitHub Actions:

- **Production:** Pushes to `main` branch auto-deploy to [crm.axispoint.llc](https://crm.axispoint.llc)
- **Staging:** Pushes to `develop` branch auto-deploy to [staging.axispoint.llc](https://staging.axispoint.llc)

See [DEPLOYMENT-BACKEND-PLAN.md](./DEPLOYMENT-BACKEND-PLAN.md) for detailed architecture.

---

## License

Private project - All rights reserved. Built for Axispoint LLC.
