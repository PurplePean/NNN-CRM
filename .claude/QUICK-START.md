# Quick Start for AI Assistants

**Read this first when starting a new Claude Code session.**

---

## ⚡ 30-Second Context

**Repo:** React-based Industrial Real Estate CRM
**Version:** 1.0 (monolithic, needs refactoring)
**Workflow:** Feature branches (`claude/*`) → User tests locally → User approves → Merge to main
**Rule:** USER controls production. NEVER push/merge to main without explicit approval.

**User's Repo Location:** `/Users/zruss/Web Apps/NNN-CRM` (Mac)

---

## 🎯 If User Asks "Help me set up the workflow"

**Your response:**

"I'll help you set up the development workflow. Here's what we'll do:

**Step 1: Find your repository**
```bash
find ~ -name "NNN-CRM" -type d 2>/dev/null
```

**Step 2: Navigate to it**
```bash
cd "/path/to/NNN-CRM"  # Use the path from step 1
```

**Step 3: Start your live environment**
```bash
npm install  # First time or when dependencies update
npm start    # Starts live server at localhost:3000
```

That's it! Your browser will open and show the app.

For complete instructions, see [GETTING-STARTED.md](../GETTING-STARTED.md)

What's your repo path from Step 1?"

---

## 🎯 First Steps in New Session

```bash
# 1. Check where you are
git branch        # Current branch
git status        # Working tree status

# 2. Read context
cat .claude/AI-CONTEXT.md     # Full context (5 min read)
cat ROADMAP.md                # What to build next

# 3. Ask user
"What would you like to work on today?"
```

---

## 🔄 Standard Workflow

```
USER: "I want to add CSV export"

YOU:
1. Create branch: claude/add-csv-export
2. Plan with TodoWrite tool
3. Build feature
4. Commit & push to GitHub
5. Tell user:
   "✅ Done! Branch: claude/add-csv-export
    To test: git checkout claude/add-csv-export
    Changes: [list]"

USER tests locally, requests changes OR approves

If changes needed:
  - Update same branch
  - Push updates
  - User tests again

If approved:
  USER: "Create a PR" or "Merge it"
  YOU: Create PR or merge (with permission only!)
```

---

## ⚠️ Critical Rules

1. ✅ **Feature branches only** - `claude/feature-name`
2. ❌ **NEVER push to main** without user saying "merge it" or "merge to main"
3. ✅ **User controls merges** - They decide when features go live
4. ✅ **Clear communication** - Explain what you're doing
5. ✅ **Use TodoWrite** - Track progress visibly

---

## 📂 Key Files

**For AI (read these):**
- `.claude/AI-CONTEXT.md` - Complete AI instructions
- `ROADMAP.md` - Feature priorities

**For users:**
- `LOCAL-SETUP.md` - Laptop setup
- `SIMPLE-WORKFLOW.md` - How to work with Claude
- `README.md` - Project overview

---

## 🎯 Common Commands

```bash
# Create feature branch
git checkout -b claude/feature-name

# Commit changes
git add -A
git commit -m "Add feature: description"

# Push to GitHub
git push -u origin claude/feature-name

# Check status
git status
git branch
git log --oneline -5
```

---

## 💡 Quick Tips

- **Unclear request?** Ask for clarification
- **Big feature?** Use TodoWrite to plan first
- **User testing?** Provide clear branch name and instructions
- **Ready to merge?** ONLY with user approval
- **What's next?** Check ROADMAP.md priorities

---

## 🔍 Codebase Overview

```
src/App.jsx              # 3,285 lines - EVERYTHING is here (needs refactoring)
  ├── State (45 variables)
  ├── Handlers (27 functions)
  ├── Calculations (10+ functions)
  └── JSX (forms, cards, modals)

Current tech: React 18, Tailwind CSS, localStorage
Current issues: Monolithic, no tests, no error handling
Priority: Refactoring (see ROADMAP Iterations 3-10)
```

---

## 🆘 Emergency Recovery

```bash
# If something breaks
git checkout main
git reset --hard origin/main

# If user can't test
git push -u origin <branch-name>
# Then tell user the branch name

# If confused
cat .claude/AI-CONTEXT.md
# Ask user for guidance
```

---

**Full details:** Read [AI-CONTEXT.md](./.claude/AI-CONTEXT.md)
**User workflow:** Read [SIMPLE-WORKFLOW.md](../SIMPLE-WORKFLOW.md)
**Roadmap:** Read [ROADMAP.md](../ROADMAP.md)

---

**Remember:** You work FOR the user. They own the project. Build what they ask, suggest improvements, respect their control over production. Always feature branches, always get approval for merges.
