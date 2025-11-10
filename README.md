# NNN CRM - Industrial Property Underwriting

Professional CRM and underwriting tool for NNN (Triple Net) industrial properties.

## ⚡ Quick Start (5 Minutes)

**The simplest way to develop: GitHub Codespaces + Claude**

1. **Open Codespaces**: https://github.com/PurplePean/NNN-CRM → Code → Codespaces → Create
2. **Start dev server**: `npm install && npm start`
3. **Tell Claude what you want** → See changes instantly in your browser!

**Full setup guide**: [CODESPACES-SETUP.md](./CODESPACES-SETUP.md)

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
- GitHub Codespaces for development

---

## How Development Works

### The Simple Way (Recommended)

**You have 3 browser tabs:**
1. **Codespaces** - VS Code in browser
2. **localhost:3000** - Your running app
3. **Claude chat** - Where you tell Claude what to build

**Your workflow:**
```
You: "Add a purple background"
→ Claude edits the files
→ Browser updates in 1 second ⚡
→ You see purple background

You: "Make it darker"
→ Claude edits
→ Browser updates
→ You see darker purple

You: "Perfect! Save my work"
→ Claude commits and pushes ✅
```

**No git commands. No installations. Just describe what you want.**

---

## Documentation

- **[CODESPACES-SETUP.md](./CODESPACES-SETUP.md)** - ⭐ **START HERE** - 5-minute setup guide
- **[SIMPLE-WORKFLOW.md](./SIMPLE-WORKFLOW.md)** - Simple commands for working with Claude
- **[ROADMAP.md](./ROADMAP.md)** - What to build next, priorities, feature backlog

---

## Working with Claude

Just use plain English commands:

```
"I want to work on CSV export"
"Add a button to export properties"
"Change the header color to blue"
"Make the cards bigger"
"Save my work"
"What should I work on next?"
```

Claude handles all the technical details!

See [SIMPLE-WORKFLOW.md](./SIMPLE-WORKFLOW.md) for all available commands.

---

## Development Process

### Daily Workflow

**Morning (1 minute):**
- Open your Codespace
- Run `npm start`
- Open browser tab

**During the day:**
- Tell Claude what you want
- See it appear in your browser instantly
- Iterate fast (20 changes → 1 commit)
- Tell Claude to save when ready

**End of day:**
- "Save my work"
- Close tabs

### Iteration Approach

1. **Describe what you want** - "I want to add CSV export"
2. **Claude builds it** - Makes changes, you see them live
3. **Iterate quickly** - "Make it green", "Add this field", etc.
4. **Save once** - When you're happy: "Save my work"

**No git complexity. No manual commits. Just build features!**

---

## Local Development (Alternative)

If you prefer to run locally instead of Codespaces:

```bash
# Clone repo
git clone https://github.com/PurplePean/NNN-CRM.git
cd NNN-CRM

# Install and start
npm install
npm start

# Browser opens to localhost:3000
```

**Note**: With local development, you'll need to run `git pull` to see Claude's changes (not instant).

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
→ Read [CODESPACES-SETUP.md](./CODESPACES-SETUP.md)

**"How do I work with Claude?"**
→ Read [SIMPLE-WORKFLOW.md](./SIMPLE-WORKFLOW.md)

**"What should I build next?"**
→ Check [ROADMAP.md](./ROADMAP.md)

**"Can I code myself too?"**
→ Yes! Edit in Codespaces, save, browser updates. Claude helps when you need it.

---

Built with ❤️ for NNN industrial property professionals.
