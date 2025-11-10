# Codespaces Setup (5 Minutes)

The simplest way to work on NNN CRM with instant live updates.

## What You Get

- ✅ **No installations** - Just your browser
- ✅ **Instant updates** - Changes appear in 1 second
- ✅ **Zero git commands** - Claude handles everything
- ✅ **Works anywhere** - Any computer with internet

---

## One-Time Setup (5 Minutes)

### Step 1: Open GitHub Codespaces

1. Go to: **https://github.com/PurplePean/NNN-CRM**
2. Click the green **"Code"** button
3. Click the **"Codespaces"** tab
4. Click **"Create codespace on main"**

A new tab opens with VS Code running in your browser! ✨

### Step 2: Start the Development Server

In the terminal at the bottom of Codespaces:

```bash
npm install
npm start
```

After ~30 seconds, you'll see a popup:

```
Your application running on port 3000 is available.
[Open in Browser]
```

Click **"Open in Browser"**

### Step 3: Organize Your Tabs

You now have 3 browser tabs:

```
Tab 1: GitHub Codespaces (VS Code in browser)
Tab 2: Your app at localhost:3000
Tab 3: Claude.ai chat (where you talk to me)
```

### Step 4: Test Instant Updates

Come back to the Claude chat (Tab 3) and say:

**"Change the app header to say 'Test CRM'"**

Watch Tab 2 (your app) update in 1 second! ⚡

---

## That's It!

You're done. No git, no installations, nothing else needed.

---

## Daily Use

**Morning:**
1. Open your Codespace (bookmark it!)
2. Run `npm start` in terminal
3. Open the app tab

**All day:**
- Tell Claude what you want in plain English
- Watch your app update instantly
- Iterate fast without any git commands

**End of day:**
- Tell Claude "Save my work"
- Claude commits and pushes everything
- Close tabs (Codespace auto-saves)

---

## The Magic

When you tell Claude to make a change:
1. Claude edits the actual files in your Codespace
2. React dev server detects the change
3. Your browser tab auto-refreshes
4. **Total time: 1 second** ⚡

You iterate 20 times, THEN commit once when happy.

---

## Free Tier

GitHub Codespaces is free for:
- **60 hours/month** on the free tier
- That's ~2 hours per day of development
- More than enough for most projects

---

## Troubleshooting

**"Codespace won't start"**
→ You might need to sign into GitHub first

**"Port 3000 not showing popup"**
→ Click the "Ports" tab at bottom → Right-click port 3000 → "Open in Browser"

**"npm start failed"**
→ Make sure you ran `npm install` first

**"Changes aren't showing"**
→ Make sure `npm start` is still running (check terminal)

---

## Next Steps

See [SIMPLE-WORKFLOW.md](./SIMPLE-WORKFLOW.md) for all the simple commands you can use with Claude.

Check [ROADMAP.md](./ROADMAP.md) for what to build next.

Happy coding! 🚀
