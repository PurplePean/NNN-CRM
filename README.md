# NNN CRM - Industrial Property Underwriting

Professional CRM and underwriting tool for NNN (Triple Net) industrial properties.

## 🚀 GETTING STARTED (Read This First!)

### Where is my project?

Your project is in a folder called `NNN-CRM`. To find it:

**Option 1 - If you remember where you saved it:**
```bash
cd ~/Desktop/NNN-CRM          # If on Desktop
cd ~/Documents/NNN-CRM        # If in Documents
cd ~/Projects/NNN-CRM         # If in Projects folder
```

**Option 2 - Search for it:**
```bash
find ~ -name "NNN-CRM" -type d 2>/dev/null
```

**Option 3 - Use your file browser:**
- Open Finder (Mac) or File Explorer (Windows)
- Search for "NNN-CRM"
- Right-click folder → "Open in Terminal"

### Starting the app

Once you're in the NNN-CRM folder:

```bash
# Start the development server
npm run dev
```

A URL will appear (like `http://localhost:5173`) - open it in your browser!

### Stopping the app

Press `Ctrl + C` in the terminal

---

## 📖 DAILY WORKFLOW

### Morning Start
```bash
cd NNN-CRM              # Navigate to project
git pull                # Get latest changes
npm run dev             # Start server
```

### When Claude adds features
```bash
git pull                # Pull new changes (that's it!)
# Refresh browser to see changes
```

### End of day
```bash
Ctrl + C                # Stop server
```

---

## ⚡ Quick Start (5 Minutes)

**First time setup:**

```bash
# Clone the repo
git clone https://github.com/PurplePean/NNN-CRM.git
cd NNN-CRM

# Install and start
npm install
npm run dev
```

Browser opens to `localhost:5173` - you're ready!

**Tell Claude what to build** → Claude edits & pushes → **Run `git pull`** → See changes in 5 seconds!

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

**You have 3 windows:**
1. **VS Code** - Viewing your local clone
2. **Browser (localhost:3000)** - Your running app
3. **Claude chat** - Where you tell Claude what to build

**Your workflow:**
```
You: "Add a purple background"
→ Claude edits files and pushes to GitHub
→ Claude: "Done! Run: git pull"

You: Run git pull in terminal (5 seconds)
→ Browser auto-refreshes
→ You see purple background

You: "Make it darker"
→ Claude edits and pushes
→ You: git pull
→ Browser updates
→ You see darker purple

You: "Perfect! Save my work"
→ Claude: "Already saved and pushed! ✅"
```

**Fast updates (5 seconds). Claude handles all git complexity.**

---

## Documentation

- **[SIMPLE-WORKFLOW.md](./SIMPLE-WORKFLOW.md)** - ⭐ **START HERE** - Simple commands for working with Claude
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
- Open VS Code in your project folder
- Run `npm start` in terminal
- Browser opens to localhost:3000

**During the day:**
- Tell Claude what you want (in chat)
- Claude edits and pushes to GitHub
- Run `git pull` (5 seconds)
- Browser auto-refreshes
- Iterate fast (20 changes → 1 commit)
- Tell Claude to save when ready

**End of day:**
- "Save my work"
- Stop npm start (Ctrl+C)

### Iteration Approach

1. **Describe what you want** - "I want to add CSV export"
2. **Claude builds it** - Makes changes and pushes to GitHub
3. **You pull changes** - Run `git pull` (5 seconds)
4. **Iterate quickly** - "Make it green", "Add this field", etc.
5. **Save once** - When you're happy: "Save my work"

**Minimal git knowledge needed. Claude handles commits/pushes. You just pull!**

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
