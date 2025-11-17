/**
 * Contacts Service
 * CRUD operations for brokers, partners, and gatekeepers
 */

import { supabase, handleSupabaseError } from './supabase';

/**
 * Generic contact service factory
 * Creates CRUD operations for a specific contact table
 * @param {string} tableName - Name of the contact table (brokers, partners, gatekeepers)
 */
const createContactService = (tableName) => ({
  /**
   * Get all contacts
   * @returns {Promise<Array>} - Array of contact objects
   */
  async getAll() {
    try {
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error(`Error fetching ${tableName}:`, error);
      throw new Error(handleSupabaseError(error, `fetch ${tableName}`));
    }
  },

  /**
   * Get a single contact by ID
   * @param {string} id - Contact UUID
   * @returns {Promise<Object>} - Contact object
   */
  async getById(id) {
    try {
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error(`Error fetching ${tableName} contact:`, error);
      throw new Error(handleSupabaseError(error, `fetch ${tableName} contact`));
    }
  },

  /**
   * Create a new contact
   * @param {Object} contact - Contact data
   * @returns {Promise<Object>} - Created contact object
   */
  async create(contact) {
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();

      const { data, error } = await supabase
        .from(tableName)
        .insert([{
          ...contact,
          user_id: user?.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error(`Error creating ${tableName} contact:`, error);
      throw new Error(handleSupabaseError(error, `create ${tableName} contact`));
    }
  },

  /**
   * Update an existing contact
   * @param {string} id - Contact UUID
   * @param {Object} updates - Contact data to update
   * @returns {Promise<Object>} - Updated contact object
   */
  async update(id, updates) {
    try {
      const { data, error } = await supabase
        .from(tableName)
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
      console.error(`Error updating ${tableName} contact:`, error);
      throw new Error(handleSupabaseError(error, `update ${tableName} contact`));
    }
  },

  /**
   * Delete a contact
   * @param {string} id - Contact UUID
   * @returns {Promise<void>}
   */
  async delete(id) {
    try {
      const { error } = await supabase
        .from(tableName)
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error(`Error deleting ${tableName} contact:`, error);
      throw new Error(handleSupabaseError(error, `delete ${tableName} contact`));
    }
  },

  /**
   * Search contacts by name
   * @param {string} searchTerm - Search term
   * @returns {Promise<Array>} - Array of matching contacts
   */
  async search(searchTerm) {
    try {
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .ilike('name', `%${searchTerm}%`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error(`Error searching ${tableName}:`, error);
      throw new Error(handleSupabaseError(error, `search ${tableName}`));
    }
  },

  /**
   * Filter contacts by tags
   * @param {string} tag - Tag to filter by
   * @returns {Promise<Array>} - Array of filtered contacts
   */
  async filterByTag(tag) {
    try {
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .contains('tags', [tag])
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error(`Error filtering ${tableName} by tag:`, error);
      throw new Error(handleSupabaseError(error, `filter ${tableName} by tag`));
    }
  }
});

// Create and export individual contact services
export const brokerService = createContactService('brokers');
export const partnerService = createContactService('partners');
export const gatekeeperService = createContactService('gatekeepers');

// Export a combined contacts service
export const contactsService = {
  brokers: brokerService,
  partners: partnerService,
  gatekeepers: gatekeeperService
};
