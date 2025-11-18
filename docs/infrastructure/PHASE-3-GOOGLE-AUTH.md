# Phase 3: Google Authentication
**NNN CRM - Multi-User Access with Google OAuth**

---

## Overview

**Goal:** Replace "Load Test Data" with secure Google sign-in for 2 users (you + partner)

**Prerequisites:**
- ✅ Phase 0 complete (deployed to crm.axispoint.llc)
- ✅ Phase 2 complete (Supabase integration working)
- ✅ SSL enabled (HTTPS required for OAuth)
- ✅ Partner's Google email address

**Time Estimate:** 2-4 hours

---

## Step 1: Enable Google OAuth in Supabase

### Configure Google OAuth Provider

**In Supabase Dashboard:**

1. Go to: https://app.supabase.com/project/acwtflofdabmfpjdixmv
2. Click **"Authentication"** in left sidebar
3. Click **"Providers"**
4. Find **"Google"** and click **"Enable"**

### Get Google OAuth Credentials

**Create Google OAuth App:**

1. Go to: https://console.cloud.google.com
2. Create new project (or select existing)
3. Go to **"APIs & Services" → "Credentials"**
4. Click **"Create Credentials" → "OAuth 2.0 Client ID"**
5. Application type: **"Web application"**
6. Name: `NNN CRM Production`

**Authorized JavaScript origins:**
```
https://crm.axispoint.llc
```

**Authorized redirect URIs:**
```
https://acwtflofdabmfpjdixmv.supabase.co/auth/v1/callback
```

7. Click **"Create"**
8. **Copy** Client ID and Client Secret

### Configure Supabase with Google Credentials

**Back in Supabase → Authentication → Providers → Google:**

1. Paste **Client ID** from Google
2. Paste **Client Secret** from Google
3. **Authorized Client IDs:** (leave empty for now)
4. Click **"Save"**

---

## Step 2: Update Database Schema for Auth

### Add User Tracking

**Supabase SQL Editor:**

```sql
-- Update RLS policies to use authenticated user ID
DROP POLICY IF EXISTS "Allow all" ON properties;
DROP POLICY IF EXISTS "Allow all" ON brokers;
DROP POLICY IF EXISTS "Allow all" ON partners;
DROP POLICY IF EXISTS "Allow all" ON gatekeepers;
DROP POLICY IF EXISTS "Allow all" ON events;
DROP POLICY IF EXISTS "Allow all" ON follow_ups;

-- Since you and your partner share everything, still allow all authenticated users
-- But now tracking which user created each record
CREATE POLICY "Allow authenticated users full access" ON properties
  FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users full access" ON brokers
  FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users full access" ON partners
  FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users full access" ON gatekeepers
  FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users full access" ON events
  FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users full access" ON follow_ups
  FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users full access" ON notes
  FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);

-- Reload schema
NOTIFY pgrst, 'reload schema';
```

**Note:** RLS is enabled but allows all authenticated users to see all data (shared model).

---

## Step 3: Update App.jsx for Authentication

### Add Auth State Management

**In src/App.jsx, add after imports:**

```javascript
import { supabase } from './services/supabase';

export default function IndustrialCRM() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // ... existing state ...

  // Check auth state on mount
  useEffect(() => {
    // Get current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Sign in with Google
  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: 'https://crm.axispoint.llc'
      }
    });
    if (error) console.error('Error signing in:', error);
  };

  // Sign out
  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) console.error('Error signing out:', error);
  };

  // Show loading state while checking auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div>Loading...</div>
      </div>
    );
  }

  // Show login screen if not authenticated
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white mb-8">NNN CRM</h1>
          <button
            onClick={signInWithGoogle}
            className="bg-white text-gray-900 px-6 py-3 rounded-lg font-medium hover:bg-gray-100 transition"
          >
            Sign in with Google
          </button>
        </div>
      </div>
    );
  }

  // Existing app JSX below (wrapped in auth check)
  return (
    <div className={darkMode ? 'dark' : ''}>
      {/* Add sign out button in header */}
      <div className="flex justify-between items-center p-4">
        <div>Logged in as: {user.email}</div>
        <button onClick={signOut} className="text-sm">
          Sign Out
        </button>
      </div>

      {/* Rest of existing app JSX */}
    </div>
  );
}
```

### Update Data Operations to Include user_id

**Modify loadTestData function:**

```javascript
const loadTestData = async () => {
  if (!user) return;

  const loadData = async () => {
    try {
      if (isSupabaseConfigured()) {
        // Add user_id to all test data
        const testDataWithUserId = {
          brokers: testBrokers.map(b => ({ ...b, user_id: user.id, id: undefined })),
          partners: testPartners.map(p => ({ ...p, user_id: user.id, id: undefined })),
          // ... etc
        };

        await Promise.all([
          supabaseService.bulkInsert('brokers', testDataWithUserId.brokers),
          // ... etc
        ]);
      }
    } catch (error) {
      console.error('Error loading test data:', error);
    }
  };
};
```

---

## Step 4: Email Whitelist (Optional but Recommended)

### Restrict Access to Specific Emails

**Supabase Dashboard → Authentication → Policies:**

Create a custom policy to only allow specific emails:

**SQL Editor:**

```sql
-- Create function to check if email is whitelisted
CREATE OR REPLACE FUNCTION is_whitelisted_email(email TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN email IN (
    'your.email@gmail.com',
    'partner.email@gmail.com'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update auth schema to reject non-whitelisted signups
-- This requires a trigger on auth.users insert
-- For simplicity, handle in app code instead
```

**Alternative: Handle in App Code**

In `src/App.jsx`:

```javascript
useEffect(() => {
  const { data: { subscription } } = supabase.auth.onAuthStateChange(
    async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        const allowedEmails = [
          'your.email@gmail.com',
          'partner.email@gmail.com'
        ];

        if (!allowedEmails.includes(session.user.email)) {
          await supabase.auth.signOut();
          alert('Access denied. This email is not authorized.');
          return;
        }

        setUser(session.user);
      }
    }
  );

  return () => subscription.unsubscribe();
}, []);
```

---

## Step 5: Remove Test Data Buttons

### Clean Up Development Features

**Remove from App.jsx:**
1. "Load Test Data" button
2. "Clear All Data" button
3. Test data arrays (testBrokers, testPartners, etc.)
4. loadTestData() function
5. clearAllData() function

**Keep:**
- Add/Edit/Delete functionality for individual records
- All CRUD operations
- Supabase service layer

---

## Step 6: Update UI for Multi-User

### Add User Indicators

**Show who's logged in:**

```javascript
<div className="bg-gray-800 p-4 flex justify-between items-center">
  <div className="text-white">
    <span className="text-sm">Logged in as:</span>
    <span className="ml-2 font-medium">{user.email}</span>
  </div>
  <button
    onClick={signOut}
    className="text-sm text-gray-300 hover:text-white"
  >
    Sign Out
  </button>
</div>
```

**Optional: Show who created each record**

In property/broker/partner cards, add:

```javascript
<div className="text-xs text-gray-500">
  Created by: {item.user_email || 'Unknown'}
</div>
```

---

## Step 7: Testing

### Test Authentication Flow

**Single User Test:**
1. Visit https://crm.axispoint.llc
2. Click "Sign in with Google"
3. Choose your Google account
4. Should redirect back to app
5. Should see your email in header
6. Add a property
7. Sign out
8. Sign in again
9. Property should still be there

**Multi-User Test:**
1. Sign in with your account
2. Add a test property
3. Sign out
4. Have partner sign in with their account
5. They should see the same property
6. Partner adds a broker
7. Partner signs out
8. You sign in
9. You should see both the property and the broker

### Test Email Whitelist

**If implemented:**
1. Try signing in with non-whitelisted email
2. Should be rejected/signed out
3. Should see "Access denied" message

---

## Step 8: Deploy to Production

### Commit Changes

```bash
git checkout -b feature/google-authentication

git add src/App.jsx
git add src/services/supabase.js  # if modified
git commit -m "Phase 3: Add Google Authentication

- Implement Google OAuth sign-in
- Add auth state management
- Remove test data buttons
- Add email whitelist for 2 users
- Update UI with user indicators"

git push -u origin feature/google-authentication
```

### Create Pull Request

1. Go to GitHub
2. Create PR from `feature/google-authentication` to `main`
3. Title: "Phase 3: Google Authentication"
4. Review changes
5. Merge to main
6. Watch GitHub Actions deploy

### Post-Deployment Verification

1. Visit https://crm.axispoint.llc
2. Should see Google sign-in screen
3. Sign in with your account
4. Add test data
5. Sign out and sign in again - data persists
6. Have partner test from their device

---

## Troubleshooting

### Error: "redirect_uri_mismatch"

**Cause:** Google OAuth redirect URI doesn't match
**Fix:** In Google Console, verify redirect URI is exactly:
```
https://acwtflofdabmfpjdixmv.supabase.co/auth/v1/callback
```

### Error: "Access denied"

**Cause:** Email not whitelisted
**Fix:** Add email to allowedEmails array in app code

### User signs in but immediately signs out

**Cause:** Email whitelist rejecting user
**Fix:** Check allowedEmails array includes correct email

### Data not appearing after sign-in

**Cause:** RLS policies too restrictive
**Fix:** Verify RLS policies allow authenticated users (see Step 2 SQL)

### Google sign-in popup blocked

**Cause:** Browser popup blocker
**Fix:** Allow popups for crm.axispoint.llc

---

## Security Considerations

### What's Secure

✅ OAuth flow handled by Supabase (industry standard)
✅ No passwords stored in your app
✅ Session tokens managed securely
✅ HTTPS enforced (SSL certificate)
✅ Row Level Security at database level
✅ Email whitelist prevents unauthorized access

### What to Monitor

⚠️ Supabase API keys exposed in client (normal for anon key, RLS protects data)
⚠️ Email whitelist is client-side (can be bypassed by advanced users)
⚠️ Shared data model means both users see everything

### Future Enhancements

- Server-side email validation (Supabase Edge Functions)
- Audit log for data changes
- More granular permissions (if needed later)
- Two-factor authentication (if highly sensitive data)

---

## Next Steps After Phase 3

**You'll have:**
- ✅ Secure Google sign-in
- ✅ Multi-user cloud access
- ✅ Data syncs between devices
- ✅ Production-ready CRM

**Future Enhancements:**
- Real-time updates (Supabase Realtime subscriptions)
- Email notifications (SendGrid integration)
- Document uploads (Supabase Storage)
- Advanced analytics dashboard
- Mobile app (React Native)
- Automated backups/exports

---

## Rollback Plan

**If Phase 3 breaks:**

```bash
# Revert authentication commit
git revert HEAD
git push origin main

# Or create hotfix
git checkout -b fix/remove-auth
# Remove auth code, restore test data buttons
git commit -m "Rollback: Remove Google Auth"
git push -u origin fix/remove-auth
# Create PR and merge
```

**Temporary workaround:**
- Keep Phase 2 (Supabase) working
- Remove auth requirement
- Add back "Load Test Data" button
- Deploy without authentication (temporarily)

---

## Appendix

### Environment Variables

**No new env vars needed!** Google OAuth credentials stored in Supabase, not your app.

### Useful Links

- **Google Console:** https://console.cloud.google.com
- **Supabase Auth Docs:** https://supabase.com/docs/guides/auth
- **OAuth Debugging:** https://developers.google.com/identity/protocols/oauth2/web-server

### Email Whitelist Template

```javascript
const ALLOWED_EMAILS = [
  'your.email@gmail.com',        // Replace with your actual email
  'partner.email@gmail.com'      // Replace with partner's email
];

// In auth state change handler:
if (!ALLOWED_EMAILS.includes(session.user.email)) {
  await supabase.auth.signOut();
  alert(`Access denied. Contact admin to request access.`);
}
```

### Complete Auth Flow Diagram

```
User visits crm.axispoint.llc
         ↓
    No session found
         ↓
 Show "Sign in with Google" button
         ↓
    User clicks button
         ↓
Supabase redirects to Google OAuth
         ↓
   User authorizes app
         ↓
Google redirects to Supabase callback
         ↓
  Supabase creates session
         ↓
Redirect to crm.axispoint.llc
         ↓
  App checks email whitelist
         ↓
   Email allowed? → Yes → Show app
         ↓
        No → Sign out → Show denied message
```
