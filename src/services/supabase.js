import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase credentials not found. Please set REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_ANON_KEY in your .env file.');
}

export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Helper function to check if Supabase is configured
export const isSupabaseConfigured = () => {
  return supabase !== null;
};

// Generic CRUD operations
export const supabaseService = {
  // Fetch all items from a table
  async getAll(table) {
    if (!supabase) return null;
    const { data, error } = await supabase
      .from(table)
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error(`Error fetching ${table}:`, error);
      return null;
    }
    return data;
  },

  // Get single item by ID
  async getById(table, id) {
    if (!supabase) return null;
    const { data, error } = await supabase
      .from(table)
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error(`Error fetching ${table} by ID:`, error);
      return null;
    }
    return data;
  },

  // Create new item
  async create(table, item) {
    if (!supabase) return null;
    const { data, error } = await supabase
      .from(table)
      .insert([item])
      .select()
      .single();

    if (error) {
      console.error(`Error creating ${table}:`, error);
      return null;
    }
    return data;
  },

  // Update existing item
  async update(table, id, updates) {
    if (!supabase) return null;
    const { data, error } = await supabase
      .from(table)
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error(`Error updating ${table}:`, error);
      return null;
    }
    return data;
  },

  // Delete item
  async delete(table, id) {
    if (!supabase) return null;
    const { error } = await supabase
      .from(table)
      .delete()
      .eq('id', id);

    if (error) {
      console.error(`Error deleting ${table}:`, error);
      return false;
    }
    return true;
  },

  // Bulk insert (for test data)
  async bulkInsert(table, items) {
    if (!supabase) return null;
    const { data, error } = await supabase
      .from(table)
      .insert(items)
      .select();

    if (error) {
      console.error(`Error bulk inserting ${table}:`, error);
      return null;
    }
    return data;
  }
};

// ============================================================================
// NOTES SERVICE - Categorized notes for all entity types
// ============================================================================
export const notesService = {
  /**
   * Get all notes for a specific entity
   * @param {string} entityType - The entity type (property, broker, partner, etc.)
   * @param {string} entityId - The entity ID
   * @returns {Array} Array of notes
   */
  async getNotesByEntity(entityType, entityId) {
    if (!supabase) return [];
    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .eq('entity_type', entityType)
      .eq('entity_id', entityId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error(`Error fetching notes for ${entityType} ${entityId}:`, error);
      return [];
    }
    return data || [];
  },

  /**
   * Create a new note
   * @param {Object} noteData - Note data { entity_type, entity_id, category, content }
   * @returns {Object|null} Created note object
   */
  async createNote(noteData) {
    if (!supabase) return null;

    // Get current user
    const { data: { user } } = await supabase.auth.getUser();

    const { data, error } = await supabase
      .from('notes')
      .insert([{
        ...noteData,
        user_id: user?.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creating note:', error);
      throw error;
    }
    return data;
  },

  /**
   * Update an existing note
   * @param {string} noteId - The note ID
   * @param {Object} updates - Fields to update { content, category }
   * @returns {Object|null} Updated note object
   */
  async updateNote(noteId, updates) {
    if (!supabase) return null;
    const { data, error } = await supabase
      .from('notes')
      .update({
        ...updates,
        edited: true,
        updated_at: new Date().toISOString()
      })
      .eq('id', noteId)
      .select()
      .single();

    if (error) {
      console.error('Error updating note:', error);
      throw error;
    }
    return data;
  },

  /**
   * Delete a note
   * @param {string} noteId - The note ID
   * @returns {boolean} Success status
   */
  async deleteNote(noteId) {
    if (!supabase) return false;
    const { error } = await supabase
      .from('notes')
      .delete()
      .eq('id', noteId);

    if (error) {
      console.error('Error deleting note:', error);
      throw error;
    }
    return true;
  },

  /**
   * Get all notes (for initial load)
   * @returns {Array} Array of all notes
   */
  async getAllNotes() {
    if (!supabase) return [];
    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching all notes:', error);
      return [];
    }
    return data || [];
  }
};
