# NNN CRM - Industrial Property Underwriting

Professional CRM and underwriting tool for NNN (Triple Net) industrial properties.

> **For AI Assistants (Claude Code, etc.):** Read [.claude/AI-CONTEXT.md](./.claude/AI-CONTEXT.md) first for complete context, workflow rules, and instructions.

## ⚡ Quick Start (5 Minutes)

**Local development with feature branch workflow:**

```bash
# Clone the repo to your laptop
git clone https://github.com/PurplePean/NNN-CRM.git
cd NNN-CRM

# Install and start
npm install
npm run dev
```

Browser opens to `localhost:5173` - you're ready!

**Tell Claude what to build** → Claude creates feature branch → **You test locally** → **You approve and merge** → Production updated!

---

## Features

### Property Management
- Complete property tracking with address and Crexi integration
- Square footage and rent calculations
- Search by address or Crexi link
- Dark mode with persistent storage

### Advanced Underwriting
- **LTV-based financing** - automatic loan amount calculation
- **All-in cost analysis** - Purchase Price + Improvements + Closing Costs
- **Debt service options** - Standard Amortization vs Interest-Only
- **Operating metrics** - Cap Rate, DSCR, Cash-on-Cash returns
- **Exit analysis** - Equity multiples, remaining loan balance, net proceeds

### Broker Management
- Track broker information (Name, Email, Phone)
- Firm details (Firm Name, Website, Crexi Profile, License #)
- Multi-select brokers per property
- Inline quick-add broker form
- Broker badges on property cards

### User Experience
- Number formatting with commas (1,000,000)
- Real-time calculations
- Responsive design
- Dark mode toggle
- localStorage persistence (backend coming soon!)

---

## Tech Stack

- React 18
- Tailwind CSS
- localStorage for data persistence
- Local development with git pull workflow

---

## How Development Works

### Your Setup

**You have 2 windows on your laptop:**
1. **Terminal** - Running `npm start` and git commands
2. **Browser (localhost:3000)** - Your running app (live preview)

**Your workflow:**
```
You: "I want to add CSV export"
→ Claude creates branch: claude/add-csv-export
→ Claude develops and pushes to GitHub

You: In terminal:
    git fetch origin
    git checkout claude/add-csv-export
→ Browser auto-refreshes with new feature
→ You test the feature

You: "Make the button green"
→ Claude updates same branch
→ You: git pull origin claude/add-csv-export
→ Browser updates, you test again

You: "Perfect! Create a PR"
→ Claude creates Pull Request
→ You review on GitHub
→ You: "Merge it to main"
→ Claude merges to production ✅
```

**You control what goes to production. Claude never touches main without your approval.**

---

## Documentation

### For Developers
- **[GETTING-STARTED.md](./GETTING-STARTED.md)** - ⭐ **START HERE** - Find your repo and start live environment
- **[LOCAL-SETUP.md](./LOCAL-SETUP.md)** - Detailed setup guide with troubleshooting
- **[SIMPLE-WORKFLOW.md](./SIMPLE-WORKFLOW.md)** - Feature branch workflow and commands
- **[ROADMAP.md](./ROADMAP.md)** - What to build next, priorities, feature backlog

### For AI Assistants
- **[.claude/AI-CONTEXT.md](./.claude/AI-CONTEXT.md)** - ⭐ **READ THIS FIRST** - Complete context and workflow rules
- **[.claude/QUICK-START.md](./.claude/QUICK-START.md)** - Quick reference for new sessions

---

## Working with Claude

Just use plain English commands:

```
"I want to add CSV export"           → Claude creates feature branch
"Make the button green"               → Claude updates the branch
"Looks good, create a PR"             → Claude creates Pull Request
"Merge it to main"                    → Claude merges to production
"What should I work on next?"         → Claude suggests from roadmap
```

**You test locally before approving. You control production.**

See [SIMPLE-WORKFLOW.md](./SIMPLE-WORKFLOW.md) for complete workflow guide.

---

## Development Process

### Daily Workflow

**Morning (30 seconds):**
- Open terminal in your NNN-CRM folder
- Run `git checkout main && git pull origin main`
- Run `npm start`
- Browser opens to localhost:3000

**During the day:**
- Tell Claude what feature you want
- Claude creates feature branch and develops
- You test locally: `git checkout claude/feature-name`
- Iterate until perfect
- You approve: "Create a PR"
- You merge to production

**End of day:**
- Stop npm start (Ctrl+C)

### Feature Branch Workflow

1. **Request feature** - "I want to add CSV export"
2. **Claude develops** - Creates branch, writes code, pushes to GitHub
3. **You test locally** - `git checkout claude/add-csv-export && npm start`
4. **Iterate** - Request changes, Claude updates same branch
5. **Approve** - "Looks good, create a PR"
6. **You merge** - Review PR, tell Claude to merge to main

**You control production. Claude never merges to main without approval.**

---

## Version

**V1.0** - Initial Release
- Core CRM functionality
- Property & broker management
- Financial underwriting calculations
- Dark mode & responsive design

**V1.1** - Coming Soon
- Component-based architecture
- Backend integration (Google Sheets or Supabase)
- CSV import/export
- Enhanced underwriting features

See [ROADMAP.md](./ROADMAP.md) for full feature roadmap.

---

## Questions?

**"How do I get started?"**
→ Read [LOCAL-SETUP.md](./LOCAL-SETUP.md)

**"How do I work with Claude?"**
→ Read [SIMPLE-WORKFLOW.md](./SIMPLE-WORKFLOW.md)

**"What should I build next?"**
→ Check [ROADMAP.md](./ROADMAP.md)

**"Can I code myself too?"**
→ Yes! Edit files locally, save, browser auto-refreshes. Claude helps when you need it.

---

Built with ❤️ for NNN industrial property professionals.
