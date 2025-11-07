import { createClient } from '@supabase/supabase-js';

// Prefer VITE_* variables (used by Vite). Fall back to REACT_APP_* for
// compatibility with older env files or tooling that still sets those.
const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL ?? import.meta.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ?? import.meta.env.REACT_APP_SUPABASE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});
