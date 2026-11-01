import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import { Client } from 'pg';
import { getMailFrom, isSmtpConfigured, getTransporter, renderEmail } from './_mailer';

function response(res: VercelResponse, status: number, body: unknown) {
  return res.status(status).json(body);
}

function requireDatabaseSuccess(error: { message: string } | null, operation: string) {
  if (error) throw new Error(`${operation} failed: ${error.message}`);
}

const DEFAULT_REF = 'nmwkljtaymujqnmzgyxn';
const DEFAULT_URL = `https://${DEFAULT_REF}.supabase.co`;

const SUPERADMIN_EMAILS = [
  'vardaansaxena096@gmail.com',
  'cicrinventory@gmail.com',
  'cicrinventoryofficial@gmail.com',
];

function getAdminClient() {
  const url = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || DEFAULT_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Supabase server configuration is incomplete.');
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
}

async function requireAdmin(req: VercelRequest, supabase: ReturnType<typeof getAdminClient>) {
  const authorization = req.headers.authorization;
  if (!authorization?.startsWith('Bearer ')) throw new Error('Authentication is required.');
  const { data, error } = await supabase.auth.getUser(authorization.slice(7));
  if (error || !data.user) throw new Error('Authentication is required.');
  const email = (data.user.email || '').toLowerCase();
  const isSuperadmin = SUPERADMIN_EMAILS.includes(email);
  if (isSuperadmin) return data.user;

  // Check admin role in profiles table
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role, status')
    .eq('id', data.user.id)
    .maybeSingle();
  if (profileError || profile?.role !== 'admin' || profile?.status !== 'approved') {
    throw new Error('Administrator access is required.');
  }
  return data.user;
}

async function sendAccountEmail(
  event: 'account_created' | 'account_approved' | 'account_rejected' | 'role_updated',
  to: string,
  data: Record<string, unknown>
) {
  if (!isSmtpConfigured()) {
    console.warn(`SMTP is not configured; skipped ${event} email.`);
    return;
  }
  try {
    const transporter = getTransporter();
    await Promise.race([
      transporter.sendMail({ from: getMailFrom(), to, ...renderEmail(event, data) }),
      new Promise((_, reject) => setTimeout(() => reject(new Error('SMTP transmission timed out')), 4500))
    ]);
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

    // Public Registration: Any public user can register, but role is strictly enforced to 'member'
    if (action === 'register') {
      const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : '';
      const password = typeof body?.password === 'string' ? body.password : '';
      const fullName = typeof body?.full_name === 'string' ? body.full_name.trim() : '';
      const enrollmentNo = typeof body?.enrollment_no === 'string' ? body.enrollment_no : '';
      const phone = typeof body?.phone === 'string' ? body.phone : '';
      const avatarUrl = typeof body?.avatar_url === 'string' ? body.avatar_url : '';

      if (!email || !password || !fullName) {
        return response(res, 400, { error: 'Name, email, and password are required.' });
      }

      // Security: Force role to 'member' and status to 'pending' unless superadmin
      const isSuperadmin = SUPERADMIN_EMAILS.includes(email);
      const role = isSuperadmin ? 'admin' : 'member';
      const status = isSuperadmin ? 'approved' : 'pending';

      const { data: created, error: createError } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
          full_name: fullName,
          enrollment_no: enrollmentNo,
          phone,
          role,
          status,
          avatar_url: avatarUrl || undefined,
        },
      });
      if (createError || !created.user) {
        return response(res, 400, { error: createError?.message || 'Account creation failed.' });
      }

      const userId = created.user.id;
      const { error: profileError } = await supabase.from('profiles').upsert([{
        id: userId,
        full_name: fullName,
        email,
        role,
        status,
        roll_number: enrollmentNo,
        phone,
        avatar_url: avatarUrl || `status:${status}`,
      }]);
      requireDatabaseSuccess(profileError, 'Profile creation');

      const { error: logError } = await supabase.from('activity_logs').insert([{
        user_id: userId,
        user_name: fullName,
        action: 'ACCOUNT_REQUEST',
        details: JSON.stringify({
          userId,
          email,
          fullName,
          enrollmentNo,
          phone,
          role,
          status,
          created_at: new Date().toISOString(),
        }),
      }]);
      requireDatabaseSuccess(logError, 'Account request logging');

      await sendAccountEmail('account_created', email, { name: fullName, email, role, status });
      return response(res, 201, { success: true });
    }

    // ALL OTHER ACTIONS REQUIRE VERIFIED ADMINISTRATOR AUTHENTICATION
    if (!['approve', 'reject', 'role'].includes(action)) {
      return response(res, 400, { error: 'Invalid account action.' });
    }

    const adminUser = await requireAdmin(req, supabase);

    if (action === 'role') {
      const targetId = typeof body?.target_id === 'string' ? body.target_id : '';
      const role = body?.role === 'admin' || body?.role === 'member' ? body.role : '';
      if (!targetId || !role) return response(res, 400, { error: 'A valid user and role are required.' });
      if (targetId === adminUser?.id) {
        return response(res, 400, { error: 'You cannot change your own administrator role.' });
      }

      // Fetch target user profile and auth details
      const { data: targetProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', targetId)
        .maybeSingle();

      const { data: targetAuthUser } = await supabase.auth.admin.getUserById(targetId);
      const targetEmail = targetProfile?.email || targetAuthUser?.user?.email;
      const targetName = targetProfile?.full_name || targetAuthUser?.user?.user_metadata?.full_name || 'Member';

      // 1. Update Supabase Auth user metadata
      await supabase.auth.admin.updateUserById(targetId, {
        user_metadata: {
          ...(targetAuthUser?.user?.user_metadata || {}),
          role,
        },
      });

      // 2. Update profiles table
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ role, updated_at: new Date().toISOString() })
        .eq('id', targetId);
      requireDatabaseSuccess(profileError, 'Profile role update');

      // 3. Mirror update to Neon if configured
      if (process.env.NEON_DATABASE_URL) {
        try {
          const pgClient = new Client({
            connectionString: process.env.NEON_DATABASE_URL,
            ssl: { rejectUnauthorized: true },
          });
          await pgClient.connect();
          await pgClient.query('UPDATE profiles SET role = $1, updated_at = NOW() WHERE id = $2', [role, targetId]);
          await pgClient.end();
        } catch (neonErr) {
          console.warn('Neon role update notice:', neonErr);
        }
      }

      // 4. Log role change activity
      const adminName = adminUser.user_metadata?.full_name || adminUser.email || 'Admin';
      const { error: logError } = await supabase.from('activity_logs').insert([{
        user_id: targetId,
        user_name: targetName,
        action: 'ROLE_UPDATED',
        details: `${targetName}'s role was updated to ${role.toUpperCase()} by ${adminName}.`,
      }]);
      requireDatabaseSuccess(logError, 'Role update logging');

      // 5. Send notification email if target email exists
      if (targetEmail) {
        await sendAccountEmail('role_updated', targetEmail, {
          name: targetName,
          email: targetEmail,
          role,
        });
      }

      return response(res, 200, { success: true, role });
    }

    // Action is 'approve' or 'reject'
    const targetId = typeof body?.target_id === 'string' ? body.target_id : '';
    const bodyEmail = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : '';
    if (!targetId) return response(res, 400, { error: 'Target user ID is required.' });

    const { data: logs, error: logsError } = await supabase
      .from('activity_logs').select('*').eq('action', 'ACCOUNT_REQUEST').order('created_at', { ascending: false });
    if (logsError) throw logsError;

    const targetLog = (logs || []).find((log) => {
      let details: any = {};
      try {
        details = typeof log.details === 'string' ? JSON.parse(log.details) : log.details;
      } catch {
        details = {};
      }
      return (
        details?.userId === targetId ||
        log.user_id === targetId ||
        log.id === targetId ||
        (details?.email && details.email.toLowerCase() === targetId.toLowerCase()) ||
        (bodyEmail && details?.email?.toLowerCase() === bodyEmail)
      );
    });

    let details: any = {};
    try {
      details = targetLog && typeof targetLog.details === 'string' ? JSON.parse(targetLog.details) : targetLog?.details || {};
    } catch {
      details = {};
    }

    const email = bodyEmail || (typeof details?.email === 'string' ? details.email.toLowerCase() : '');
    const fullName = typeof details?.fullName === 'string' ? details.fullName : targetLog?.user_name || 'Member';
    const status = action === 'approve' ? 'approved' : 'rejected';

    const { data: users, error: usersError } = await supabase.auth.admin.listUsers();
    if (usersError) throw usersError;
    const existing = (users.users as Array<{ id: string; email?: string; user_metadata?: Record<string, unknown> }>).find(
      (user) => user.id === targetId || (!!email && user.email?.toLowerCase() === email)
    );
    const resolvedUserId = existing?.id || targetId;

    if (existing) {
      await supabase.auth.admin.updateUserById(existing.id, {
        email_confirm: true,
        user_metadata: { ...existing.user_metadata, status },
      });
    }

    if (action === 'approve') {
      // Fetch existing profile to preserve legitimate role, otherwise default to member
      const { data: existingProf } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', resolvedUserId)
        .maybeSingle();

      const isSuperadmin = email && SUPERADMIN_EMAILS.includes(email.toLowerCase());
      const approvedRole = isSuperadmin ? 'admin' : (existingProf?.role === 'admin' ? 'admin' : 'member');

      const { error: profileError } = await supabase.from('profiles').upsert([{
        id: resolvedUserId,
        full_name: fullName,
        email: email || existing?.email,
        role: approvedRole,
        status: 'approved',
        roll_number: details?.enrollmentNo || '',
        phone: details?.phone || '',
        avatar_url: 'status:approved',
        updated_at: new Date().toISOString(),
      }]);
      requireDatabaseSuccess(profileError, 'Approved profile update');
    } else {
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ status: 'rejected', avatar_url: 'status:rejected', updated_at: new Date().toISOString() })
        .eq('id', resolvedUserId);
      requireDatabaseSuccess(profileError, 'Rejected profile update');
    }

    // Mirror to Neon PostgreSQL if configured
    if (process.env.NEON_DATABASE_URL) {
      try {
        const pgClient = new Client({
          connectionString: process.env.NEON_DATABASE_URL,
          ssl: { rejectUnauthorized: true },
        });
        await pgClient.connect();
        await pgClient.query('UPDATE profiles SET status = $1, avatar_url = $2, updated_at = NOW() WHERE id = $3', [
          status,
          `status:${status}`,
          resolvedUserId,
        ]);
        await pgClient.end();
      } catch (neonErr) {
        console.warn('Neon status sync notice:', neonErr);
      }
    }

    // Update ALL matching ACCOUNT_REQUEST logs so they are permanently marked
    for (const log of logs || []) {
      let lDetails: any = {};
      try {
        lDetails = typeof log.details === 'string' ? JSON.parse(log.details) : log.details;
      } catch {
        lDetails = {};
      }
      const logEmail = (lDetails?.email || '').toLowerCase();
      if (
        log.id === targetId ||
        log.user_id === resolvedUserId ||
        lDetails?.userId === resolvedUserId ||
        (email && logEmail === email)
      ) {
        await supabase
          .from('activity_logs')
          .update({
            details: JSON.stringify({ ...lDetails, status, [`${status}_at`]: new Date().toISOString() }),
          })
          .eq('id', log.id);
      }
    }

    const { error: actionLogError } = await supabase.from('activity_logs').insert([{
      user_id: resolvedUserId,
      user_name: fullName,
      action: action === 'approve' ? 'ACCOUNT_APPROVED' : 'ACCOUNT_REJECTED',
      details: `Account for ${fullName} was ${status}.`,
    }]);
    requireDatabaseSuccess(actionLogError, 'Account action logging');

    if (email) {
      await sendAccountEmail(action === 'approve' ? 'account_approved' : 'account_rejected', email, {
        name: fullName,
        email,
        status,
      });
    }

    return response(res, 200, { success: true });
  } catch (error) {
    console.error('Account operation failed:', error);
    return response(res, 401, { error: error instanceof Error ? error.message : 'Account operation failed.' });
  }
}
