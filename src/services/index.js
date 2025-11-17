/**
 * Services Index
 * Central export point for all Supabase services
 */

export { supabase, handleSupabaseError, isSupabaseConfigured } from './supabase';
export { propertyService } from './properties';
export {
  brokerService,
  partnerService,
  gatekeeperService,
  contactsService
} from './contacts';
export { eventService } from './events';
export { followUpService } from './followUps';
export { noteService } from './notes';
