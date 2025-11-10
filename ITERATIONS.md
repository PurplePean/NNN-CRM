# Iteration Planning

This document defines how we plan and execute iterations for NNN CRM.

## Iteration Philosophy

**Work in small, shippable increments** - Each iteration should deliver tangible value.

## Iteration Structure

### Timeline

- **Duration**: 1-2 weeks per iteration
- **Frequency**: Continuous (start next iteration immediately)
- **Flexibility**: Can extend/shorten based on scope

### Iteration Phases

```
Plan (10%) → Build (70%) → Review (10%) → Ship (10%)
```

## Planning an Iteration

### 1. Pick a Theme

Choose ONE focus area per iteration:

- **Refactoring** - Improve code structure, no new features
- **Feature** - Add new functionality
- **Optimization** - Performance, bundle size, etc.
- **Quality** - Testing, documentation, accessibility
- **UX** - User experience improvements

### 2. Define Goals

Write 1-3 concrete goals. Keep it simple.

**Good Examples:**

```
✅ Iteration 2: Local Development Setup
   - Remove Netlify deployment
   - Configure VS Code for optimal React development
   - Document workflow for future iterations

✅ Iteration 3: Component Decomposition
   - Extract PropertyCard component
   - Extract BrokerCard component
   - Extract FormInput component
   - Reduce App.jsx from 1039 lines to <400 lines

✅ Iteration 4: Financial Calculations Refactor
   - Move all calculations to utils/financialCalculations.js
   - Add JSDoc documentation to all calc functions
   - Add unit tests for calculations (80% coverage)
```

**Bad Examples:**

```
❌ "Make the app better"
   (Too vague)

❌ "Refactor everything and add TypeScript and add 10 features"
   (Too much scope)

❌ "Fix bugs"
   (Not specific enough)
```

### 3. Break Down into Tasks

For each goal, list specific tasks (5-15 tasks per iteration):

```markdown
## Iteration 3: Component Decomposition

### Tasks

- [ ] Create src/components folder structure
- [ ] Extract PropertyCard.jsx from App.jsx
- [ ] Extract BrokerCard.jsx from App.jsx
- [ ] Extract FormInput.jsx for reusable form inputs
- [ ] Extract Modal.jsx for reusable modal wrapper
- [ ] Extract useTheme.js custom hook
- [ ] Update App.jsx to use new components
- [ ] Test all components in browser
- [ ] Verify dark mode still works
- [ ] Update documentation
```

### 4. Estimate Effort

Use t-shirt sizes:

- **XS** - < 1 hour
- **S** - 1-3 hours
- **M** - 3-8 hours (half-day to full-day)
- **L** - 1-2 days
- **XL** - 3-5 days

If anything is XL, break it down further.

## During an Iteration

### Daily Progress

1. **Work on tasks** sequentially
2. **Commit frequently** (multiple times per day)
3. **Test in browser** after each meaningful change
4. **Update task list** - Check off completed tasks
5. **Push daily** - Don't lose work

### Tracking Progress

Use this simple format in your iteration doc:

```markdown
## Progress

### Day 1 (2025-11-10)
- ✅ Created components folder
- ✅ Extracted PropertyCard component
- ⏳ Started BrokerCard extraction (50% done)

### Day 2 (2025-11-11)
- ✅ Completed BrokerCard component
- ✅ Extracted FormInput component
- 🔴 Found issue: Dark mode not working in PropertyCard
  - Fixed by passing darkMode prop
```

Symbols:
- ✅ Done
- ⏳ In progress
- 🔴 Blocked/Issue
- 📝 Note

### When Things Change

**It's okay to adjust!**

If you discover:
- Tasks are bigger than expected → Remove lower priority items
- New critical bug → Add to iteration, remove something else
- Easier approach found → Document and adjust plan

**Rule**: Keep the iteration scope roughly the same. Add something? Remove something.

## Completing an Iteration

### Review Checklist

Before closing an iteration:

- [ ] All planned tasks completed or explicitly deferred
- [ ] Code works in browser without errors
- [ ] Changes committed and pushed
- [ ] Pull request created and merged
- [ ] Documentation updated (if needed)
- [ ] Retrospective completed (see below)

### Retrospective

Answer these 3 questions:

1. **What went well?**
   - What should we keep doing?

2. **What didn't go well?**
   - What blocked progress?
   - What took longer than expected?

3. **What will we change next iteration?**
   - Specific adjustments to process/approach

Example:

```markdown
## Iteration 2 Retrospective (2025-11-10)

### What went well
- VS Code setup was straightforward
- Documentation is much clearer now
- Removing Netlify cleaned up complexity

### What didn't go well
- Took longer to understand branch structure than expected
- Should have checked for more deployment artifacts

### Changes for next iteration
- Start with better analysis phase
- Create checklist for cleanup tasks
```

### Ship It

1. Merge PR to main
2. Tag the release (optional but nice):
   ```bash
   git tag -a v1.1-iteration-2 -m "Local dev setup complete"
   git push origin v1.1-iteration-2
   ```
3. Update ROADMAP.md to mark iteration complete
4. Celebrate! 🎉

## Iteration Template

Copy this template to start a new iteration:

```markdown
# Iteration N: [Theme Name]

**Dates**: YYYY-MM-DD to YYYY-MM-DD
**Theme**: [Refactoring/Feature/Optimization/Quality/UX]
**Branch**: feature/iteration-N-short-name

## Goals

1. [Primary goal]
2. [Secondary goal]
3. [Tertiary goal - optional]

## Tasks

- [ ] Task 1 (Size: S)
- [ ] Task 2 (Size: M)
- [ ] Task 3 (Size: S)
- [ ] Task 4 (Size: L)
- [ ] Task 5 (Size: XS)

**Total estimated effort**: [X days]

## Progress

### Day 1 (YYYY-MM-DD)
- Started...

## Retrospective

### What went well
-

### What didn't go well
-

### Changes for next iteration
-

## Outcome

[Final summary when complete]
```

## Current Iteration

See [ROADMAP.md](./ROADMAP.md) for the current iteration status.

## Past Iterations

### Iteration 1: V1 Release (Completed)
- Initial CRM with property & broker management
- Financial underwriting calculations
- Dark mode, localStorage persistence
- Netlify deployment

### Iteration 2: Local Development Setup (Completed 2025-11-10)
- ✅ Removed Netlify deployment configuration
- ✅ Configured VS Code for React development
- ✅ Created workflow documentation
- Branch: `claude/iteration-and-upgrades-011CUy1TVMDEg7xkYgyYQwF2`

### Iteration 3: [Next - see ROADMAP.md]

## Tips for Success

### Keep Iterations Small

**Better**: 10 small iterations over 10 weeks
**Worse**: 1 massive iteration over 10 weeks

Small iterations mean:
- Faster feedback
- Less risk
- More motivation (frequent wins)
- Easier to course-correct

### Focus on One Thing

If the iteration theme is "Refactoring", don't add new features.
If the theme is "Feature", don't do major refactoring.

Mix of work is fine, but have ONE primary focus.

### Document as You Go

Don't wait until the end. Update progress daily:
- Quick notes are fine
- Screenshots help
- Record decisions ("Why did we choose X?")

### Commit Often

Aim for 5-10 commits per day:
- Each commit should be a logical unit
- Easier to revert if needed
- Creates a clear history

### Celebrate Progress

Check off that task! Ship that iteration! You did it!

Small wins add up to big impact.
