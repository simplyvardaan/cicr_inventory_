import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import { getMailFrom, isSmtpConfigured, mailer, renderEmail } from './_mailer';

const DEFAULT_REF = 'nmwkljtaymujqnmzgyxn';
const DEFAULT_URL = `https://${DEFAULT_REF}.supabase.co`;
const DEFAULT_SERVICE_ROLE_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5td2tsanRheW11anFubXpneXhuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5MzM4NDQwNiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5MzM4NDQwNiwiZXhwIjoyMTA4OTYwNDA2fQ.IIhYiy_awXFVkDTL0qWqpwmFUfJoFBnzJjmFFnG27Dw';

function response(res: VercelResponse, status: number, body: unknown) {
  return res.status(status).json(body);
}

function requireDatabaseSuccess(error: { message: string } | null, operation: string) {
  if (error) throw new Error(`${operation} failed: ${error.message}`);
}

function getAdminClient() {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || DEFAULT_URL;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.VITE_SUPABASE_SERVICE_ROLE_KEY ||
    DEFAULT_SERVICE_ROLE_KEY;
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
}

async function requireAdmin(req: VercelRequest, supabase: ReturnType<typeof getAdminClient>) {
  const authorization = req.headers.authorization;
  if (!authorization?.startsWith('Bearer ')) throw new Error('Authentication is required.');
  const { data, error } = await supabase.auth.getUser(authorization.slice(7));
  if (error || !data.user) throw new Error('Authentication is required.');
  
  const userEmail = (data.user.email || '').toLowerCase();
  const isSuperAdmin = ['vardaansaxena096@gmail.com', 'cicrinventory@gmail.com', 'cicrinventoryofficial@gmail.com'].includes(userEmail);
  const role = data.user.user_metadata?.role;
  if (role !== 'admin' && !isSuperAdmin) {
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
    return;
  }
  try {
    await Promise.race([
      mailer.sendMail({ from: getMailFrom(), to, ...renderEmail(event, data) }),
      new Promise((_, reject) => setTimeout(() => reject(new Error('SMTP transmission timed out')), 4000)),
    ]);
  } catch (err) {
    console.warn(`Notice from accounts sendAccountEmail (${event}):`, err instanceof Error ? err.message : String(err));
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return response(res, 405, { error: 'Method not allowed.' });

  try {
    const supabase = getAdminClient();
    const action = req.body?.action;

    if (action === 'role') {
      await requireAdmin(req, supabase);
      const targetId = typeof req.body.target_id === 'string' ? req.body.target_id : '';
      const role = req.body.role === 'admin' || req.body.role === 'member' ? req.body.role : '';
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
      const email = typeof req.body.email === 'string' ? req.body.email.trim().toLowerCase() : '';
      const password = typeof req.body.password === 'string' ? req.body.password : '';
      const fullName = typeof req.body.full_name === 'string' ? req.body.full_name.trim() : '';
      const enrollmentNo = typeof req.body.enrollment_no === 'string' ? req.body.enrollment_no : '';
      const phone = typeof req.body.phone === 'string' ? req.body.phone : '';
      const role = 'member';
      const avatarUrl = typeof req.body.avatar_url === 'string' ? req.body.avatar_url : '';
      if (!email || !password || !fullName) return response(res, 400, { error: 'Name, email, and password are required.' });

      // Check if user already exists in auth
      const { data: usersList } = await supabase.auth.admin.listUsers();
      const existingUser = usersList?.users?.find((u) => u.email?.toLowerCase() === email.toLowerCase());

      let userId = existingUser?.id;
      if (!userId) {
        const { data: created, error: createError } = await supabase.auth.admin.createUser({
          email,
          password,
          email_confirm: true,
          user_metadata: { full_name: fullName, enrollment_no: enrollmentNo, phone, role, status: 'pending', avatar_url: avatarUrl || undefined },
        });
        if (createError || !created?.user) return response(res, 400, { error: createError?.message || 'Account creation failed.' });
        userId = created.user.id;
      }

      const { error: profileError } = await supabase.from('profiles').upsert([{
        id: userId,
        full_name: fullName,
        email,
        role,
        status: 'pending',
        roll_number: enrollmentNo,
        phone,
        avatar_url: (avatarUrl && !avatarUrl.startsWith('status:')) ? avatarUrl : null,
        updated_at: new Date().toISOString(),
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

    await requireAdmin(req, supabase);
    const targetId = typeof req.body.target_id === 'string' ? req.body.target_id.trim() : '';
    const targetEmail = typeof req.body.target_email === 'string' ? req.body.target_email.trim().toLowerCase() : '';
    if ((!targetId && !targetEmail) || !['approve', 'reject'].includes(action)) {
      return response(res, 400, { error: 'Invalid account action or identifier.' });
    }

    const { data: logs, error: logsError } = await supabase
      .from('activity_logs').select('*').eq('action', 'ACCOUNT_REQUEST').order('created_at', { ascending: false });
    if (logsError) throw logsError;

    const targetLog = (logs || []).find((log) => {
      let details: any = {};
      try { details = typeof log.details === 'string' ? JSON.parse(log.details) : log.details; } catch {}
      const logEmail = (details?.email || '').toLowerCase();
      const logUserId = details?.userId || log.user_id;
      return (
        (targetId && (log.id === targetId || logUserId === targetId)) ||
        (targetEmail && logEmail === targetEmail)
      );
    });

    const details = targetLog ? (typeof targetLog.details === 'string' ? JSON.parse(targetLog.details) : targetLog.details) : {};
    const email = (targetEmail || (typeof details?.email === 'string' ? details.email : '')).trim().toLowerCase();
    const fullName = typeof details?.fullName === 'string' ? details.fullName : targetLog?.user_name || 'Member';
    const status = action === 'approve' ? 'approved' : 'rejected';

    const { data: users, error: usersError } = await supabase.auth.admin.listUsers();
    if (usersError) throw usersError;

    const existing = (users.users as Array<{ id: string; email?: string; user_metadata?: Record<string, unknown> }>).find(
      (user) => (targetId && user.id === targetId) || (!!email && user.email?.toLowerCase() === email)
    );

    const resolvedUserId = existing?.id || (targetId && targetId.length === 36 ? targetId : null);

    if (existing) {
      await supabase.auth.admin.updateUserById(existing.id, {
        email_confirm: true,
        user_metadata: { ...existing.user_metadata, status },
      });
    }

    if (action === 'approve') {
      if (resolvedUserId) {
        const { error: profileError } = await supabase.from('profiles').upsert([{
          id: resolvedUserId,
          full_name: fullName,
          email: email || existing?.email,
          role: details?.role || 'member',
          status: 'approved',
          roll_number: details?.enrollmentNo || '',
          phone: details?.phone || '',
          updated_at: new Date().toISOString(),
        }]);
        requireDatabaseSuccess(profileError, 'Approved profile update');
      } else if (email) {
        await supabase.from('profiles').update({
          status: 'approved',
          updated_at: new Date().toISOString(),
        }).ilike('email', email);
      }
    } else {
      if (resolvedUserId) {
        const { error: profileError } = await supabase.from('profiles').update({
          status: 'rejected',
          updated_at: new Date().toISOString(),
        }).eq('id', resolvedUserId);
        requireDatabaseSuccess(profileError, 'Rejected profile update');
      } else if (email) {
        await supabase.from('profiles').update({
          status: 'rejected',
          updated_at: new Date().toISOString(),
        }).ilike('email', email);
      }
    }

    // Permanently resolve ALL matching ACCOUNT_REQUEST logs
    const matchingLogs = (logs || []).filter((log) => {
      let d: any = {};
      try { d = typeof log.details === 'string' ? JSON.parse(log.details) : log.details; } catch {}
      const logEmail = (d?.email || '').toLowerCase();
      const logUserId = d?.userId || log.user_id;
      return (
        (targetId && (log.id === targetId || logUserId === targetId)) ||
        (resolvedUserId && (logUserId === resolvedUserId || log.user_id === resolvedUserId)) ||
        (email && logEmail === email)
      );
    });

    for (const log of matchingLogs) {
      let d: any = {};
      try { d = typeof log.details === 'string' ? JSON.parse(log.details) : log.details; } catch {}
      await supabase
        .from('activity_logs')
        .update({
          details: JSON.stringify({
            ...d,
            status,
            [`${status}_at`]: new Date().toISOString(),
          }),
        })
        .eq('id', log.id);
    }

    // Insert action confirmation log
    if (resolvedUserId || email) {
      await supabase.from('activity_logs').insert([{
        user_id: resolvedUserId || undefined,
        user_name: fullName,
        action: action === 'approve' ? 'ACCOUNT_APPROVED' : 'ACCOUNT_REJECTED',
        details: `Account for ${fullName} (${email || 'applicant'}) was ${status}.`,
      }]);
    }

    if (email) {
      await sendAccountEmail(
        action === 'approve' ? 'account_approved' : 'account_rejected',
        email,
        { name: fullName, email, role: details?.role || 'member', status }
      );
    }

    return response(res, 200, { success: true });
  } catch (error) {
    console.error('Account operation failed:', error);
    return response(res, 502, { error: error instanceof Error ? error.message : 'Account operation failed.' });
  }
}
