# AI Assistant Context - NNN CRM

**This document helps AI assistants (Claude Code, etc.) understand this repository and work effectively.**

---

## 🎯 Repository Overview

**Name:** NNN-CRM
**Type:** React-based Industrial Real Estate CRM
**Version:** 1.0
**Primary Language:** JavaScript (React 18)
**Tech Stack:** React, Tailwind CSS (CDN), localStorage, Create React App
**Owner:** PurplePean
**Main Branch:** (check with `git branch -r`)

---

## 📋 Current State

### Architecture Status
- **Monolithic:** Single 3,285-line App.jsx component
- **No components extracted yet**
- **No TypeScript**
- **No tests**
- **No backend** (localStorage only)

See [ROADMAP.md](./ROADMAP.md) for refactoring plan (Iterations 3-10).

### Recent Changes
- Development workflow documentation established
- Feature branch workflow implemented
- LOCAL-SETUP.md created for laptop development

---

## 🔄 Development Workflow (CRITICAL)

### **Core Rule: Feature Branch Workflow**

```
USER requests feature
  ↓
AI creates: claude/feature-name
  ↓
AI develops on branch, commits, pushes to GitHub
  ↓
USER tests locally: git checkout claude/feature-name
  ↓
Iterate: USER requests changes → AI updates same branch
  ↓
USER approves: "Create a PR" or "Looks good, merge it"
  ↓
AI creates PR (or USER does manually)
  ↓
USER reviews and merges to main (USER CONTROLS THIS)
```

### **Critical Constraints:**
1. ✅ **ALWAYS work on feature branches** named `claude/*`
2. ✅ **NEVER push directly to main** without user approval
3. ✅ **NEVER merge to main** without explicit user permission
4. ✅ User controls production (main branch)
5. ✅ Create PR when user says "Create a PR" or "Looks good, merge it"

---

## 📂 File Structure

```
/home/user/NNN-CRM/
├── src/
│   ├── App.jsx           # 3,285 lines - MONOLITHIC (needs refactoring)
│   ├── index.js          # React entry point
│   └── index.css         # Tailwind directives
├── public/
│   └── index.html        # HTML template
├── .claude/
│   └── AI-CONTEXT.md     # This file (AI assistant guide)
├── LOCAL-SETUP.md        # Laptop setup for user
├── SIMPLE-WORKFLOW.md    # User-facing workflow guide
├── ROADMAP.md           # Feature roadmap and iterations
├── README.md            # Project overview
├── package.json         # Dependencies
└── .gitignore
```

---

## 🤖 AI Assistant Instructions

### When Starting a New Session

1. **Read this file first** to understand context
2. **Check current branch:** `git branch`
3. **Check git status:** `git status`
4. **Read ROADMAP.md** to understand priorities
5. **Never assume** - ask user for clarification if unclear

### When User Requests a Feature

```javascript
// Step 1: Create feature branch
const branchName = `claude/${featureName}`
git checkout -b ${branchName}

// Step 2: Plan the work
// - Create todo list with TodoWrite tool
// - Outline what you'll build
// - Get user confirmation if unclear

// Step 3: Develop
// - Make changes
// - Commit frequently with clear messages
// - Push to GitHub

// Step 4: Inform user
// Tell user:
// - Branch name
// - What was built
// - How to test: git checkout ${branchName}
// - Ask for feedback

// Step 5: Iterate or finalize
// - If changes needed: update same branch
// - If approved: create PR or merge (with permission)
```

### Code Quality Standards

**DO:**
- ✅ Add error handling (try-catch for localStorage, etc.)
- ✅ Validate inputs (no negative numbers, etc.)
- ✅ Write clear commit messages
- ✅ Use descriptive variable names
- ✅ Follow existing code style
- ✅ Test calculations thoroughly

**DON'T:**
- ❌ Push to main without approval
- ❌ Use `alert()` or `confirm()` (use modals instead)
- ❌ Add dependencies without asking
- ❌ Break existing functionality
- ❌ Skip error handling

---

## 📖 Key Documents

### For AI Assistants (Read First)
1. **AI-CONTEXT.md** (this file) - AI instructions
2. **ROADMAP.md** - What to build next, priorities

### For Users
1. **LOCAL-SETUP.md** - How to clone and set up laptop
2. **SIMPLE-WORKFLOW.md** - How to work with Claude
3. **README.md** - Project overview

---

## 🎯 Common Tasks

### "I want to add [feature]"

```bash
# 1. Create branch
git checkout -b claude/add-${feature-name}

# 2. Use TodoWrite to plan
TodoWrite: [
  "Analyze requirements",
  "Design implementation",
  "Write code",
  "Test functionality",
  "Commit and push"
]

# 3. Implement

# 4. Commit
git add -A
git commit -m "Add ${feature}: ${description}"

# 5. Push
git push -u origin claude/add-${feature-name}

# 6. Tell user
"✅ Feature complete!
Branch: claude/add-${feature-name}
To test: git checkout claude/add-${feature-name}
Changes: [list what was built]"
```

### "What should I work on next?"

```bash
# 1. Read ROADMAP.md
# 2. Recommend based on priorities:
#    - Priority 1: Critical refactoring (Iterations 3-6)
#    - Priority 2: Quality improvements (Iterations 7-10)
#    - Priority 3: New features (Feature Backlog)

# 3. Explain why it's important
```

### "Create a PR"

```bash
# If gh CLI available:
gh pr create --title "${title}" --body "${description}" --base main

# If not available:
# Tell user to create PR manually with provided:
# - Title
# - Description
# - Link to create PR
```

### "Merge it to main"

```bash
# ONLY with explicit user approval!

# Option 1: If on feature branch
git checkout main || echo "Note: main branch might have different name"
git merge ${feature-branch}
git push origin main

# Option 2: Via GitHub (preferred)
# Tell user: "I'll merge via GitHub" then use gh CLI or instruct manual merge
```

---

## 🚨 Critical Errors to Avoid

1. **Pushing to main without approval**
   - ALWAYS work on `claude/*` branches
   - NEVER `git push origin main` unless user explicitly approves

2. **Breaking the app**
   - Test before pushing
   - Don't remove existing functionality without permission
   - Add error handling

3. **Ignoring user control**
   - User decides when to merge
   - User decides what features to build
   - Ask for clarification if requirements unclear

4. **Poor git hygiene**
   - Don't leave branches half-finished
   - Write clear commit messages
   - Push regularly so user can test

---

## 🔍 Understanding the Codebase

### Main Features (src/App.jsx)
- Property CRUD with underwriting calculations
- Broker management
- Partner/LP tracking
- Gatekeeper contacts
- Dark mode
- Notes system
- Photo upload (base64 to localStorage)
- Sensitivity analysis

### Financial Calculations
- Cap Rate, DSCR, Cash-on-Cash returns
- LTV-based financing
- IRR (Newton-Raphson method)
- Amortization schedules
- Exit analysis

### Data Storage
- **localStorage** only (no backend yet)
- Keys: `properties`, `brokers`, `partners`, `gatekeepers`, `darkMode`
- JSON serialization
- No validation on load (needs error handling)

### Known Issues (See ROADMAP.md for full list)
- Monolithic component (3,285 lines)
- No error handling
- Minimal input validation
- No tests
- No TypeScript
- Performance issues (no memoization)

---

## 📊 Project Priorities

### High Priority (Do First)
1. Error handling and validation (Iteration 7)
2. Component decomposition (Iterations 3-6)
3. Business logic extraction (Iteration 4)

### Medium Priority
1. Custom hooks (Iteration 5)
2. Performance optimization (Iteration 8)
3. TypeScript migration (Iteration 9)

### Low Priority
1. Testing infrastructure (Iteration 10)
2. Backend integration (Iteration 11)
3. New features (Feature Backlog)

See [ROADMAP.md](./ROADMAP.md) for details.

---

## 💡 Tips for Effective Collaboration

### Communicate Clearly
- ✅ Explain what you're doing before you do it
- ✅ Show progress with TodoWrite
- ✅ Ask for clarification when requirements are vague
- ✅ Provide clear testing instructions

### Be Proactive
- ✅ Suggest improvements from ROADMAP.md
- ✅ Point out potential issues
- ✅ Offer alternatives when appropriate

### Respect User Control
- ✅ User decides priorities
- ✅ User approves merges
- ✅ User controls production
- ✅ Don't make major decisions without asking

---

## 🔄 Continuity Between Sessions

### What to Check
```bash
# 1. Current branch and status
git branch
git status

# 2. Recent activity
git log --oneline -5

# 3. Open branches
git branch -a | grep claude/

# 4. Any uncommitted work
git diff
```

### What to Ask User
- "Where did we leave off?"
- "What would you like to work on?"
- "Any branches ready to merge?"

---

## 📚 Learning the Codebase

### First-Time in Repo?
1. Read this file (AI-CONTEXT.md)
2. Skim README.md for project overview
3. Read ROADMAP.md for context on what's planned
4. Check git status and current branch
5. Ask user what they want to work on

### Understanding App.jsx
- Lines 1-100: Imports and state declarations
- Lines 100-500: Handler functions (CRUD operations)
- Lines 500-1000: Calculation functions
- Lines 1000-3285: JSX rendering (forms, cards, modals)

**Note:** This needs refactoring (see ROADMAP.md Iterations 3-6)

---

## 🎯 Success Metrics

### You're Doing Well If:
- ✅ User can test features locally with hot reload
- ✅ All changes are on feature branches
- ✅ User approves before merging to main
- ✅ Code works as expected
- ✅ No breaking changes
- ✅ Clear communication throughout

### Red Flags:
- ❌ Pushing to main without approval
- ❌ User can't test locally
- ❌ Breaking existing features
- ❌ Unclear what you're building
- ❌ No response to user feedback

---

## 🆘 Common Issues

### "Can't push to branch"
- Check branch name starts with `claude/`
- Ensure you're not pushing to main

### "User wants to test but can't"
- Ensure you pushed to GitHub
- Provide branch name
- Give clear checkout instructions

### "Merge conflict"
- Pull latest from target branch
- Resolve conflicts
- Ask user for guidance if unclear

### "Feature request is vague"
- Ask clarifying questions
- Propose implementation approach
- Get user approval before proceeding

---

## 🎓 Example Session

```
NEW CLAUDE SESSION STARTS

1. Read AI-CONTEXT.md (this file)
2. Check: git status
3. See: On branch claude/some-feature

User: "What were we working on?"

You: [Check git log] "Looks like we were working on CSV export.
     The branch claude/add-csv-export has 3 commits.
     Would you like to continue with this, or start something new?"

User: "Let's add the broker names to that export"

You: [Switch to that branch if needed]
     [Make changes]
     [Commit and push]
     "✅ Updated CSV export to include broker names.
     To test: git pull origin claude/add-csv-export
     Your browser will hot-reload in 2-3 seconds."

User: "Perfect! Merge it to main"

You: [Create PR or merge with user approval]
     "✅ Merged to main! Feature is live."
```

---

## 📝 Version History

- **2025-01-15:** Initial AI-CONTEXT.md created
- **Current Version:** 1.0
- **Last Updated:** 2025-01-15

---

**Remember: You're a collaborator, not a decision-maker. The user owns this project. Your job is to build what they ask for, suggest improvements, and maintain quality. Always work on feature branches, never touch main without approval, and communicate clearly.**

---

*This document should be updated as the workflow or project evolves.*
