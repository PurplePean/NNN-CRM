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
