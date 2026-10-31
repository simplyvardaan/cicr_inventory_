import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
const serviceRoleKey =
  import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY ||
  import.meta.env.SUPABASE_SERVICE_ROLE_KEY ||
  supabaseAnonKey;

const originalFetch = globalThis.fetch.bind(globalThis);
const databaseGatewayFetch: typeof fetch = (input, init) => {
  const url = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url;
  if (!supabaseUrl || !url.startsWith(`${supabaseUrl}/rest/v1/`)) {
    return originalFetch(input, init);
  }

  const parsed = new URL(url);
  const gatewayParams = new URLSearchParams(parsed.search);
  gatewayParams.set('route', parsed.pathname);
  const gatewayUrl = `/api/db?${gatewayParams.toString()}`;
  const headers = new Headers(input instanceof Request ? input.headers : init?.headers);
  if (init?.headers) {
    new Headers(init.headers).forEach((value, key) => headers.set(key, value));
  }
  return originalFetch(gatewayUrl, {
    ...init,
    headers,
  });
};

// Standard client for authenticated user sessions
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder',
  {
    global: { fetch: databaseGatewayFetch },
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
