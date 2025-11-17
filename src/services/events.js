/**
 * Events Service
 * CRUD operations for event management
 */

import { supabase, handleSupabaseError } from './supabase';

export const eventService = {
  /**
   * Get all events
   * @returns {Promise<Array>} - Array of event objects
   */
  async getAll() {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('date', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching events:', error);
      throw new Error(handleSupabaseError(error, 'fetch events'));
    }
  },

  /**
   * Get a single event by ID
   * @param {string} id - Event UUID
   * @returns {Promise<Object>} - Event object
   */
  async getById(id) {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching event:', error);
      throw new Error(handleSupabaseError(error, 'fetch event'));
    }
  },

  /**
   * Create a new event
   * @param {Object} event - Event data
   * @returns {Promise<Object>} - Created event object
   */
  async create(event) {
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();

      const { data, error } = await supabase
        .from('events')
        .insert([{
          ...event,
          user_id: user?.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating event:', error);
      throw new Error(handleSupabaseError(error, 'create event'));
    }
  },

  /**
   * Update an existing event
   * @param {string} id - Event UUID
   * @param {Object} updates - Event data to update
   * @returns {Promise<Object>} - Updated event object
   */
  async update(id, updates) {
    try {
      const { data, error } = await supabase
        .from('events')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating event:', error);
      throw new Error(handleSupabaseError(error, 'update event'));
    }
  },

  /**
   * Delete an event
   * @param {string} id - Event UUID
   * @returns {Promise<void>}
   */
  async delete(id) {
    try {
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting event:', error);
      throw new Error(handleSupabaseError(error, 'delete event'));
    }
  },

  /**
   * Get events by date range
   * @param {string} startDate - Start date (YYYY-MM-DD)
   * @param {string} endDate - End date (YYYY-MM-DD)
   * @returns {Promise<Array>} - Array of events in date range
   */
  async getByDateRange(startDate, endDate) {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .gte('date', startDate)
        .lte('date', endDate)
        .order('date', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching events by date range:', error);
      throw new Error(handleSupabaseError(error, 'fetch events by date range'));
    }
  },

  /**
   * Get events by contact
   * @param {string} contactType - Contact type (broker, partner, gatekeeper)
   * @param {string} contactId - Contact UUID
   * @returns {Promise<Array>} - Array of events for the contact
   */
  async getByContact(contactType, contactId) {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('contact_type', contactType)
        .eq('contact_id', contactId)
        .order('date', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching events by contact:', error);
      throw new Error(handleSupabaseError(error, 'fetch events by contact'));
    }
  },

  /**
   * Get upcoming events
   * @returns {Promise<Array>} - Array of upcoming events
   */
  async getUpcoming() {
    try {
      const today = new Date().toISOString().split('T')[0];

      const { data, error } = await supabase
        .from('events')
        .select('*')
        .gte('date', today)
        .order('date', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching upcoming events:', error);
      throw new Error(handleSupabaseError(error, 'fetch upcoming events'));
    }
  },

  /**
   * Get past events
   * @returns {Promise<Array>} - Array of past events
   */
  async getPast() {
    try {
      const today = new Date().toISOString().split('T')[0];

      const { data, error } = await supabase
        .from('events')
        .select('*')
        .lt('date', today)
        .order('date', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching past events:', error);
      throw new Error(handleSupabaseError(error, 'fetch past events'));
    }
  }
};
