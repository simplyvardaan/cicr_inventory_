import { createClient } from '@supabase/supabase-js';

// Safe public fallbacks so production deployments (like Vercel) render seamlessly
// even if build-time environment variables were not yet configured in the dashboard.
const DEFAULT_SUPABASE_URL = 'https://nmwkljtaymujqnmzgyxn.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5td2tsanRheW11anFubXpneXhuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTMzODQ0MDYsImV4cCI6MjEwODk2MDQwNn0.LGEoX7QPu2O9yxw0LT74rerIo4_Tj9CHCWlsT1hoxT8';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || DEFAULT_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY;
const serviceRoleKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY || import.meta.env.SUPABASE_SERVICE_ROLE_KEY || '';

const originalFetch = globalThis.fetch.bind(globalThis);
const databaseGatewayFetch: typeof fetch = (input, init) => {
  const url = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url;
  if (!url.startsWith(`${supabaseUrl}/rest/v1/`)) {
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
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  global: { fetch: databaseGatewayFetch },
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

// Admin client using service role key (only if provided in environment, otherwise standard client)
export const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey || supabaseAnonKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

export const SUPABASE_PROJECT_URL = supabaseUrl;
export const SUPABASE_PROJECT_REF = supabaseUrl ? supabaseUrl.split('//')[1]?.split('.')[0] || '' : '';
