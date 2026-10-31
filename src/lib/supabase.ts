import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
const serviceRoleKey =
  import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY ||
  import.meta.env.SUPABASE_SERVICE_ROLE_KEY ||
  supabaseAnonKey;

// Standard client for authenticated user sessions
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  }
);

// Admin client using service role key
export const supabaseAdmin = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  serviceRoleKey || supabaseAnonKey || 'placeholder',
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

export const SUPABASE_PROJECT_URL = supabaseUrl;
export const SUPABASE_PROJECT_REF = supabaseUrl ? supabaseUrl.split('//')[1]?.split('.')[0] || '' : '';
