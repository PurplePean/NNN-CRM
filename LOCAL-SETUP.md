# Local Development Setup Guide

This guide will get you up and running with the NNN CRM on your laptop in **5 minutes**.

---

## 📋 Prerequisites

Make sure you have these installed:

- **Node.js** (version 14 or higher)
  - Check: `node --version`
  - Download: https://nodejs.org/

- **Git**
  - Check: `git --version`
  - Download: https://git-scm.com/

- **Terminal/Command Line** access

---

## 🚀 Quick Start (First Time Setup)

### Step 1: Clone the Repository

Open your terminal and run:

```bash
# Clone the repo
git clone https://github.com/PurplePean/NNN-CRM.git

# Navigate into the folder
cd NNN-CRM
```

---

### Step 2: Install Dependencies

```bash
npm install
```

This will install all required packages (React, Tailwind, etc.). Takes about 1-2 minutes.

---

### Step 3: Start the Development Server

```bash
npm start
```

**What happens:**
- Development server starts at `http://localhost:3000`
- Browser automatically opens
- You see the NNN CRM app! 🎉

**Hot reload is enabled**: When files change (including from `git pull`), the browser automatically refreshes within 2-3 seconds. You'll see webpack recompiling in your terminal.

---

## 📂 Your Project Structure

```
NNN-CRM/
├── src/
│   ├── App.jsx          # Main application component
│   ├── index.js         # React entry point
│   └── index.css        # Tailwind CSS imports
├── public/
│   └── index.html       # HTML template
├── package.json         # Dependencies and scripts
├── README.md           # Project overview
├── ROADMAP.md          # Development roadmap
└── SIMPLE-WORKFLOW.md  # How to work with Claude
```

---

## 🔄 Daily Workflow

### Morning (Every day you want to work)

```bash
# 1. Navigate to project
cd /path/to/NNN-CRM

# 2. Make sure you're on main branch
git checkout main

# 3. Pull latest changes
git pull origin main

# 4. Start the app
npm start
```

Browser opens to `localhost:3000` - You're ready to work!

---

### During Development

**Keep `npm start` running in your terminal.**

When you want to test a feature Claude built:

```bash
# In a NEW terminal window/tab (keep npm start running)

# 1. Fetch all branches
git fetch origin

# 2. Switch to Claude's feature branch
git checkout claude/feature-name

# 3. Browser hot-reloads automatically (2-3 seconds) with the new feature
```

**Watch your terminal** - You'll see:
```
Compiling...
Compiled successfully!
```

Then the browser updates automatically! **Test the feature!**

---

### Switching Back to Main

```bash
git checkout main
# Browser hot-reloads back to main branch code (2-3 seconds)
```

---

## 🛠️ Useful Commands

### Check Your Current Branch

```bash
git branch
# The one with * is your current branch
```

### See All Available Branches

```bash
git branch -a
# Shows local and remote branches
```

### See What's Changed

```bash
git status
# Shows modified files and current branch
```

### View Commit History

```bash
git log --oneline
# Shows recent commits
```

### Pull Latest Updates on Current Branch

```bash
git pull origin <branch-name>
# Example: git pull origin claude/add-csv-export
```

---

## 🆘 Troubleshooting

### Problem: `npm install` fails

**Solution:**
```bash
# Clear npm cache
npm cache clean --force

# Try again
npm install
```

### Problem: `npm start` fails

**Solution 1: Check Node version**
```bash
node --version
# Should be 14.x or higher
```

**Solution 2: Delete and reinstall**
```bash
rm -rf node_modules package-lock.json
npm install
npm start
```

### Problem: Port 3000 already in use

**Solution:**
```bash
# Kill the process using port 3000
# On Mac/Linux:
lsof -ti:3000 | xargs kill -9

# On Windows:
netstat -ano | findstr :3000
# Note the PID, then:
taskkill /PID <number> /F

# Or just use a different port:
PORT=3001 npm start
```

### Problem: Browser doesn't refresh after `git checkout`

**Solution:**
```bash
# Restart the dev server
Ctrl+C  # Stop npm start
npm start  # Start again
```

### Problem: Can't switch branches (uncommitted changes)

**Solution:**
```bash
# Save your changes temporarily
git stash

# Switch branches
git checkout claude/feature-name

# Get your changes back later
git checkout main
git stash pop
```

### Problem: Everything is broken, start fresh

**Solution:**
```bash
# Reset to clean main branch
git checkout main
git fetch origin
git reset --hard origin/main

# Reinstall dependencies
rm -rf node_modules
npm install

# Start fresh
npm start
```

---

## 📦 What's Installed?

Your `package.json` includes:

```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-scripts": "5.0.1",
    "lucide-react": "^0.263.1"
  }
}
```

**Tech Stack:**
- **React 18** - UI framework
- **Tailwind CSS** - Styling (via CDN in index.html)
- **Create React App** - Build tooling
- **Lucide React** - Icon library

---

## 🌐 Available Scripts

### `npm start`
Runs the app in development mode at `http://localhost:3000`
- Hot reload enabled
- Shows errors in the console

### `npm test`
Runs tests (when we add them)

### `npm run build`
Creates optimized production build in `build/` folder

### `npm run eject`
**⚠️ Don't use this unless you know what you're doing!**
Ejects from Create React App (irreversible)

---

## 🎯 Next Steps

1. ✅ You have the repo cloned
2. ✅ Dependencies installed
3. ✅ App running at localhost:3000

**Now you're ready to:**
- Test features Claude builds
- Request new features
- Review changes locally
- Approve merges to production

---

## 📚 Learn More

- **[SIMPLE-WORKFLOW.md](./SIMPLE-WORKFLOW.md)** - How to work with Claude
- **[README.md](./README.md)** - Project overview and features
- **[ROADMAP.md](./ROADMAP.md)** - What to build next

---

## 💡 Pro Tips

1. **Keep npm start running** - Don't stop it between branch switches
2. **Use multiple terminal tabs** - One for npm start, one for git commands
3. **Bookmark localhost:3000** - Quick access to your app
4. **Check `git branch`** often - Know what branch you're on
5. **Pull before switching** - Always `git pull origin main` before starting work

---

## ✅ Checklist

Before requesting features from Claude, make sure:

- [ ] Repo cloned to your laptop
- [ ] `npm install` completed successfully
- [ ] `npm start` runs without errors
- [ ] Browser opens to localhost:3000
- [ ] You can see the NNN CRM interface
- [ ] You're on the `main` branch (`git branch`)

**All checked?** You're ready to build! 🚀

---

## 🎉 Success!

You now have a fully functional local development environment!

**Tell Claude:** "I'm ready to start development!"
