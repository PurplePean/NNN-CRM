/**
 * Supabase Client Configuration
 * Initializes the Supabase client for database operations
 */

import { createClient } from '@supabase/supabase-js';

// Get Supabase credentials from environment variables
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

// Validate environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables');
  console.error('Please ensure REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_ANON_KEY are set');
  console.error('See .env.example for configuration details');
}

// Create and export Supabase client
export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '', {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

/**
 * Helper function to handle Supabase errors
 * @param {Object} error - Supabase error object
 * @param {string} operation - Description of the operation that failed
 */
export const handleSupabaseError = (error, operation) => {
  console.error(`Supabase Error (${operation}):`, error);

  // Return user-friendly error message
  if (error.message) {
    return error.message;
  }

  return `Failed to ${operation}. Please try again.`;
};

/**
 * Check if Supabase is configured
 * @returns {boolean} - True if Supabase credentials are present
 */
export const isSupabaseConfigured = () => {
  return !!(supabaseUrl && supabaseAnonKey);
};
