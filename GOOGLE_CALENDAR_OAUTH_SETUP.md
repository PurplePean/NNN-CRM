# Google Calendar OAuth Setup

## Overview

The Google Calendar integration now uses a **separate OAuth flow** instead of relying on Supabase's OAuth token. This provides better security and more granular control over calendar permissions.

## Architecture

### Authentication Layers

1. **Supabase Auth**: Used for app login (unchanged)
   - Users sign in via Supabase OAuth
   - Manages app-level authentication

2. **Google Calendar OAuth**: Separate OAuth flow for calendar access (NEW)
   - Users explicitly connect their Google Calendar
   - Requires calendar-specific scopes
   - Token stored in localStorage
   - Independent from Supabase auth

## Setup Instructions

### 1. Google Cloud Console Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Create or select your project
3. Enable the Google Calendar API
4. Create OAuth 2.0 Client ID credentials:
   - Application type: Web application
   - Authorized JavaScript origins: Add your domain(s)
   - Authorized redirect URIs: Add your domain(s)
5. Copy the Client ID

### 2. Environment Variables

Add to your `.env` file:

```env
REACT_APP_GOOGLE_API_KEY=your_google_api_key
REACT_APP_GOOGLE_CLIENT_ID=your_google_client_id
```

### 3. OAuth Scopes

The following scopes are requested:
- `https://www.googleapis.com/auth/calendar` - Full calendar access
- `https://www.googleapis.com/auth/calendar.events` - Event management

## User Flow

### Connecting Google Calendar

1. User signs into the app via Supabase (existing flow)
2. In the sidebar, user clicks "Connect Calendar" button
3. Google OAuth consent screen appears
4. User authorizes calendar access
5. Token is stored in localStorage
6. Initial sync is performed automatically

### Disconnecting Google Calendar

1. User clicks "Disconnect Calendar" button in sidebar
2. Token is revoked via Google API
3. Local token is cleared from localStorage
4. Calendar sync stops

## Implementation Details

### Modified Files

1. **src/services/googleCalendar.js**
   - Removed dependency on Supabase OAuth token
   - Added `initGoogleOAuth()` - initializes OAuth client
   - Added `connectGoogleCalendar()` - initiates OAuth flow
   - Added `disconnectGoogleCalendar()` - revokes token
   - Added `getCalendarToken()` - retrieves stored token
   - Added `isGoogleCalendarConnected()` - checks connection status
   - Updated `ensureValidToken()` - uses localStorage token instead of Supabase token

2. **src/App.jsx**
   - Added imports for new OAuth functions
   - Added `handleConnectCalendar()` handler
   - Added `handleDisconnectCalendar()` handler
   - Updated initialization logic in useEffect
   - Added "Connect/Disconnect Calendar" button in sidebar

3. **public/index.html**
   - Added Google Identity Services script tag

4. **.env.example**
   - Updated comments to clarify separate OAuth flow

### Token Storage

- **Location**: `localStorage`
- **Keys**:
  - `google_calendar_token` - The access token
  - `google_calendar_token_expires` - Expiration timestamp

### Token Lifecycle

1. Token is obtained via OAuth consent flow
2. Token is stored in localStorage with expiration time
3. Before each API call, token is validated and set on gapi client
4. If token is expired, user must reconnect (future enhancement: auto-refresh)

## Security Considerations

1. **Separate OAuth** provides:
   - Better scope isolation (calendar access only)
   - Independent token lifecycle
   - Easier to revoke without affecting app access

2. **Token Storage**:
   - Tokens are stored in localStorage
   - Tokens expire after the time specified by Google
   - Users can revoke access at any time

3. **Permissions**:
   - Users explicitly consent to calendar access
   - Scopes are clearly displayed during OAuth flow
   - Users can review permissions in Google Account settings

## Future Enhancements

1. **Token Refresh**: Implement automatic token refresh using refresh tokens
2. **Supabase Storage**: Option to store tokens in Supabase instead of localStorage
3. **Multi-Calendar Support**: Allow users to select which calendar to sync
4. **Offline Detection**: Better handling of expired/revoked tokens

## Troubleshooting

### "OAuth client not initialized" error
- Ensure Google Identity Services script is loaded in index.html
- Check that `initGoogleOAuth()` is called after `initGoogleCalendar()`

### "No Google Calendar token found" error
- User needs to click "Connect Calendar" button
- Check that CLIENT_ID is set in environment variables

### OAuth consent screen issues
- Verify Authorized JavaScript origins in Google Cloud Console
- Ensure domain matches exactly (including protocol and port)
- Check that OAuth Client ID is correct

### Token expired errors
- User needs to reconnect by clicking "Connect Calendar" again
- Consider implementing automatic token refresh

## Testing

1. Sign out of the app
2. Sign in via Supabase OAuth
3. Click "Connect Calendar" button
4. Complete Google OAuth consent
5. Verify calendar sync starts automatically
6. Create/edit events and verify they sync to Google Calendar
7. Click "Disconnect Calendar"
8. Verify sync stops and token is cleared

## Migration from Previous Implementation

### Before (Supabase OAuth Token)
- Single OAuth flow for both app and calendar
- Token managed by Supabase
- Required users to sign in with Google via Supabase

### After (Separate OAuth Flow)
- Two independent OAuth flows
- Calendar token managed separately
- Users can sign in with any Supabase provider
- Explicit "Connect Calendar" action required

### Breaking Changes
- Users must explicitly connect Google Calendar after this update
- Previous tokens from Supabase will not work for calendar access
- Calendar sync will not work until user connects

## Support

For issues or questions:
1. Check Google Cloud Console credentials
2. Verify environment variables are set correctly
3. Check browser console for error messages
4. Review Google OAuth documentation: https://developers.google.com/identity/protocols/oauth2
