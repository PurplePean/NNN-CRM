# Development Workflow - Feature Branch Review Process

**Your Control**: You request features → Claude builds on branches → You test locally → You approve merges to production.

---

## 🎯 How It Works

```
YOU (Request)
  "I want CSV export"
         ↓
CLAUDE (Build)
  Creates branch: claude/add-csv-export
  Develops feature
  Pushes to GitHub
         ↓
YOU (Test)
  Pull branch to laptop
  Run npm start
  Test in browser (localhost:3000)
         ↓
Decision:
  ✅ Good? → Create PR → You merge to main
  🔄 Changes needed? → Claude updates → Test again
```

---

## 🚀 One-Time Setup (Your Laptop)

### Initial Clone (First time only)

```bash
# 1. Clone the repository
git clone https://github.com/PurplePean/NNN-CRM.git
cd NNN-CRM

# 2. Install dependencies
npm install

# 3. Start development server
npm start
```

Browser opens to `http://localhost:3000` - You're ready! ✅

---

## 📋 Daily Development Workflow

### Morning Setup (30 seconds)

```bash
# 1. Open terminal in your NNN-CRM folder
cd /path/to/NNN-CRM

# 2. Make sure you're on main branch
git checkout main

# 3. Get latest updates
git pull origin main

# 4. Start the app
npm start
```

Browser opens to `localhost:3000` showing your app.

---

## 🔄 Feature Development Cycle

### Step 1: Request a Feature

**You say to Claude:**
```
"I want to add CSV export functionality"
```

**Claude responds:**
```
Creating feature branch: claude/add-csv-export
I'll implement:
1. Export button in the UI
2. CSV generation logic
3. Download functionality

Starting development...
```

---

### Step 2: Claude Develops

Claude works in the cloud and:
- ✅ Creates feature branch
- ✅ Writes the code
- ✅ Commits changes
- ✅ Pushes to GitHub

**Claude tells you:**
```
✅ Feature complete!

Branch: claude/add-csv-export
Commits: 4 commits
Files changed: 2 files

To test locally:
git fetch origin
git checkout claude/add-csv-export
npm start
```

---

### Step 3: You Test Locally

**In your terminal (on your laptop):**

```bash
# 1. Fetch the new branch from GitHub
git fetch origin

# 2. Switch to Claude's feature branch
git checkout claude/add-csv-export

# 3. Start the app (if not already running)
npm start
```

**Your browser hot-reloads automatically (2-3 seconds)** → You see the new feature live! 🎉

**Test it out:**
- Click buttons
- Try the functionality
- Check if it works as expected

---

### Step 4: Review & Decide

**Option A: Needs Changes**

**You say:**
```
"The button should be green, and add a timestamp to the filename"
```

**Claude:**
- Makes changes on the same branch
- Pushes updates to GitHub

**You:**
```bash
# Pull the updates
git pull origin claude/add-csv-export

# ✨ Browser hot-reloads automatically (2-3 seconds)
# Test again
```

**Repeat until satisfied!**

---

**Option B: Looks Good!**

**You say:**
```
"Looks great! Create a PR"
```

**Claude:**
- Creates Pull Request
- Adds description of changes
- Provides PR link

**You:**
- Review PR on GitHub
- See all commits and changes
- Decide to merge

**You say:**
```
"Merge it to main"
```

**Claude:**
- Merges PR to main
- Deletes feature branch (optional)
- Confirms merge

---

### Step 5: Back to Main

**In your terminal:**

```bash
# Switch back to main branch
git checkout main

# Get the newly merged changes
git pull origin main

# Continue working!
```

---

## 📝 Simple Commands

Copy-paste these to Claude:

### 🚀 "I want to add [feature]"
**Examples:**
- "I want to add CSV export"
- "I want to add partner/LP tracking"
- "I want to improve the underwriting calculations"

**What happens:**
1. Claude creates feature branch: `claude/feature-name`
2. Claude develops and pushes to GitHub
3. You pull and test locally
4. Iterate until perfect
5. Create PR and merge to main

---

### 🔄 "Make [change] to the current feature"
**Examples:**
- "Make the button green instead of blue"
- "Add broker names to the export"
- "Change the calculation formula"

**What happens:**
1. Claude updates the same feature branch
2. Claude pushes changes
3. You pull: `git pull origin claude/feature-name`
4. Browser refreshes with changes

---

### ✅ "Looks good, create a PR"

**What happens:**
1. Claude creates Pull Request
2. Claude adds description and summary
3. You review on GitHub
4. You decide when to merge

---

### ❌ "Scrap this, start over"

**What happens:**
1. Claude abandons current branch
2. You switch back to main: `git checkout main`
3. Start fresh with new feature

---

### 🔍 "Show me what you built"

**Claude responds with:**
- Link to branch on GitHub
- List of changes made
- Instructions to test locally

---

### 📋 "What should I work on next?"

**Claude will:**
- Reference ROADMAP.md
- Suggest next priority feature
- Explain the value

---

## 🎨 Example Full Workflow

```
YOU: "I want to add CSV export for properties"

CLAUDE: "Creating branch claude/add-csv-export...
         Implementing CSV export feature...
         ✅ Done! 4 commits pushed.

         To test:
         git fetch origin
         git checkout claude/add-csv-export
         npm start"

YOU: [In terminal]
     git fetch origin
     git checkout claude/add-csv-export
     [npm start already running, browser refreshes]

     [Clicks Export button, downloads CSV]

     "The CSV works but add the broker names too"

CLAUDE: "Adding broker names to CSV export...
         ✅ Updated! Pull the changes:
         git pull origin claude/add-csv-export"

YOU: [In terminal]
     git pull origin claude/add-csv-export
     [Browser refreshes]

     [Tests again, sees broker names]

     "Perfect! Create a PR"

CLAUDE: "✅ Pull Request created!
         https://github.com/PurplePean/NNN-CRM/pull/123

         Ready to merge when you approve."

YOU: [Reviews PR on GitHub]
     "Looks good, merge it"

CLAUDE: "✅ Merged to main!
         Branch claude/add-csv-export deleted.

         Switch back to main:
         git checkout main
         git pull origin main"

YOU: [In terminal]
     git checkout main
     git pull origin main

     "What should I work on next?"

CLAUDE: "Based on ROADMAP.md, I recommend:
         Iteration 3: Component Decomposition
         This will make the codebase much easier to maintain..."
```

---

## 🛠️ Common Commands Reference

### Branch Management

```bash
# See all branches
git branch -a

# Switch to a feature branch to test
git checkout claude/feature-name

# Go back to main
git checkout main

# Get latest from main
git pull origin main

# Get latest from feature branch
git pull origin claude/feature-name
```

### Viewing Changes

```bash
# See what branch you're on
git branch

# See what changed
git status

# See commit history
git log --oneline

# See changes in files
git diff
```

### Fresh Start

```bash
# If you want to reset everything to main
git checkout main
git fetch origin
git reset --hard origin/main
```

---

## ✅ What You Control

- ✅ **Feature requests** - You decide what to build
- ✅ **Testing** - You test every feature locally before production
- ✅ **Approval** - You approve (or reject) every change
- ✅ **Merging** - You decide when features go to production
- ✅ **Main branch** - Claude NEVER pushes directly to main

## 🤖 What Claude Does

- 🤖 Creates feature branches
- 🤖 Writes code
- 🤖 Commits and pushes to feature branches
- 🤖 Creates Pull Requests
- 🤖 Merges only when you approve
- 🤖 Follows your directions for changes

---

## 🎯 Key Benefits

1. **Safe Experimentation**
   - Main branch always stable
   - Feature branches can be discarded
   - No risk to production

2. **Full Control**
   - You test everything before it goes live
   - You approve all merges
   - You see all changes

3. **Easy Iteration**
   - Request changes on same branch
   - Fast feedback loop
   - See changes instantly in browser

4. **Clean History**
   - Organized feature branches
   - Clear Pull Requests
   - Easy to track what changed

---

## 🆘 Troubleshooting

### "Browser doesn't hot-reload after git pull"

**Wait 2-3 seconds** - React dev server detects file changes and hot-reloads automatically.

If it still doesn't update after 5 seconds:
```bash
# Rare case: Restart the dev server
Ctrl+C  # Stop npm start
npm start  # Start again
```

**Pro tip:** Keep an eye on the terminal - you'll see webpack recompiling when files change.

### "npm start fails"

```bash
# Dependencies might be out of sync
npm install
npm start
```

### "Which branch am I on?"

```bash
git branch
# The one with * is your current branch
```

### "I have local changes and can't switch branches"

```bash
# Stash your changes
git stash

# Switch branches
git checkout claude/feature-name

# Get your changes back later
git checkout main
git stash pop
```

### "Something broke, go back to main"

```bash
git checkout main
git reset --hard origin/main
npm install
npm start
```

---

## 📚 Additional Resources

- **[README.md](./README.md)** - Project overview and features
- **[ROADMAP.md](./ROADMAP.md)** - What to build next, priorities
- **GitHub** - View all branches and PRs: https://github.com/PurplePean/NNN-CRM

---

## 🚀 Ready to Start?

1. ✅ Clone repo to your laptop (one-time setup)
2. ✅ Run `npm install` (one-time setup)
3. ✅ Run `npm start` every morning
4. ✅ Tell Claude what feature you want
5. ✅ Test locally
6. ✅ Approve and merge
7. ✅ Build awesome features! 🎉

---

**You're the Product Owner. Claude is the Developer. You control production.** ✨
