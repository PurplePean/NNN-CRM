# Getting Started - From Repo to Live Environment

**Goal:** Get your repository running locally so you can test features Claude builds.

---

## Step 1: Find Your Repository (2 minutes)

### Quick Search

**On Mac/Linux:**
```bash
find ~ -name "NNN-CRM" -type d 2>/dev/null
```

**On Windows (PowerShell):**
```powershell
Get-ChildItem -Path $HOME -Filter "NNN-CRM" -Recurse -Directory -ErrorAction SilentlyContinue
```

### Common Locations

Most likely here:
```bash
~/NNN-CRM
~/Projects/NNN-CRM
~/Documents/NNN-CRM
~/Developer/NNN-CRM
/Users/yourusername/Web Apps/NNN-CRM  # Mac
C:\Users\YourName\NNN-CRM              # Windows
```

### First Time? Clone It

```bash
# Navigate where you want it
cd ~/Projects  # or ~/Documents, etc.

# Clone the repo
git clone https://github.com/PurplePean/NNN-CRM.git

# Navigate into it
cd NNN-CRM
```

---

## Step 2: Navigate to Your Repo

```bash
# Replace with your actual path from Step 1
cd "/Users/yourusername/path/to/NNN-CRM"

# Verify you're in the right place
ls
# Should see: src/, public/, package.json, README.md
```

---

## Step 3: Start Your Live Environment (1 minute)

```bash
# Install dependencies (first time only, or when updated)
npm install

# Start the development server
npm start
```

**What happens:**
- Terminal shows: "Compiling..."
- Browser opens to: `http://localhost:3000`
- You see: **NNN CRM app running live!**

**✅ You're ready!** The live environment is running.

---

## The Workflow (How It Works)

### Your Setup

**2 Windows:**
1. **Terminal** - Running `npm start` (keep it open!)
2. **Browser** - `localhost:3000` (auto-refreshes)

### Daily Flow

**Morning:**
```bash
cd "/Users/yourusername/path/to/NNN-CRM"
npm start
# Browser opens - you're ready!
```

**Testing Claude's Features:**
```bash
# In a NEW terminal tab (keep npm start running!)

# 1. Get Claude's latest work
git fetch origin

# 2. Switch to Claude's feature branch
git checkout claude/feature-name

# Browser automatically refreshes (2-3 seconds)
# ✅ You see the new feature!
```

**Making Changes (Iterate):**
```
You: "Make the button green"
Claude: [Updates the same branch, pushes to GitHub]
You: git pull origin claude/feature-name
Browser: [Auto-refreshes in 2-3 seconds]
You: [Test the green button]
```

**When You're Happy:**
```
You: "Looks good, merge it to main"
Claude: [Merges to production]
```

---

## Quick Commands Reference

```bash
# Find your repo
find ~ -name "NNN-CRM" -type d 2>/dev/null

# Navigate to it (use your path)
cd "/path/to/NNN-CRM"

# Start live environment
npm start

# See what branch you're on
git branch

# Get Claude's latest features
git fetch origin

# Switch to Claude's feature branch
git checkout claude/feature-name

# Update current branch with latest changes
git pull origin claude/feature-name

# Go back to main
git checkout main
```

---

## Troubleshooting

### "Can't find my repo"
Run: `find ~ -name "NNN-CRM" -type d 2>/dev/null`

If nothing found, clone it fresh:
```bash
cd ~/Projects
git clone https://github.com/PurplePean/NNN-CRM.git
cd NNN-CRM
```

### "Can't switch branches (local changes)"
```bash
git stash  # Save your changes temporarily
git checkout claude/feature-name
```

### "Browser doesn't refresh"
Wait 2-3 seconds - watch terminal for "Compiled successfully!"

If still nothing after 5 seconds:
```bash
Ctrl+C  # Stop npm start
npm start  # Restart it
```

### "npm start fails"
```bash
npm install  # Reinstall dependencies
npm start
```

---

## The Workflow We're Building

```
1. YOU request a feature
   "I want to add CSV export"

2. CLAUDE creates a branch and builds it
   Branch: claude/add-csv-export
   Status: Pushed to GitHub

3. YOU test it locally
   git checkout claude/add-csv-export
   Browser: [Shows the feature live]

4. Iterate until perfect
   You: "Make it green"
   Claude: [Updates same branch]
   You: git pull origin claude/add-csv-export
   Browser: [Shows green version]

5. YOU approve
   "Looks good, merge it to main"

6. CLAUDE merges (only with your approval!)
   ✅ Feature is now in production
```

**You control production. Claude never touches main without your permission.**

---

## Key Points

✅ **Keep `npm start` running** - Don't close that terminal
✅ **Browser auto-refreshes** - Wait 2-3 seconds after git operations
✅ **Use a second terminal** - For git commands while npm start runs
✅ **You control merges** - Claude only merges when you approve
✅ **Test before merging** - Always test locally first

---

## Next Steps

1. **Run these commands now:**
   ```bash
   cd "/path/to/NNN-CRM"
   npm start
   ```

2. **When ready to test a feature:**
   ```bash
   git fetch origin
   git checkout claude/feature-name
   ```

3. **Tell Claude what you want:**
   - "I want to add [feature]"
   - "Make [change]"
   - "Looks good, merge it"

---

**That's the workflow!** Find repo → Start live environment → Test Claude's features → Approve merges.
