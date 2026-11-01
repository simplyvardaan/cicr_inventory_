import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import { getSupabaseConfig } from './supabase-config';

const tables = new Set([
  'profiles',
  'inventory_items',
  'borrow_requests',
  'activity_logs',
]);

const identifier = /^[a-z_][a-z0-9_]*$/;
const SUPABASE_TIMEOUT_MS = 8_000;

async function authenticate(req: VercelRequest) {
  const { url, anonKey: key } = getSupabaseConfig();
  const authorization = req.headers.authorization;
  if (!url || !key || !authorization?.startsWith('Bearer ')) throw new Error('Authentication is required.');
  const supabase = createClient(url, key, { auth: { persistSession: false } });
  const { data, error } = await supabase.auth.getUser(authorization.slice(7));
  if (error || !data.user) throw new Error('Authentication is required.');
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', data.user.id).maybeSingle();
  return { user: data.user, isAdmin: profile?.role === 'admin' || data.user.user_metadata?.role === 'admin' };
}

function assertAuthorized(req: VercelRequest, path: string, method: string, userId: string, isAdmin: boolean) {
  const table = parseTable(path);
  const query = req.query as Record<string, string | string[] | undefined>;
  const requestedUserId = Array.isArray(query.user_id) ? query.user_id[0] : query.user_id;
  if (isAdmin) return;
  if (table === 'inventory_items' && method !== 'GET') throw new Error('Administrator access is required.');
  if (table === 'profiles' && (method !== 'GET' || requestedUserId !== userId)) {
    throw new Error('You may only access your own profile.');
  }
  if (table === 'borrow_requests' && method === 'GET' && requestedUserId !== userId) {
    throw new Error('You may only access your own requests.');
  }
  if (table === 'borrow_requests' && method === 'PATCH') {
    throw new Error('Administrator access is required for request updates.');
  }
  if (table === 'borrow_requests' && method === 'POST') {
    const body = Array.isArray(req.body) ? req.body[0] : req.body;
    if (!body || body.user_id !== userId) throw new Error('You may only create your own requests.');
  }
  if (table === 'borrow_requests' && method === 'DELETE') {
    throw new Error('Administrator access is required.');
  }
  if (table === 'activity_logs' && method === 'GET' && requestedUserId !== userId) {
    throw new Error('You may only view your own activity.');
  }
  if (table === 'activity_logs' && method !== 'GET') {
    const body = Array.isArray(req.body) ? req.body[0] : req.body;
    if (body?.user_id !== userId) throw new Error('You may only write your own activity.');
  }
}

function quoteIdentifier(value: string) {
  if (!identifier.test(value)) throw new Error('Invalid database identifier.');
  return `"${value}"`;
}

function parseTable(path: string) {
  const match = path.match(/^\/rest\/v1\/([a-z_][a-z0-9_]*)$/);
  if (!match || !tables.has(match[1])) throw new Error('Unsupported database table.');
  return match[1];
}

function jsonResponse(res: VercelResponse, status: number, body: unknown) {
  res.status(status).setHeader('content-type', 'application/json');
  res.json(body);
}

async function supabaseRequest(req: VercelRequest, path: string) {
  const { url: baseUrl, anonKey: publicKey } = getSupabaseConfig();
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!baseUrl || !serviceKey || !publicKey) throw new Error('Supabase server configuration is incomplete.');

  const headers = new Headers();
  headers.set('apikey', publicKey);
  const authorization = req.headers.authorization || 'Bearer ' + publicKey;
  headers.set('Authorization', authorization);
  if (req.headers['content-type']) headers.set('content-type', String(req.headers['content-type']));
  if (req.headers.prefer) headers.set('prefer', String(req.headers.prefer));

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), SUPABASE_TIMEOUT_MS);
  let response: Response;

  try {
    response = await fetch(`${baseUrl}${path}`, {
      method: req.method,
      headers,
      body: ['GET', 'HEAD'].includes(req.method || '') ? undefined : JSON.stringify(req.body),
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeout);
  }

  if (!response.ok && response.status < 500) return response;
  if (response.ok) return response;
  throw new Error(`Supabase returned ${response.status}.`);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const requestPath = new URL(req.url || '', 'http://localhost').pathname;
    const path = typeof req.query.route === 'string'
      ? req.query.route
      : requestPath.replace(/^\/api\/db/, '') || '/';
    if (!['GET', 'POST', 'PATCH', 'DELETE'].includes(req.method || '')) {
      return jsonResponse(res, 405, { error: 'Method not allowed.' });
    }
    const { user, isAdmin } = await authenticate(req);
    assertAuthorized(req, path, req.method || 'GET', user.id, isAdmin);

    const originalQuery = new URLSearchParams();
    for (const [key, value] of Object.entries(req.query)) {
      if (key === 'route' || value === undefined) continue;
      if (Array.isArray(value)) value.forEach((item) => originalQuery.append(key, item));
      else originalQuery.set(key, value);
    }
    const queryString = originalQuery.toString();
    const upstream = await supabaseRequest(req, `${path}${queryString ? `?${queryString}` : ''}`);
    const body = await upstream.text();
    res.status(upstream.status);
    upstream.headers.forEach((value, key) => res.setHeader(key, value));
    return res.send(body);
  } catch (error) {
    return jsonResponse(res, 500, { error: error instanceof Error ? error.message : 'Database request failed.' });
  }
}
