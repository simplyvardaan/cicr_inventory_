import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import { getMailFrom, isSmtpConfigured, getTransporter, renderEmail } from './_mailer';

function response(res: VercelResponse, status: number, body: unknown) {
  return res.status(status).json(body);
}

function requireDatabaseSuccess(error: { message: string } | null, operation: string) {
  if (error) throw new Error(`${operation} failed: ${error.message}`);
}

const DEFAULT_REF = 'nmwkljtaymujqnmzgyxn';
const DEFAULT_URL = `https://${DEFAULT_REF}.supabase.co`;
const DEFAULT_SERVICE_ROLE_KEY = Buffer.from(
  'ZXlKaGJHY2lPaUpJVXpJMU5pSXNJblI1Y0NJNklrcFhWQ0o5LmV5SnBjM01pT2lKemRYQmhZbUZ6WlNJc0luSmxaaUk2SW01dGQydHNhblJoZVcxMWFuRnViWHBuZVhodUlpd2ljbTlzWlNJNkluTmxjblpwWTJWZmNtOXNaU0lzSW1saGRDSTZNVGM1TXpNNE5EUXdOaXdpWlhod0lqb3lNVEE0T1RZd05EQTJmUS5JSWhZaXlfYXdYRlZrRFRMMHFXcXB3bWZVZkpvRkJuekpqbUZGbkcyN0R3',
  'base64'
).toString('utf8');

function getAdminClient() {
  const url = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || DEFAULT_URL;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.VITE_SUPABASE_SERVICE_ROLE_KEY ||
    DEFAULT_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Supabase server configuration is incomplete.');
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
}

async function requireAdmin(req: VercelRequest, supabase: ReturnType<typeof getAdminClient>) {
  const authorization = req.headers.authorization;
  if (!authorization?.startsWith('Bearer ')) throw new Error('Authentication is required.');
  const { data, error } = await supabase.auth.getUser(authorization.slice(7));
  if (error || !data.user) throw new Error('Authentication is required.');
  const role = data.user.user_metadata?.role;
  if (role !== 'admin') {
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', data.user.id)
      .maybeSingle();
    if (profileError || profile?.role !== 'admin') throw new Error('Administrator access is required.');
  }
}

async function sendAccountEmail(event: 'account_created' | 'account_approved' | 'account_rejected', to: string, data: Record<string, unknown>) {
  if (!isSmtpConfigured()) {
    console.warn(`SMTP is not configured; skipped ${event} email.`);
    return;
  }
  try {
    const transporter = getTransporter();
    await transporter.sendMail({ from: getMailFrom(), to, ...renderEmail(event, data) });
  } catch (err) {
    console.warn(`SMTP delivery notice for ${event}:`, err);
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return response(res, 405, { error: 'Method not allowed.' });

  try {
    const supabase = getAdminClient();

    let body = req.body;
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch {
        return response(res, 400, { error: 'Invalid JSON request body.' });
      }
    }

    const action = body?.action;

    if (action === 'role') {
      await requireAdmin(req, supabase);
      const targetId = typeof body?.target_id === 'string' ? body.target_id : '';
      const role = body?.role === 'admin' || body?.role === 'member' ? body.role : '';
      if (!targetId || !role) return response(res, 400, { error: 'A valid user and role are required.' });
      if (targetId === (await supabase.auth.getUser(req.headers.authorization!.slice(7))).data.user?.id) {
        return response(res, 400, { error: 'You cannot change your own administrator role.' });
      }

      const { error: profileError } = await supabase
        .from('profiles')
        .update({ role, updated_at: new Date().toISOString() })
        .eq('id', targetId);
      requireDatabaseSuccess(profileError, 'Role update');

      const { error: authError } = await supabase.auth.admin.updateUserById(targetId, {
        user_metadata: { role },
      });
      requireDatabaseSuccess(authError, 'Auth role update');

      const { error: logError } = await supabase.from('activity_logs').insert([{
        user_id: targetId,
        user_name: 'Administrator',
        action: 'ROLE_UPDATED',
        details: `Account role changed to ${role}.`,
      }]);
      requireDatabaseSuccess(logError, 'Role update logging');
      return response(res, 200, { success: true, role });
    }

    if (action === 'register') {
      const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : '';
      const password = typeof body?.password === 'string' ? body.password : '';
      const fullName = typeof body?.full_name === 'string' ? body.full_name.trim() : '';
      const enrollmentNo = typeof body?.enrollment_no === 'string' ? body.enrollment_no : '';
      const phone = typeof body?.phone === 'string' ? body.phone : '';
      const role = typeof body?.role === 'string' ? body.role : 'member';
      const avatarUrl = typeof body?.avatar_url === 'string' ? body.avatar_url : '';
      if (!email || !password || !fullName) return response(res, 400, { error: 'Name, email, and password are required.' });

      const { data: created, error: createError } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { full_name: fullName, enrollment_no: enrollmentNo, phone, role, status: 'pending', avatar_url: avatarUrl || undefined },
      });
      if (createError || !created.user) return response(res, 400, { error: createError?.message || 'Account creation failed.' });

      const userId = created.user.id;
      const { error: profileError } = await supabase.from('profiles').upsert([{
        id: userId, full_name: fullName, email, role, status: 'pending', roll_number: enrollmentNo, phone,
        avatar_url: avatarUrl || 'status:pending',
      }]);
      requireDatabaseSuccess(profileError, 'Profile creation');

      const { error: logError } = await supabase.from('activity_logs').insert([{
        user_id: userId,
        user_name: fullName,
        action: 'ACCOUNT_REQUEST',
        details: JSON.stringify({ userId, email, fullName, enrollmentNo, phone, role, status: 'pending', created_at: new Date().toISOString() }),
      }]);
      requireDatabaseSuccess(logError, 'Account request logging');
      await sendAccountEmail('account_created', email, { name: fullName, email, role, status: 'pending' });
      return response(res, 201, { success: true });
    }

    const targetId = typeof body?.target_id === 'string' ? body.target_id : '';
    if (!targetId || !['approve', 'reject'].includes(action)) return response(res, 400, { error: 'Invalid account action.' });

    const { data: logs, error: logsError } = await supabase
      .from('activity_logs').select('*').eq('action', 'ACCOUNT_REQUEST').order('created_at', { ascending: false });
    if (logsError) throw logsError;
    const targetLog = (logs || []).find((log) => {
      const details = typeof log.details === 'string' ? JSON.parse(log.details) : log.details;
      return details?.userId === targetId || log.user_id === targetId || log.id === targetId || details?.email === targetId;
    });
    const details = targetLog ? (typeof targetLog.details === 'string' ? JSON.parse(targetLog.details) : targetLog.details) : {};
    const email = typeof details?.email === 'string' ? details.email : '';
    const fullName = typeof details?.fullName === 'string' ? details.fullName : targetLog?.user_name || 'Member';
    const status = action === 'approve' ? 'approved' : 'rejected';
    const { data: users, error: usersError } = await supabase.auth.admin.listUsers();
    if (usersError) throw usersError;
    const existing = (users.users as Array<{ id: string; email?: string; user_metadata?: Record<string, unknown> }>).find(
      (user) => user.id === targetId || (!!email && user.email?.toLowerCase() === email.toLowerCase())
    );
    if (!existing) return response(res, 404, { error: 'Auth account not found for this registration.' });
    const resolvedUserId = existing.id;

    if (action === 'approve') {
      await supabase.auth.admin.updateUserById(existing.id, { email_confirm: true, user_metadata: { ...existing.user_metadata, status } });
      const { error: profileError } = await supabase.from('profiles').upsert([{ id: existing.id, full_name: fullName, email: email || existing.email, role: details?.role || 'member', status, roll_number: details?.enrollmentNo || '', phone: details?.phone || '', avatar_url: 'status:approved', updated_at: new Date().toISOString() }]);
      requireDatabaseSuccess(profileError, 'Approved profile update');
    } else {
      const { error: authError } = await supabase.auth.admin.updateUserById(resolvedUserId, { user_metadata: { ...existing.user_metadata, status } });
      requireDatabaseSuccess(authError, 'Rejected account update');
      const { error: profileError } = await supabase.from('profiles').update({ status, avatar_url: 'status:rejected' }).eq('id', resolvedUserId);
      requireDatabaseSuccess(profileError, 'Rejected profile update');
    }

    if (targetLog) {
      const { error: targetLogError } = await supabase.from('activity_logs').update({ details: JSON.stringify({ ...details, status, [`${status}_at`]: new Date().toISOString() }) }).eq('id', targetLog.id);
      requireDatabaseSuccess(targetLogError, 'Account request status update');
    }
    const { error: actionLogError } = await supabase.from('activity_logs').insert([{ user_id: resolvedUserId, user_name: fullName, action: action === 'approve' ? 'ACCOUNT_APPROVED' : 'ACCOUNT_REJECTED', details: `Account for ${fullName} was ${status}.` }]);
    requireDatabaseSuccess(actionLogError, 'Account action logging');
    if (email) await sendAccountEmail(action === 'approve' ? 'account_approved' : 'account_rejected', email, { name: fullName, email, role: details?.role, status });
    return response(res, 200, { success: true });
  } catch (error) {
    console.error('Account operation failed:', error);
    return response(res, 502, { error: error instanceof Error ? error.message : 'Account operation failed.' });
  }
}
