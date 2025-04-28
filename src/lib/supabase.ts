
import { createClient } from '@supabase/supabase-js';

// Get Supabase URL and anon key from environment variables
// These variables are automatically available when connected to Supabase through Lovable
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase URL or anon key. Make sure Supabase is properly connected.');
}

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '');
