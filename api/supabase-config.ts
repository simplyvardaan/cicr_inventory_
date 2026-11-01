const DEFAULT_REF = 'nmwkljtaymujqnmzgyxn';
const DEFAULT_URL = `https://${DEFAULT_REF}.supabase.co`;
const DEFAULT_ANON_KEY = Buffer.from(
  'ZXlKaGJHY2lPaUpJVXpJMU5pSXNJblI1Y0NJNklrcFhWQ0o5LmV5SnBjM01pT2lKemRYQmhZbUZ6WlNJc0luSmxaaUk2SW01dGQydHNhblJoZVcxMWFuRnViWHBuZVhodUlpd2ljbTlzWlNJNkltRnViMjRpTENKcFlYUWlPakUzT1RNek9EUTBNRFlzSW1WNGNDSTZNakV3T0RrMk1EUXdObjAuTEdFb1g3UVB1Mk85eXh3MExUNzRyZXJJbzRfVGo5Q0hDV2xzVDFob3hUOA==',
  'base64'
).toString('utf8');

export function getSupabaseConfig() {
  return {
    url: process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || DEFAULT_URL,
    anonKey:
      process.env.SUPABASE_ANON_KEY ||
      process.env.VITE_SUPABASE_ANON_KEY ||
      process.env.SUPABASE_PUBLIC_ANON_KEY ||
      DEFAULT_ANON_KEY,
  };
}
