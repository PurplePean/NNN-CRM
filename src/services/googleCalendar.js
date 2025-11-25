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
// Authentication: Uses Supabase OAuth token (user authenticates via Supabase)
// No separate Google auth required - we use the provider_token from Supabase
// ============================================================================

// Google Calendar configuration
const CALENDAR_ID = 'c_c6da83c28bffd2cb7bb374dc8376bbc54d31eac404f3b26023d82e42dffae709@group.calendar.google.com';
const API_KEY = process.env.REACT_APP_GOOGLE_API_KEY;
const DISCOVERY_DOCS = ['https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest'];

// State management
let gapiInitialized = false;
let isSignedIn = false;
let retryCount = 0;
const MAX_RETRIES = 3;
const RETRY_DELAY = 2000; // 2 seconds

// ============================================================================
// INITIALIZATION
// ============================================================================

/**
 * Initialize Google Calendar API
 * Uses existing Supabase OAuth token for authentication
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

    // Load only the client library (not auth2 - we use Supabase OAuth)
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

    // Get the OAuth token from Supabase session
    const { data: { session } } = await supabase.auth.getSession();

    if (!session?.provider_token) {
      throw new Error('No Google OAuth token found. Please sign in with Google via Supabase.');
    }

    // Set the OAuth token from Supabase
    gapi.client.setToken({
      access_token: session.provider_token,
    });

    isSignedIn = true;
    gapiInitialized = true;
    console.log('Google Calendar API initialized with Supabase OAuth token');
    return true;
  } catch (error) {
    console.error('Error initializing Google Calendar API:', error);
    gapiInitialized = false;
    isSignedIn = false;
    return false;
  }
};

/**
 * Check if Google Calendar is ready for use
 */
export const isGoogleCalendarReady = () => {
  return gapiInitialized && isSignedIn;
};

/**
 * Sign in to Google
 * Note: User should sign in via Supabase OAuth flow
 * This function is kept for compatibility but delegates to Supabase
 */
export const signInToGoogle = async () => {
  console.warn('Please use Supabase OAuth flow to sign in with Google');
  return false;
};

/**
 * Sign out from Google
 * Note: User should sign out via Supabase
 * This function clears the local gapi token
 */
export const signOutFromGoogle = async () => {
  try {
    if (gapiInitialized && window.gapi?.client?.setToken) {
      gapi.client.setToken(null);
    }
    isSignedIn = false;
    gapiInitialized = false;
    console.log('Google Calendar API token cleared');
    return true;
  } catch (error) {
    console.error('Error clearing Google token:', error);
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
 * Ensure we have a valid OAuth token from Supabase
 * This refreshes the token before each API call to prevent 403 errors
 */
const ensureValidToken = async () => {
  try {
    // Get the current session from Supabase (automatically refreshes if needed)
    const { data: { session }, error } = await supabase.auth.getSession();

    if (error) {
      throw new Error(`Failed to get Supabase session: ${error.message}`);
    }

    if (!session?.provider_token) {
      throw new Error('No Google OAuth token found. Please sign in with Google via Supabase.');
    }

    // Set the fresh OAuth token on gapi.client
    gapi.client.setToken({
      access_token: session.provider_token,
    });

    console.log('Google Calendar token refreshed from Supabase session');
    return true;
  } catch (error) {
    console.error('Error refreshing Google Calendar token:', error);
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
  isGoogleCalendarReady,
  signInToGoogle,
  signOutFromGoogle,

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
