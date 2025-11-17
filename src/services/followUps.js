/**
 * Follow-ups Service
 * CRUD operations for follow-up task management
 */

import { supabase, handleSupabaseError } from './supabase';

export const followUpService = {
  /**
   * Get all follow-ups
   * @returns {Promise<Array>} - Array of follow-up objects
   */
  async getAll() {
    try {
      const { data, error } = await supabase
        .from('follow_ups')
        .select('*')
        .order('due_date', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching follow-ups:', error);
      throw new Error(handleSupabaseError(error, 'fetch follow-ups'));
    }
  },

  /**
   * Get a single follow-up by ID
   * @param {string} id - Follow-up UUID
   * @returns {Promise<Object>} - Follow-up object
   */
  async getById(id) {
    try {
      const { data, error } = await supabase
        .from('follow_ups')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching follow-up:', error);
      throw new Error(handleSupabaseError(error, 'fetch follow-up'));
    }
  },

  /**
   * Create a new follow-up
   * @param {Object} followUp - Follow-up data
   * @returns {Promise<Object>} - Created follow-up object
   */
  async create(followUp) {
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();

      const { data, error } = await supabase
        .from('follow_ups')
        .insert([{
          ...followUp,
          user_id: user?.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating follow-up:', error);
      throw new Error(handleSupabaseError(error, 'create follow-up'));
    }
  },

  /**
   * Update an existing follow-up
   * @param {string} id - Follow-up UUID
   * @param {Object} updates - Follow-up data to update
   * @returns {Promise<Object>} - Updated follow-up object
   */
  async update(id, updates) {
    try {
      const { data, error } = await supabase
        .from('follow_ups')
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
      console.error('Error updating follow-up:', error);
      throw new Error(handleSupabaseError(error, 'update follow-up'));
    }
  },

  /**
   * Delete a follow-up
   * @param {string} id - Follow-up UUID
   * @returns {Promise<void>}
   */
  async delete(id) {
    try {
      const { error } = await supabase
        .from('follow_ups')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting follow-up:', error);
      throw new Error(handleSupabaseError(error, 'delete follow-up'));
    }
  },

  /**
   * Mark follow-up as completed
   * @param {string} id - Follow-up UUID
   * @returns {Promise<Object>} - Updated follow-up object
   */
  async markCompleted(id) {
    try {
      const { data, error } = await supabase
        .from('follow_ups')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error marking follow-up as completed:', error);
      throw new Error(handleSupabaseError(error, 'mark follow-up as completed'));
    }
  },

  /**
   * Mark follow-up as pending
   * @param {string} id - Follow-up UUID
   * @returns {Promise<Object>} - Updated follow-up object
   */
  async markPending(id) {
    try {
      const { data, error } = await supabase
        .from('follow_ups')
        .update({
          status: 'pending',
          completed_at: null,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error marking follow-up as pending:', error);
      throw new Error(handleSupabaseError(error, 'mark follow-up as pending'));
    }
  },

  /**
   * Get follow-ups by status
   * @param {string} status - Status (pending, completed)
   * @returns {Promise<Array>} - Array of follow-ups with given status
   */
  async getByStatus(status) {
    try {
      const { data, error } = await supabase
        .from('follow_ups')
        .select('*')
        .eq('status', status)
        .order('due_date', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching follow-ups by status:', error);
      throw new Error(handleSupabaseError(error, 'fetch follow-ups by status'));
    }
  },

  /**
   * Get follow-ups by priority
   * @param {string} priority - Priority (low, medium, high)
   * @returns {Promise<Array>} - Array of follow-ups with given priority
   */
  async getByPriority(priority) {
    try {
      const { data, error } = await supabase
        .from('follow_ups')
        .select('*')
        .eq('priority', priority)
        .order('due_date', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching follow-ups by priority:', error);
      throw new Error(handleSupabaseError(error, 'fetch follow-ups by priority'));
    }
  },

  /**
   * Get follow-ups by contact
   * @param {string} contactType - Contact type (broker, partner, gatekeeper)
   * @param {string} contactId - Contact UUID
   * @returns {Promise<Array>} - Array of follow-ups for the contact
   */
  async getByContact(contactType, contactId) {
    try {
      const { data, error } = await supabase
        .from('follow_ups')
        .select('*')
        .eq('contact_type', contactType)
        .eq('contact_id', contactId)
        .order('due_date', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching follow-ups by contact:', error);
      throw new Error(handleSupabaseError(error, 'fetch follow-ups by contact'));
    }
  },

  /**
   * Get overdue follow-ups
   * @returns {Promise<Array>} - Array of overdue follow-ups
   */
  async getOverdue() {
    try {
      const today = new Date().toISOString().split('T')[0];

      const { data, error } = await supabase
        .from('follow_ups')
        .select('*')
        .eq('status', 'pending')
        .lt('due_date', today)
        .order('due_date', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching overdue follow-ups:', error);
      throw new Error(handleSupabaseError(error, 'fetch overdue follow-ups'));
    }
  },

  /**
   * Get upcoming follow-ups
   * @param {number} days - Number of days to look ahead (default: 7)
   * @returns {Promise<Array>} - Array of upcoming follow-ups
   */
  async getUpcoming(days = 7) {
    try {
      const today = new Date();
      const futureDate = new Date(today);
      futureDate.setDate(futureDate.getDate() + days);

      const { data, error } = await supabase
        .from('follow_ups')
        .select('*')
        .eq('status', 'pending')
        .gte('due_date', today.toISOString().split('T')[0])
        .lte('due_date', futureDate.toISOString().split('T')[0])
        .order('due_date', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching upcoming follow-ups:', error);
      throw new Error(handleSupabaseError(error, 'fetch upcoming follow-ups'));
    }
  }
};
