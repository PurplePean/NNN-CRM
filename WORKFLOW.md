# Development Workflow

This document defines the simple, effective workflow for developing NNN CRM.

## Philosophy

**Simple and Fast** - Minimize overhead, maximize iteration speed.

## Branch Structure

We use a simplified two-branch workflow:

```
main (production-ready code)
  └── feature/* (short-lived feature branches)
```

### Branches

#### `main`
- **Purpose**: Production-ready, stable code
- **Protection**: Requires pull request approval
- **Deploy**: Ready to deploy at any time
- **Merges**: Only from feature branches via PR

#### `feature/*` or `claude/*`
- **Purpose**: Individual features, fixes, or iterations
- **Naming**: `feature/short-description` or `claude/task-name-{session-id}`
- **Lifetime**: Short-lived (1-5 days ideal)
- **Creation**: Branch from `main`
- **Deletion**: Delete after merge

#### Legacy: `dev` branch
- **Status**: Being phased out (previously used for Netlify staging)
- **Action**: Will be deleted once current work is merged

## Development Workflow

### Starting New Work

```bash
# 1. Ensure you're on main and up-to-date
git checkout main
git pull origin main

# 2. Create a feature branch
git checkout -b feature/your-feature-name

# 3. Make your changes
# ... code, test, iterate ...

# 4. Commit frequently with clear messages
git add .
git commit -m "Add specific change description"

# 5. Push to remote
git push -u origin feature/your-feature-name

# 6. Create a Pull Request on GitHub
# ... review, discuss, iterate ...

# 7. Merge to main when ready
# ... merge via GitHub ...

# 8. Clean up
git checkout main
git pull origin main
git branch -d feature/your-feature-name
```

### Daily Workflow

```bash
# Morning: Start dev server
npm start

# Work: Edit files in VS Code
# - Auto-save formats code
# - Browser auto-refreshes
# - Make incremental changes

# Throughout the day: Commit progress
git add .
git commit -m "Descriptive message"

# End of day: Push work
git push origin feature/your-feature-name
```

## Commit Messages

### Format

```
<type>: <short summary>

<optional detailed description>
```

### Types

- `feat:` - New feature
- `fix:` - Bug fix
- `refactor:` - Code restructuring (no behavior change)
- `docs:` - Documentation only
- `style:` - Formatting, whitespace
- `test:` - Adding or updating tests
- `chore:` - Maintenance, dependencies

### Examples

```
feat: Add CSV export for properties

Implements export functionality for property data including
all calculated metrics and broker relationships.
```

```
refactor: Extract financial calculations to utils

Moved calculateMetrics and related functions to
src/utils/financialCalculations.js for better reusability.
```

```
fix: Correct DSCR calculation when NOI is negative

Added validation to prevent division errors and display
appropriate warning message.
```

## Pull Request Process

### 1. Create PR

- Use the PR template (auto-populated)
- Link to any related issues/iterations
- Add clear description of changes
- Self-review your code first

### 2. Review Checklist

Before submitting for review:

- [ ] Code runs without errors (`npm start`)
- [ ] All changes are intentional
- [ ] Removed console.logs and debug code
- [ ] Formatted properly (auto-format on save should handle this)
- [ ] No secrets or credentials committed
- [ ] Calculations are tested manually
- [ ] Dark mode works (if UI changes)
- [ ] Responsive on mobile (if UI changes)

### 3. Merge Strategy

- **Squash and merge** for feature branches (keeps main clean)
- **Regular merge** for critical fixes (preserves history)
- Delete branch after merge

## Iteration Planning

See [ITERATIONS.md](./ITERATIONS.md) for the iteration planning framework.

## Quick Reference

### Common Commands

```bash
# Start development
npm start

# Check current branch and status
git status
git branch

# Switch branches
git checkout main
git checkout -b feature/new-feature

# Save work
git add .
git commit -m "Your message"
git push

# Update from main
git checkout main
git pull origin main
git checkout feature/your-branch
git merge main

# View changes
git diff
git log --oneline -10
```

### Emergency: Undo Last Commit

```bash
# Keep changes, undo commit
git reset --soft HEAD~1

# Discard changes, undo commit
git reset --hard HEAD~1
```

### Emergency: Discard All Local Changes

```bash
# Discard all uncommitted changes
git checkout .
git clean -fd
```

## VS Code Integration

### Recommended Workflow

1. **Sidebar**: Use Git panel (Source Control icon)
   - See all changed files
   - Stage/unstage with +/- icons
   - Write commit message in text box
   - Click ✓ to commit

2. **Terminal**: Open integrated terminal (Ctrl+`)
   - Run `npm start`
   - View build output
   - Run git commands

3. **Extensions**:
   - GitLens (optional but helpful)
   - GitHub Pull Requests (manage PRs in VS Code)

### VS Code Git Shortcuts

- `Ctrl+Shift+G` - Open Git panel
- `Ctrl+Enter` - Commit staged changes
- `Ctrl+Shift+P` → "Git: Push" - Push commits

## Best Practices

### DO

✅ Commit frequently (multiple times per day)
✅ Write clear commit messages
✅ Test in browser before committing
✅ Keep feature branches small and focused
✅ Merge main into your branch regularly
✅ Delete branches after merging

### DON'T

❌ Commit directly to main
❌ Leave branches open for weeks
❌ Commit untested code
❌ Use vague commit messages ("fix", "update", "wip")
❌ Commit secrets, API keys, or credentials
❌ Force push (`git push -f`) unless you know why

## Troubleshooting

### "Your branch has diverged"

```bash
# If you haven't pushed yet
git pull origin main
git rebase main

# If you have pushed
git pull origin feature/your-branch --rebase
```

### "Merge conflict"

1. Open conflicted files in VS Code
2. Use VS Code's merge conflict UI (appears automatically)
3. Choose "Accept Current", "Accept Incoming", or edit manually
4. Save file
5. Stage the resolved file: `git add <file>`
6. Continue: `git commit` (no message needed for merge commits)

### "Cannot push - rejected"

```bash
# Pull latest changes first
git pull origin feature/your-branch

# Then try pushing again
git push origin feature/your-branch
```

## Questions?

Update this document as you learn! This is a living document that should evolve with the team's needs.
