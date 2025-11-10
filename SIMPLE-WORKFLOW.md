# Simple Workflow - Just Tell Claude What You Want

**Philosophy**: You focus on features. Claude handles git.

## Your Simple Commands

Just copy-paste these prompts to Claude. That's it.

---

### 🚀 "I want to start working on [feature/fix name]"

**Example**: "I want to start working on CSV export"

**Claude will**:
- Create a new branch for you
- Set everything up
- Tell you when you're ready to code

---

### 💾 "Save my work"

**Example**: "Save my work"

**Claude will**:
- Check what files changed
- Commit everything with a good message
- Push to GitHub
- Confirm it's saved

---

### ✅ "I'm done with this feature, merge it"

**Example**: "I'm done with this feature, merge it"

**Claude will**:
- Merge your work to main
- Delete the feature branch
- Clean everything up
- Put you back on main, ready for next feature

---

### 🔍 "Where am I? What's my status?"

**Example**: "Where am I? What's my status?"

**Claude will**:
- Tell you what branch you're on
- Show what files you've changed
- Show what iteration you're on
- Tell you what's been committed

---

### 🧹 "Clean up everything and start fresh"

**Example**: "Clean up everything and start fresh"

**Claude will**:
- Merge any outstanding work
- Delete old branches
- Clean up the repo
- Put you on clean main branch

---

### 📝 "Show me what I can work on next"

**Example**: "Show me what I can work on next"

**Claude will**:
- Show the roadmap priorities
- Recommend what to work on
- Explain the next iteration

---

## Your Daily Workflow

### Morning:
```
You: "I want to start working on property export feature"
Claude: *creates branch, sets up*
You: *codes in VS Code, saves files*
```

### During the day:
```
You: *make changes, test in browser*
You: "Save my work"
Claude: *commits and pushes*
You: *keep coding*
```

### End of day:
```
You: "Save my work"
Claude: *commits and pushes*
# Done! Your work is safe.
```

### When feature is done:
```
You: "I'm done with this feature, merge it"
Claude: *merges to main, cleans up branches*
You: "Show me what I can work on next"
Claude: *shows roadmap*
```

---

## You Never Need To:

❌ Create branches manually
❌ Write commit messages
❌ Remember git commands
❌ Merge branches
❌ Resolve conflicts (Claude will help)
❌ Clean up old branches

## You Only Need To:

✅ Tell Claude what you want to work on
✅ Code in VS Code
✅ Save files (Ctrl+S)
✅ Test in browser
✅ Tell Claude to save your work
✅ Tell Claude when you're done

---

## Advanced Commands (Optional)

### "Undo my last changes"
Claude will revert uncommitted changes.

### "Show me what changed"
Claude will show you a diff of your changes.

### "I want to try something experimental"
Claude will create an experimental branch you can throw away later.

---

## Behind The Scenes (You Don't Need To Know This)

When you say "I want to start working on X":
```bash
git checkout main
git pull origin main
git checkout -b feature/x
```

When you say "Save my work":
```bash
git add -A
git commit -m "Meaningful message based on your changes"
git push origin feature/x
```

When you say "I'm done, merge it":
```bash
git checkout main
git merge feature/x
git push origin main
git branch -d feature/x
git push origin --delete feature/x
```

But you don't need to remember any of this! Just use the simple commands above.

---

## Questions?

**"What if I break something?"**
→ Just say "Undo my changes" and Claude will fix it

**"What if I want to see the git commands?"**
→ Ask Claude "Show me the git commands you're running"

**"What if I have a merge conflict?"**
→ Claude will detect it and walk you through fixing it

**"Can I still use git commands if I want?"**
→ Yes! This is just an easier way. You can always run git commands yourself.

---

## The Point

**Git is a tool, not the goal.**

Your goal: Build a great CRM
Claude's job: Handle the git complexity

You tell Claude what you want in plain English.
Claude does the git stuff.

Simple as that.
