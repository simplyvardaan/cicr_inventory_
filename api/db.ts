import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import { Client } from 'pg';

const tables = new Set([
  'profiles',
  'inventory_items',
  'borrow_requests',
  'activity_logs',
]);

const identifier = /^[a-z_][a-z0-9_]*$/;
const SUPABASE_TIMEOUT_MS = 8_000;
const NEON_CONNECTION_TIMEOUT_MS = 8_000;

async function authenticate(req: VercelRequest) {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const key = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
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

async function supabaseRequest(req: VercelRequest, path: string) {
  const baseUrl = process.env.VITE_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const publicKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
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

async function neonRequest(req: VercelRequest, path: string) {
  if (!process.env.NEON_DATABASE_URL) throw new Error('Neon server configuration is incomplete.');
  const table = parseTable(path);
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
    const filters = parseFilters(query, values);
    const where = filters.length ? ` WHERE ${filters.join(' AND ')}` : '';
    const method = req.method || 'GET';

    if (method === 'GET') {
      let sql = `SELECT ${columns(typeof query.select === 'string' ? query.select : undefined)} FROM ${quoteIdentifier(table)}${where}`;
      if (typeof query.order === 'string') {
        const [column, direction = 'asc'] = query.order.split('.');
        sql += ` ORDER BY ${quoteIdentifier(column)} ${direction.toLowerCase() === 'desc' ? 'DESC' : 'ASC'}`;
      }
      if (query.limit) {
        const limit = Number(query.limit);
        if (!Number.isInteger(limit) || limit < 0) throw new Error('Invalid limit.');
        sql += ` LIMIT ${limit}`;
      }
      if (query.offset) {
        const offset = Number(query.offset);
        if (!Number.isInteger(offset) || offset < 0) throw new Error('Invalid offset.');
        sql += ` OFFSET ${offset}`;
      }
      const result = await client.query(sql, values);
      return { status: 200, body: result.rows };
    }

    const rows = Array.isArray(req.body) ? req.body : [req.body];
    if (!rows.length || !rows[0] || typeof rows[0] !== 'object') throw new Error('Invalid request body.');
    const keys = Object.keys(rows[0] as Record<string, unknown>);
    keys.forEach(quoteIdentifier);
    const keySql = keys.map(quoteIdentifier).join(', ');

    if (method === 'POST') {
      const placeholders = rows.map((row, rowIndex) => {
        const object = row as Record<string, unknown>;
        return `(${keys.map((key, keyIndex) => {
          values.push(object[key]);
          return `$${rowIndex * keys.length + keyIndex + 1}`;
        }).join(', ')})`;
      }).join(', ');
      const conflict = typeof query.on_conflict === 'string'
        ? ` ON CONFLICT (${query.on_conflict.split(',').map(quoteIdentifier).join(', ')}) DO UPDATE SET ${keys.map((key) => `${quoteIdentifier(key)} = EXCLUDED.${quoteIdentifier(key)}`).join(', ')}`
        : '';
      const result = await client.query(
        `INSERT INTO ${quoteIdentifier(table)} (${keySql}) VALUES ${placeholders}${conflict} RETURNING *`,
        values
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
    const set = updateKeys.map((key, index) => {
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
    const requestPath = new URL(req.url || '', 'http://localhost').pathname;
    const path = typeof req.query.route === 'string'
      ? req.query.route
      : requestPath.replace(/^\/api\/db/, '') || '/';
    if (!['GET', 'POST', 'PATCH', 'DELETE'].includes(req.method || '')) {
      return jsonResponse(res, 405, { error: 'Method not allowed.' });
    }
    const { user, isAdmin } = await authenticate(req);
    assertAuthorized(req, path, req.method || 'GET', user.id, isAdmin);

    try {
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
    } catch (supabaseError) {
      console.warn('Supabase unavailable; using Neon failover:', supabaseError);
      const fallback = await neonRequest(req, path);
      return jsonResponse(res, fallback.status, fallback.body);
    }
  } catch (error) {
    return jsonResponse(res, 500, { error: error instanceof Error ? error.message : 'Database request failed.' });
  }
}
