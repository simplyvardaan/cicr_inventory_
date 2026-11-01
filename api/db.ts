import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import { Client } from 'pg';

const tables = new Set([
  'profiles',
  'inventory_items',
  'borrow_requests',
  'activity_logs',
]);

const SUPERADMIN_EMAILS = [
  'vardaansaxena096@gmail.com',
  'cicrinventory@gmail.com',
  'cicrinventoryofficial@gmail.com',
];

const DEFAULT_REF = 'nmwkljtaymujqnmzgyxn';
const DEFAULT_URL = `https://${DEFAULT_REF}.supabase.co`;
const DEFAULT_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5td2tsanRheW11anFubXpneXhuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTMzODQ0MDYsImV4cCI6MjEwODk2MDQwNn0.LGEoX7QPu2O9yxw0LT74rerIo4_Tj9CHCWlsT1hoxT8';

const identifier = /^[a-z_][a-z0-9_]*$/;
const SUPABASE_TIMEOUT_MS = 8_000;
const NEON_CONNECTION_TIMEOUT_MS = 8_000;

function quoteIdentifier(value: string) {
  if (!identifier.test(value)) throw new Error('Invalid database identifier.');
  return `"${value}"`;
}

function parseTable(path: string) {
  const match = path.match(/^\/rest\/v1\/([a-z_][a-z0-9_]*)$/);
  if (!match || !tables.has(match[1])) throw new Error('Unsupported database table.');
  return match[1];
}

function parseFilters(query: Record<string, string | string[] | undefined>, values: unknown[]) {
  const clauses: string[] = [];
  for (const [key, raw] of Object.entries(query)) {
    if (['select', 'order', 'limit', 'offset', 'on_conflict'].includes(key) || !raw) continue;
    const value = Array.isArray(raw) ? raw[0] : raw;
    const match = value.match(/^(eq|neq|gt|gte|lt|lte|is)\.(.*)$/);
    if (!match) throw new Error(`Unsupported filter for ${key}.`);
    const column = quoteIdentifier(key);
    if (match[1] === 'is' && (match[2] === 'null' || match[2] === 'true' || match[2] === 'false')) {
      clauses.push(`${column} IS ${match[2] === 'null' ? 'NULL' : match[2].toUpperCase()}`);
      continue;
    }
    values.push(match[2]);
    const operator = { eq: '=', neq: '<>', gt: '>', gte: '>=', lt: '<', lte: '<=' }[match[1]];
    clauses.push(`${column} ${operator} $${values.length}`);
  }
  return clauses;
}

function columns(select: string | undefined) {
  if (!select || select === '*') return '*';
  return select.split(',').map((column) => quoteIdentifier(column.trim())).join(', ');
}

function jsonResponse(res: VercelResponse, status: number, body: unknown) {
  res.status(status).setHeader('content-type', 'application/json');
  res.json(body);
}

async function verifyAuth(req: VercelRequest) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    throw new Error('Authentication is required.');
  }

  const token = authHeader.slice(7);
  const baseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || DEFAULT_URL;
  const anonKey = process.env.VITE_SUPABASE_ANON_KEY || DEFAULT_ANON_KEY;
  const supabase = createClient(baseUrl, anonKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data?.user) {
    throw new Error('Invalid or expired authentication credentials.');
  }

  const email = (data.user.email || '').toLowerCase();
  const isSuperadmin = SUPERADMIN_EMAILS.includes(email);

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, status')
    .eq('id', data.user.id)
    .maybeSingle();

  const isAdmin = isSuperadmin || (profile?.role === 'admin' && profile?.status === 'approved');
  const isLead = profile?.role === 'lead' && profile?.status === 'approved';

  return {
    user: data.user,
    token,
    isAdmin,
    isLead,
    isAdminOrLead: isAdmin || isLead,
  };
}

async function supabaseRequest(req: VercelRequest, path: string, token: string) {
  const baseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || DEFAULT_URL;
  const publicKey = process.env.VITE_SUPABASE_ANON_KEY || DEFAULT_ANON_KEY;

  const headers = new Headers();
  headers.set('apikey', publicKey);
  headers.set('Authorization', `Bearer ${token}`);
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

async function neonRequest(
  req: VercelRequest,
  path: string,
  auth: { user: { id: string }; isAdminOrLead: boolean }
) {
  if (!process.env.NEON_DATABASE_URL) throw new Error('Neon server configuration is incomplete.');
  const table = parseTable(path);
  const method = req.method || 'GET';

  // Enforce access control in failover Neon path
  if (['POST', 'PATCH', 'DELETE'].includes(method)) {
    if (table === 'inventory_items' && !auth.isAdminOrLead) {
      throw new Error('Forbidden: Administrative privileges required to mutate inventory.');
    }
  }

  const query = { ...req.query } as Record<string, string | string[] | undefined>;
  delete query.route;
  const client = new Client({
    connectionString: process.env.NEON_DATABASE_URL,
    connectionTimeoutMillis: NEON_CONNECTION_TIMEOUT_MS,
    ssl: { rejectUnauthorized: true },
  });

  try {
    await client.connect();
    const values: unknown[] = [];
    const filterClauses = parseFilters(query, values);
    const where = filterClauses.length ? ` WHERE ${filterClauses.join(' AND ')}` : '';

    if (method === 'GET') {
      const selectColumns = columns(typeof query.select === 'string' ? query.select : undefined);
      const limit = typeof query.limit === 'string' ? ` LIMIT ${parseInt(query.limit, 10)}` : '';
      const order = typeof query.order === 'string' ? ` ORDER BY ${query.order.replace(/\.(asc|desc)/, ' $1').toUpperCase()}` : '';
      const result = await client.query(`SELECT ${selectColumns} FROM ${quoteIdentifier(table)}${where}${order}${limit}`, values);
      return { status: 200, body: result.rows };
    }

    const payload = req.body;
    const rows = Array.isArray(payload) ? payload : [payload];
    if (!rows.length || !rows[0]) throw new Error('Request payload is required.');

    if (method === 'POST') {
      const firstRow = rows[0] as Record<string, unknown>;
      const keys = Object.keys(firstRow);
      const insertColumns = keys.map(quoteIdentifier).join(', ');
      const placeholders = keys.map((_, index) => `$${index + 1}`).join(', ');
      const result = await client.query(
        `INSERT INTO ${quoteIdentifier(table)} (${insertColumns}) VALUES (${placeholders}) RETURNING *`,
        keys.map((k) => firstRow[k])
      );
      return { status: 201, body: result.rows };
    }

    if (!['PATCH', 'DELETE'].includes(method)) throw new Error('Unsupported database method.');
    if (method === 'DELETE') {
      const result = await client.query(`DELETE FROM ${quoteIdentifier(table)}${where} RETURNING *`, values);
      return { status: 200, body: result.rows };
    }

    const updates = rows[0] as Record<string, unknown>;
    const updateKeys = Object.keys(updates);
    const set = updateKeys.map((key) => {
      values.push(updates[key]);
      return `${quoteIdentifier(key)} = $${values.length}`;
    }).join(', ');
    const result = await client.query(`UPDATE ${quoteIdentifier(table)} SET ${set}${where} RETURNING *`, values);
    return { status: 200, body: result.rows };
  } finally {
    await client.end();
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (!['GET', 'POST', 'PATCH', 'DELETE'].includes(req.method || '')) {
      return jsonResponse(res, 405, { error: 'Method not allowed.' });
    }

    // Require valid authentication before any database access
    let auth;
    try {
      auth = await verifyAuth(req);
    } catch (authError) {
      return jsonResponse(res, 401, {
        error: authError instanceof Error ? authError.message : 'Authentication required.',
      });
    }

    const requestPath = new URL(req.url || '', 'http://localhost').pathname;
    const path = typeof req.query.route === 'string'
      ? req.query.route
      : requestPath.replace(/^\/api\/db/, '') || '/';

    try {
      const originalQuery = new URLSearchParams();
      for (const [key, value] of Object.entries(req.query)) {
        if (key === 'route' || value === undefined) continue;
        if (Array.isArray(value)) value.forEach((item) => originalQuery.append(key, item));
        else originalQuery.set(key, value);
      }
      const queryString = originalQuery.toString();
      const upstream = await supabaseRequest(req, `${path}${queryString ? `?${queryString}` : ''}`, auth.token);
      const body = await upstream.text();
      res.status(upstream.status);
      upstream.headers.forEach((value, key) => res.setHeader(key, value));
      return res.send(body);
    } catch (supabaseError) {
      console.warn('Supabase unavailable; using authenticated Neon failover:', supabaseError);
      const fallback = await neonRequest(req, path, auth);
      return jsonResponse(res, fallback.status, fallback.body);
    }
  } catch (error) {
    return jsonResponse(res, 500, { error: error instanceof Error ? error.message : 'Database request failed.' });
  }
}
