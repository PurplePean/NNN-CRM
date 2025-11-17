/**
 * Notes Service
 * CRUD operations for note management
 */

import { supabase, handleSupabaseError } from './supabase';

export const noteService = {
  /**
   * Get all notes
   * @returns {Promise<Array>} - Array of note objects
   */
  async getAll() {
    try {
      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching notes:', error);
      throw new Error(handleSupabaseError(error, 'fetch notes'));
    }
  },

  /**
   * Get a single note by ID
   * @param {string} id - Note UUID
   * @returns {Promise<Object>} - Note object
   */
  async getById(id) {
    try {
      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching note:', error);
      throw new Error(handleSupabaseError(error, 'fetch note'));
    }
  },

  /**
   * Create a new note
   * @param {Object} note - Note data
   * @returns {Promise<Object>} - Created note object
   */
  async create(note) {
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();

      const { data, error } = await supabase
        .from('notes')
        .insert([{
          ...note,
          user_id: user?.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating note:', error);
      throw new Error(handleSupabaseError(error, 'create note'));
    }
  },

  /**
   * Update an existing note
   * @param {string} id - Note UUID
   * @param {Object} updates - Note data to update
   * @returns {Promise<Object>} - Updated note object
   */
  async update(id, updates) {
    try {
      const { data, error } = await supabase
        .from('notes')
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
      console.error('Error updating note:', error);
      throw new Error(handleSupabaseError(error, 'update note'));
    }
  },

  /**
   * Delete a note
   * @param {string} id - Note UUID
   * @returns {Promise<void>}
   */
  async delete(id) {
    try {
      const { error } = await supabase
        .from('notes')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting note:', error);
      throw new Error(handleSupabaseError(error, 'delete note'));
    }
  },

  /**
   * Get notes by contact
   * @param {string} contactType - Contact type (broker, partner, gatekeeper)
   * @param {string} contactId - Contact UUID
   * @returns {Promise<Array>} - Array of notes for the contact
   */
  async getByContact(contactType, contactId) {
    try {
      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .eq('contact_type', contactType)
        .eq('contact_id', contactId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching notes by contact:', error);
      throw new Error(handleSupabaseError(error, 'fetch notes by contact'));
    }
  },

  /**
   * Get notes by property
   * @param {string} propertyId - Property UUID
   * @returns {Promise<Array>} - Array of notes for the property
   */
  async getByProperty(propertyId) {
    try {
      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .eq('property_id', propertyId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching notes by property:', error);
      throw new Error(handleSupabaseError(error, 'fetch notes by property'));
    }
  },

  /**
   * Get notes by category
   * @param {string} category - Note category
   * @returns {Promise<Array>} - Array of notes in the category
   */
  async getByCategory(category) {
    try {
      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .eq('category', category)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching notes by category:', error);
      throw new Error(handleSupabaseError(error, 'fetch notes by category'));
    }
  },

  /**
   * Search notes by content
   * @param {string} searchTerm - Search term
   * @returns {Promise<Array>} - Array of matching notes
   */
  async search(searchTerm) {
    try {
      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .ilike('content', `%${searchTerm}%`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error searching notes:', error);
      throw new Error(handleSupabaseError(error, 'search notes'));
    }
  },

  /**
   * Filter notes by tags
   * @param {string} tag - Tag to filter by
   * @returns {Promise<Array>} - Array of filtered notes
   */
  async filterByTag(tag) {
    try {
      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .contains('tags', [tag])
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error filtering notes by tag:', error);
      throw new Error(handleSupabaseError(error, 'filter notes by tag'));
    }
  }
};
