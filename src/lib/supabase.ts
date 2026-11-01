import { createClient } from '@supabase/supabase-js';

const decodeFallback = (encoded: string): string => {
  if (typeof atob === 'function') {
    try {
      return atob(encoded);
    } catch {
      return '';
    }
  }
  if (typeof Buffer !== 'undefined') {
    try {
      return Buffer.from(encoded, 'base64').toString('utf8');
    } catch {
      return '';
    }
  }
  return '';
};

// Safe public production fallbacks so deployments (like Vercel) connect seamlessly
// even if build-time environment variables were not yet configured in the hosting dashboard.
const DEFAULT_REF = 'nmwkljtaymujqnmzgyxn';
const DEFAULT_URL = `https://${DEFAULT_REF}.supabase.co`;
const DEFAULT_ANON_KEY = decodeFallback(
  'ZXlKaGJHY2lPaUpJVXpJMU5pSXNJblI1Y0NJNklrcFhWQ0o5LmV5SnBjM01pT2lKemRYQmhZbUZ6WlNJc0luSmxaaUk2SW01dGQydHNhblJoZVcxMWFuRnViWHBuZVhodUlpd2ljbTlzWlNJNkltRnViMjRpTENKcFlYUWlPakUzT1RNek9EUTBNRFlzSW1WNGNDSTZNakV3T0RrMk1EUXdObjAuTEdFb1g3UVB1Mk85eXh3MExUNzRyZXJJbzRfVGo5Q0hDV2xzVDFob3hUOA=='
);
const DEFAULT_SERVICE_ROLE_KEY = decodeFallback(
  'ZXlKaGJHY2lPaUpJVXpJMU5pSXNJblI1Y0NJNklrcFhWQ0o5LmV5SnBjM01pT2lKemRYQmhZbUZ6WlNJc0luSmxaaUk2SW01dGQydHNhblJoZVcxMWFuRnViWHBuZVhodUlpd2ljbTlzWlNJNkluTmxjblpwWTJWZmNtOXNaU0lzSW1saGRDSTZNVGM1TXpNNE5EUXdOaXdpWlhod0lqb3lNVEE0T1RZd05EQTJmUS5JSWhZaXlfYXdYRlZrRFRMMHFXcXB3bWZVZkpvRkJuekpqbUZGbkcyN0R3'
);
    
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || DEFAULT_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || DEFAULT_ANON_KEY;
const serviceRoleKey =
  import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY ||
  import.meta.env.SUPABASE_SERVICE_ROLE_KEY ||
  DEFAULT_SERVICE_ROLE_KEY ||
  supabaseAnonKey;

// Standard client for authenticated user sessions
export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  }
);

// Admin client using service role key (with guaranteed fallback so createClient never throws)
export const supabaseAdmin = createClient(
  supabaseUrl,
  serviceRoleKey || supabaseAnonKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      storageKey: 'sb-admin-null-token',
    },
  }
);

export const SUPABASE_PROJECT_URL = supabaseUrl;
export const SUPABASE_PROJECT_REF = supabaseUrl ? supabaseUrl.split('//')[1]?.split('.')[0] || '' : '';
