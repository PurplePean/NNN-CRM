import { gapi } from 'gapi-script';
import { supabase } from './supabase';

// ============================================================================
// GOOGLE CALENDAR SERVICE
// ============================================================================
// Purpose: 2-way sync between CRM and Google Calendar
// - CRM → Google Calendar: Immediate sync on create/update/delete
// - Google Calendar → CRM: Periodic sync every 5 minutes
// - CRM is source of truth on conflicts
//
// Authentication: Uses SEPARATE Google OAuth flow for calendar access
// - Supabase auth is used ONLY for app login
// - Google Calendar requires separate OAuth with calendar scopes
// - Token is stored in localStorage and passed to all functions
// ============================================================================

// Google Calendar configuration
const CALENDAR_ID = 'c_c6da83c28bffd2cb7bb374dc8376bbc54d31eac404f3b26023d82e42dffae709@group.calendar.google.com';
const API_KEY = process.env.REACT_APP_GOOGLE_API_KEY;
const CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID;
const DISCOVERY_DOCS = ['https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest'];
const SCOPES = 'https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/calendar.events';

// Storage keys
const CALENDAR_TOKEN_KEY = 'google_calendar_token';
const CALENDAR_TOKEN_EXPIRES_KEY = 'google_calendar_token_expires';

// State management
let gapiInitialized = false;
let tokenClient = null;
const MAX_RETRIES = 3;
const RETRY_DELAY = 2000; // 2 seconds

// ============================================================================
// INITIALIZATION
// ============================================================================

/**
 * Initialize Google Calendar API
 * Only initializes gapi client - does NOT handle OAuth
 * OAuth is handled separately via initGoogleOAuth()
 */
export const initGoogleCalendar = async () => {
  try {
    if (gapiInitialized) {
      console.log('Google Calendar API already initialized');
      return true;
    }

    // Wait for gapi to load
    await new Promise((resolve, reject) => {
      const checkGapi = () => {
        if (window.gapi) {
          resolve();
        } else {
          setTimeout(checkGapi, 100);
        }
      };
      checkGapi();
      setTimeout(() => reject(new Error('gapi failed to load')), 10000);
    });

    // Load only the client library
    await new Promise((resolve, reject) => {
      gapi.load('client', {
        callback: resolve,
        onerror: reject,
      });
    });

    // Initialize the client with API key and discovery docs
    await gapi.client.init({
      apiKey: API_KEY,
      discoveryDocs: DISCOVERY_DOCS,
    });

    gapiInitialized = true;
    console.log('Google Calendar API initialized');
    return true;
  } catch (error) {
    console.error('Error initializing Google Calendar API:', error);
    gapiInitialized = false;
    return false;
  }
};

/**
 * Initialize Google OAuth client for calendar access
 * This must be called after initGoogleCalendar()
 */
export const initGoogleOAuth = async () => {
  try {
    // Wait for Google Identity Services to load
    await new Promise((resolve, reject) => {
      const checkGIS = () => {
        if (window.google?.accounts?.oauth2) {
          resolve();
        } else {
          setTimeout(checkGIS, 100);
        }
      };
      checkGIS();
      setTimeout(() => reject(new Error('Google Identity Services failed to load')), 10000);
    });

    // Initialize the token client
    tokenClient = window.google.accounts.oauth2.initTokenClient({
      client_id: CLIENT_ID,
      scope: SCOPES,
      callback: (response) => {
        if (response.error) {
          console.error('OAuth error:', response);
          return;
        }
        // Store the token
        storeCalendarToken(response.access_token, response.expires_in);
      },
    });

    console.log('Google OAuth client initialized');
    return true;
  } catch (error) {
    console.error('Error initializing Google OAuth:', error);
    return false;
  }
};

/**
 * Store calendar token in localStorage
 */
const storeCalendarToken = (token, expiresIn) => {
  localStorage.setItem(CALENDAR_TOKEN_KEY, token);
  const expiresAt = Date.now() + (expiresIn * 1000);
  localStorage.setItem(CALENDAR_TOKEN_EXPIRES_KEY, expiresAt.toString());
  console.log('Calendar token stored');
};

/**
 * Get calendar token from localStorage
 */
export const getCalendarToken = () => {
  const token = localStorage.getItem(CALENDAR_TOKEN_KEY);
  const expiresAt = localStorage.getItem(CALENDAR_TOKEN_EXPIRES_KEY);

  // Check if token exists and is not expired
  if (token && expiresAt && Date.now() < parseInt(expiresAt)) {
    return token;
  }

  return null;
};

/**
 * Check if user is connected to Google Calendar
 */
export const isGoogleCalendarConnected = () => {
  return getCalendarToken() !== null;
};

/**
 * Check if Google Calendar is ready for use
 */
export const isGoogleCalendarReady = () => {
  return gapiInitialized && isGoogleCalendarConnected();
};

/**
 * Initiate Google OAuth flow for calendar access
 * Returns a promise that resolves when user completes auth
 */
export const connectGoogleCalendar = async () => {
  try {
    if (!tokenClient) {
      throw new Error('OAuth client not initialized. Call initGoogleOAuth() first.');
    }

    // Request access token
    return new Promise((resolve, reject) => {
      const originalCallback = tokenClient.callback;

      tokenClient.callback = (response) => {
        // Restore original callback
        tokenClient.callback = originalCallback;

        if (response.error) {
          reject(new Error(response.error));
          return;
        }

        // Store the token
        storeCalendarToken(response.access_token, response.expires_in);

        // Set the token on gapi client
        gapi.client.setToken({
          access_token: response.access_token,
        });

        resolve(response.access_token);
      };

      // Trigger the OAuth flow
      tokenClient.requestAccessToken({ prompt: 'consent' });
    });
  } catch (error) {
    console.error('Error connecting to Google Calendar:', error);
    throw error;
  }
};

/**
 * Disconnect from Google Calendar
 * Clears stored token and revokes access
 */
export const disconnectGoogleCalendar = async () => {
  try {
    const token = getCalendarToken();

    if (token) {
      // Revoke the token
      await window.google.accounts.oauth2.revoke(token);
    }

    // Clear stored token
    localStorage.removeItem(CALENDAR_TOKEN_KEY);
    localStorage.removeItem(CALENDAR_TOKEN_EXPIRES_KEY);

    // Clear gapi token
    if (gapiInitialized && window.gapi?.client?.setToken) {
      gapi.client.setToken(null);
    }

    console.log('Google Calendar disconnected');
    return true;
  } catch (error) {
    console.error('Error disconnecting from Google Calendar:', error);
    return false;
  }
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Convert CRM event to Google Calendar event format
 */
const convertCRMEventToGoogleEvent = (crmEvent) => {
  const startDateTime = new Date(crmEvent.date || crmEvent.dueDate);
  const endDateTime = new Date(startDateTime.getTime() + 60 * 60 * 1000); // 1 hour duration

  let summary = crmEvent.title;
  let description = crmEvent.description || crmEvent.notes || '';

  // Add prefix for follow-ups
  if (crmEvent.dueDate) {
    summary = `[Follow-up: ${crmEvent.type || 'Task'}] ${crmEvent.contactName || 'Unknown'}`;
    description = `Priority: ${crmEvent.priority || 'Medium'}\n\n${description}`;
  }

  return {
    summary,
    description,
    location: crmEvent.location || '',
    start: {
      dateTime: startDateTime.toISOString(),
      timeZone: 'America/Los_Angeles',
    },
    end: {
      dateTime: endDateTime.toISOString(),
      timeZone: 'America/Los_Angeles',
    },
    extendedProperties: {
      private: {
        crmEventId: crmEvent.id,
        crmEventType: crmEvent.dueDate ? 'follow_up' : 'event',
      },
    },
  };
};

/**
 * Ensure we have a valid OAuth token for calendar access
 * This sets the token on gapi client before each API call
 */
const ensureValidToken = async () => {
  try {
    const token = getCalendarToken();

    if (!token) {
      throw new Error('No Google Calendar token found. Please connect Google Calendar first.');
    }

    // Set the OAuth token on gapi.client
    gapi.client.setToken({
      access_token: token,
    });

    return true;
  } catch (error) {
    console.error('Error setting Google Calendar token:', error);
    throw error;
  }
};

/**
 * Retry logic for API calls
 */
const retryWithBackoff = async (fn, attempt = 0) => {
  try {
    return await fn();
  } catch (error) {
    if (attempt >= MAX_RETRIES) {
      throw error;
    }

    const delay = RETRY_DELAY * Math.pow(2, attempt);
    console.log(`Retrying after ${delay}ms (attempt ${attempt + 1}/${MAX_RETRIES})`);
    await new Promise(resolve => setTimeout(resolve, delay));
    return retryWithBackoff(fn, attempt + 1);
  }
};

// ============================================================================
// CRM → GOOGLE CALENDAR SYNC
// ============================================================================

/**
 * Create event in Google Calendar
 */
export const createGoogleCalendarEvent = async (crmEvent, table = 'events') => {
  if (!isGoogleCalendarReady()) {
    throw new Error('Google Calendar not initialized');
  }

  try {
    // Ensure we have a valid token before making the API call
    await ensureValidToken();

    const googleEvent = convertCRMEventToGoogleEvent(crmEvent);

    const response = await retryWithBackoff(() =>
      gapi.client.calendar.events.insert({
        calendarId: CALENDAR_ID,
        resource: googleEvent,
      })
    );

    const googleEventId = response.result.id;

    // Update CRM record with Google event ID
    await supabase
      .from(table)
      .update({
        google_event_id: googleEventId,
        synced_to_google: true,
        last_synced_at: new Date().toISOString(),
        sync_error: null,
      })
      .eq('id', crmEvent.id);

    console.log(`Created Google Calendar event: ${googleEventId}`);
    return googleEventId;
  } catch (error) {
    console.error('Error creating Google Calendar event:', error);

    // Update CRM record with error
    await supabase
      .from(table)
      .update({
        sync_error: error.message,
        synced_to_google: false,
      })
      .eq('id', crmEvent.id);

    throw error;
  }
};

/**
 * Update event in Google Calendar
 */
export const updateGoogleCalendarEvent = async (crmEvent, table = 'events') => {
  if (!isGoogleCalendarReady()) {
    throw new Error('Google Calendar not initialized');
  }

  try {
    if (!crmEvent.google_event_id) {
      // Event not synced yet, create it
      return await createGoogleCalendarEvent(crmEvent, table);
    }

    // Ensure we have a valid token before making the API call
    await ensureValidToken();

    const googleEvent = convertCRMEventToGoogleEvent(crmEvent);

    await retryWithBackoff(() =>
      gapi.client.calendar.events.update({
        calendarId: CALENDAR_ID,
        eventId: crmEvent.google_event_id,
        resource: googleEvent,
      })
    );

    // Update CRM record
    await supabase
      .from(table)
      .update({
        synced_to_google: true,
        last_synced_at: new Date().toISOString(),
        sync_error: null,
      })
      .eq('id', crmEvent.id);

    console.log(`Updated Google Calendar event: ${crmEvent.google_event_id}`);
    return crmEvent.google_event_id;
  } catch (error) {
    console.error('Error updating Google Calendar event:', error);

    // Update CRM record with error
    await supabase
      .from(table)
      .update({
        sync_error: error.message,
        synced_to_google: false,
      })
      .eq('id', crmEvent.id);

    throw error;
  }
};

/**
 * Delete event from Google Calendar
 */
export const deleteGoogleCalendarEvent = async (googleEventId) => {
  if (!isGoogleCalendarReady()) {
    throw new Error('Google Calendar not initialized');
  }

  try {
    // Ensure we have a valid token before making the API call
    await ensureValidToken();

    await retryWithBackoff(() =>
      gapi.client.calendar.events.delete({
        calendarId: CALENDAR_ID,
        eventId: googleEventId,
      })
    );

    console.log(`Deleted Google Calendar event: ${googleEventId}`);
    return true;
  } catch (error) {
    console.error('Error deleting Google Calendar event:', error);

    // If event not found (404), consider it deleted
    if (error.status === 404) {
      console.log('Event already deleted from Google Calendar');
      return true;
    }

    throw error;
  }
};

/**
 * Sync a single CRM event to Google Calendar (create or update)
 */
export const syncEventToGoogle = async (crmEvent, table = 'events') => {
  if (!isGoogleCalendarReady()) {
    console.warn('Google Calendar not ready, skipping sync');
    return;
  }

  try {
    if (crmEvent.google_event_id) {
      await updateGoogleCalendarEvent(crmEvent, table);
    } else {
      await createGoogleCalendarEvent(crmEvent, table);
    }
  } catch (error) {
    console.error('Error syncing event to Google:', error);
  }
};

// ============================================================================
// GOOGLE CALENDAR → CRM SYNC
// ============================================================================

/**
 * Fetch all events from Google Calendar
 */
export const fetchGoogleCalendarEvents = async (timeMin, timeMax) => {
  if (!isGoogleCalendarReady()) {
    throw new Error('Google Calendar not initialized');
  }

  try {
    // Ensure we have a valid token before making the API call
    await ensureValidToken();

    const response = await retryWithBackoff(() =>
      gapi.client.calendar.events.list({
        calendarId: CALENDAR_ID,
        timeMin: timeMin || new Date().toISOString(),
        timeMax: timeMax,
        singleEvents: true,
        orderBy: 'startTime',
        maxResults: 2500,
      })
    );

    return response.result.items || [];
  } catch (error) {
    console.error('Error fetching Google Calendar events:', error);
    throw error;
  }
};

/**
 * Sync events from Google Calendar to CRM
 * CRM is source of truth - only sync events that don't exist in CRM
 */
export const syncFromGoogleCalendar = async () => {
  if (!isGoogleCalendarReady()) {
    console.warn('Google Calendar not ready, skipping sync');
    return { success: false, message: 'Google Calendar not ready' };
  }

  try {
    // Fetch events from last 30 days to future
    const timeMin = new Date();
    timeMin.setDate(timeMin.getDate() - 30);

    const googleEvents = await fetchGoogleCalendarEvents(timeMin.toISOString());

    let imported = 0;
    let updated = 0;
    let skipped = 0;

    for (const googleEvent of googleEvents) {
      // Skip if no start time
      if (!googleEvent.start?.dateTime && !googleEvent.start?.date) {
        skipped++;
        continue;
      }

      // Check if this is a CRM-created event
      const crmEventId = googleEvent.extendedProperties?.private?.crmEventId;
      const crmEventType = googleEvent.extendedProperties?.private?.crmEventType;

      if (crmEventId) {
        // This event was created by CRM, verify it exists
        const table = crmEventType === 'follow_up' ? 'follow_ups' : 'events';
        const { data: existingEvent } = await supabase
          .from(table)
          .select('*')
          .eq('id', crmEventId)
          .single();

        if (existingEvent) {
          // CRM event exists, CRM is source of truth - skip
          skipped++;
          continue;
        }
      }

      // Check if we already imported this Google event
      const { data: existingByGoogleId } = await supabase
        .from('events')
        .select('*')
        .eq('google_event_id', googleEvent.id)
        .maybeSingle();

      if (existingByGoogleId) {
        // Event already imported, update it
        await supabase
          .from('events')
          .update({
            title: googleEvent.summary || 'Untitled Event',
            description: googleEvent.description || '',
            date: googleEvent.start.dateTime || googleEvent.start.date,
            location: googleEvent.location || '',
            last_synced_at: new Date().toISOString(),
          })
          .eq('id', existingByGoogleId.id);

        updated++;
      } else {
        // New event from Google Calendar, import it
        await supabase
          .from('events')
          .insert({
            title: googleEvent.summary || 'Untitled Event',
            description: googleEvent.description || '',
            date: googleEvent.start.dateTime || googleEvent.start.date,
            location: googleEvent.location || '',
            type: 'Other',
            google_event_id: googleEvent.id,
            synced_to_google: true,
            last_synced_at: new Date().toISOString(),
          });

        imported++;
      }
    }

    const message = `Synced from Google Calendar: ${imported} imported, ${updated} updated, ${skipped} skipped`;
    console.log(message);

    // Update last sync time in settings
    await supabase
      .from('sync_settings')
      .update({ setting_value: new Date().toISOString() })
      .eq('setting_key', 'last_successful_sync');

    return {
      success: true,
      message,
      stats: { imported, updated, skipped, total: googleEvents.length },
    };
  } catch (error) {
    console.error('Error syncing from Google Calendar:', error);
    return {
      success: false,
      message: `Sync failed: ${error.message}`,
      error,
    };
  }
};

/**
 * Full sync: CRM → Google Calendar (for all unsynced events)
 */
export const syncAllEventsToGoogle = async () => {
  if (!isGoogleCalendarReady()) {
    console.warn('Google Calendar not ready, skipping sync');
    return { success: false, message: 'Google Calendar not ready' };
  }

  try {
    let synced = 0;
    let errors = 0;

    // Sync events
    const { data: events } = await supabase
      .from('events')
      .select('*')
      .or('synced_to_google.is.null,synced_to_google.eq.false');

    if (events) {
      for (const event of events) {
        try {
          await syncEventToGoogle(event, 'events');
          synced++;
        } catch (error) {
          console.error(`Failed to sync event ${event.id}:`, error);
          errors++;
        }
      }
    }

    // Sync follow-ups
    const { data: followUps } = await supabase
      .from('follow_ups')
      .select('*')
      .or('synced_to_google.is.null,synced_to_google.eq.false');

    if (followUps) {
      for (const followUp of followUps) {
        try {
          await syncEventToGoogle(followUp, 'follow_ups');
          synced++;
        } catch (error) {
          console.error(`Failed to sync follow-up ${followUp.id}:`, error);
          errors++;
        }
      }
    }

    const message = `Synced ${synced} items to Google Calendar (${errors} errors)`;
    console.log(message);

    return {
      success: true,
      message,
      stats: { synced, errors },
    };
  } catch (error) {
    console.error('Error in full sync to Google:', error);
    return {
      success: false,
      message: `Full sync failed: ${error.message}`,
      error,
    };
  }
};

// ============================================================================
// EXPORTS
// ============================================================================

export default {
  // Initialization
  initGoogleCalendar,
  initGoogleOAuth,
  isGoogleCalendarReady,
  isGoogleCalendarConnected,

  // OAuth management
  connectGoogleCalendar,
  disconnectGoogleCalendar,
  getCalendarToken,

  // CRM → Google sync
  createGoogleCalendarEvent,
  updateGoogleCalendarEvent,
  deleteGoogleCalendarEvent,
  syncEventToGoogle,
  syncAllEventsToGoogle,

  // Google → CRM sync
  fetchGoogleCalendarEvents,
  syncFromGoogleCalendar,
};
