# Simple Workflow - Just Talk to Claude

**The Easiest Way**: You describe what you want, Claude makes it happen, you run `git pull`, you see it in 5 seconds.

---

## Your Simple Commands

Copy-paste these to Claude. That's all you need.

### 🚀 "Change [something specific]"

**Examples:**
- "Change the header background to purple"
- "Add a CSV export button to the property list"
- "Make the cards bigger"
- "Change the font to something modern"

**What happens:**
1. Claude edits the files and pushes to GitHub
2. Claude says: "Done! Run: git pull"
3. You run `git pull` in your terminal (5 seconds)
4. Browser auto-refreshes and shows the change ⚡

**Try it again?**
- "Actually make it dark purple instead"
- Claude edits → You: git pull → Browser updates → Done!

---

### 💾 "Save my work"

**When to use:** After you've made several changes you like

**What Claude does:**
- Commits everything with a clear message
- Pushes to GitHub
- Confirms it's saved

**You say:** "Save my work"
**Claude says:** "✅ Saved! Committed: Add purple theme and CSV export button"

---

### 🎯 "I want to work on [feature]"

**Examples:**
- "I want to work on adding CSV export"
- "I want to improve the property cards"
- "I want to add broker performance metrics"

**What Claude does:**
- Creates a plan
- May create a new branch if needed
- Starts making the changes
- Shows you progress

---

### ✅ "I'm done with this feature"

**What Claude does:**
- Reviews what was built
- Commits and pushes everything
- Merges to main if on a feature branch
- Cleans up

**You're ready for the next thing!**

---

### 🔍 "Show me what this does"

**When:** You want to understand a piece of code

**Claude will:**
- Explain the code in plain English
- Show you how it works
- Answer any questions

---

### 📝 "What should I work on next?"

**Claude will:**
- Show you the roadmap priorities
- Recommend what to build next
- Explain why it's important

---

### 🔄 "Undo that last change"

**When:** You don't like what was just changed

**Claude will:**
- Revert the last change
- Browser updates back to previous state

---

### ❓ "How do I [do something]?"

**Examples:**
- "How do I add a new property field?"
- "How do I change the color scheme?"
- "How do I export data?"

**Claude explains and can implement it for you!**

---

## Your Daily Workflow

### Morning (1 minute)
```
1. Open VS Code in your project folder
2. Open terminal and run: npm start
3. Browser opens showing your app at localhost:3000
4. Open Claude chat in browser
```

### During Development (All day)
```
You (in chat): "Add a purple gradient background"
→ Claude edits and pushes
→ Claude: "Done! Run: git pull"
→ You run: git pull
→ Browser updates (5 seconds)
→ See purple gradient

You: "Hmm, too bright. Make it darker"
→ Claude edits and pushes
→ You: git pull
→ Browser updates
→ See darker gradient

You: "Perfect! Now add a big CSV export button"
→ Claude edits and pushes
→ You: git pull
→ Browser updates
→ See the button

You: "Save my work"
→ Claude: "Already saved and pushed!"

You: "What should I add next?"
→ Claude shows roadmap

(Repeat all day!)
```

### End of Day (30 seconds)
```
You: "Save my work"
Claude: "✅ All saved!"
You: Stop npm start (Ctrl+C), close VS Code
```

---

## The Magic Formula

```
You describe what you want in plain English
           ↓
Claude edits files and pushes to GitHub
           ↓
You run: git pull (5 seconds)
           ↓
Browser auto-refreshes
           ↓
You see the change
           ↓
Love it? Say "Save my work"
Don't love it? Say "Change it to..."
```

**Iterate 20 times → Commit once → Fast updates (5 seconds)**

---

## Example Conversation

```
You: "I want to add a way to export properties to CSV"

Claude: "I'll add a CSV export feature. This will:
         1. Add an Export button to the property list
         2. Generate CSV with all property data
         3. Download as properties.csv

         Starting now..."

         *edits files*

         "✅ Done! Check your browser - there's a new
         Export button at the top of the Assets tab."

You: *sees button in browser*
     "Cool! Can you make it green instead of blue?"

Claude: *edits*
        "✅ Now green!"

You: *sees green button*
     "Perfect! Can you also add broker info to the CSV?"

Claude: *edits*
        "✅ Done! Now includes broker names in the export."

You: *tests export, sees broker names*
     "This is great! Save my work"

Claude: "✅ Saved and pushed!
         Commit: Add CSV export with property and broker data"
```

---

## You Never Need To:

❌ Learn git commands
❌ Understand branching
❌ Write commit messages
❌ Push/pull manually
❌ Resolve merge conflicts
❌ Deal with terminal commands

## You Only Need To:

✅ Describe what you want
✅ Look at your browser
✅ Say if you like it or want changes
✅ Tell Claude to save when ready

---

## Advanced Commands (Optional)

### "Create a new experimental branch"
For trying risky changes without affecting main.

### "Show me the git status"
See what's changed but not committed.

### "Explain this calculation"
Understand how the financial formulas work.

### "Test this with fake data"
Add sample properties to test features.

### "Make this responsive on mobile"
Claude will adjust styling for mobile screens.

---

## Questions?

**"What if I want to code myself?"**
→ Go ahead! Edit in VS Code locally, save, browser updates. Claude can help when you need it.

**"What if Claude breaks something?"**
→ Say "Undo that" or "Revert to how it was" - Claude can revert commits

**"Can I see the code Claude writes?"**
→ Yes! It's all in your local clone. Read, learn, modify as you wish.

**"What if I'm offline?"**
→ You can code offline! Just can't git pull Claude's changes until you're back online.

---

## The Point

**You're the designer. Claude is the implementer.**

You focus on:
- What you want to build
- How it should look
- What features to add

Claude focuses on:
- Writing the code
- Git management
- Technical details

Together: Build features fast! 🚀

---

See [README.md](./README.md) for initial setup instructions.

See [ROADMAP.md](./ROADMAP.md) for what to build next.
