/**
 * Property Service
 * CRUD operations for property management
 */

import { supabase, handleSupabaseError } from './supabase';

export const propertyService = {
  /**
   * Get all properties
   * @returns {Promise<Array>} - Array of property objects
   */
  async getAll() {
    try {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching properties:', error);
      throw new Error(handleSupabaseError(error, 'fetch properties'));
    }
  },

  /**
   * Get a single property by ID
   * @param {string} id - Property UUID
   * @returns {Promise<Object>} - Property object
   */
  async getById(id) {
    try {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching property:', error);
      throw new Error(handleSupabaseError(error, 'fetch property'));
    }
  },

  /**
   * Create a new property
   * @param {Object} property - Property data
   * @returns {Promise<Object>} - Created property object
   */
  async create(property) {
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();

      const { data, error } = await supabase
        .from('properties')
        .insert([{
          ...property,
          user_id: user?.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating property:', error);
      throw new Error(handleSupabaseError(error, 'create property'));
    }
  },

  /**
   * Update an existing property
   * @param {string} id - Property UUID
   * @param {Object} updates - Property data to update
   * @returns {Promise<Object>} - Updated property object
   */
  async update(id, updates) {
    try {
      const { data, error } = await supabase
        .from('properties')
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
      console.error('Error updating property:', error);
      throw new Error(handleSupabaseError(error, 'update property'));
    }
  },

  /**
   * Delete a property
   * @param {string} id - Property UUID
   * @returns {Promise<void>}
   */
  async delete(id) {
    try {
      const { error } = await supabase
        .from('properties')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting property:', error);
      throw new Error(handleSupabaseError(error, 'delete property'));
    }
  },

  /**
   * Search properties by address
   * @param {string} searchTerm - Search term
   * @returns {Promise<Array>} - Array of matching properties
   */
  async search(searchTerm) {
    try {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .ilike('address', `%${searchTerm}%`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error searching properties:', error);
      throw new Error(handleSupabaseError(error, 'search properties'));
    }
  },

  /**
   * Filter properties by status
   * @param {string} status - Property status
   * @returns {Promise<Array>} - Array of filtered properties
   */
  async filterByStatus(status) {
    try {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('status', status)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error filtering properties:', error);
      throw new Error(handleSupabaseError(error, 'filter properties'));
    }
  }
};
