import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import { getMailFrom, isSmtpConfigured, mailer, renderEmail } from './_mailer';

const allowedEvents = new Set([
  'login',
  'logout',
  'account_created',
  'account_approved',
  'account_rejected',
  'borrow_requested',
  'borrow_approved',
  'borrow_rejected',
  'item_returned',
  'return_reminder',
]);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed.' });
  if (!isSmtpConfigured()) {
    return res.status(503).json({ error: 'SMTP is not configured.' });
  }
  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
  const authorization = req.headers.authorization;
  if (!supabaseUrl || !supabaseAnonKey || !authorization?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication is required.' });
  }
  const supabase = createClient(supabaseUrl, supabaseAnonKey, { auth: { persistSession: false } });
  const { data: authData, error: authError } = await supabase.auth.getUser(authorization.slice(7));
  if (authError || !authData.user) return res.status(401).json({ error: 'Authentication is required.' });

  const { event, to, data } = req.body || {};
  if (typeof event !== 'string' || !allowedEvents.has(event)) {
    return res.status(400).json({ error: 'Unsupported email event.' });
  }
  if (typeof to !== 'string' || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(to)) {
    return res.status(400).json({ error: 'A valid recipient is required.' });
  }
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', authData.user.id)
    .maybeSingle();
  const isAdmin = profile?.role === 'admin' || authData.user.user_metadata?.role === 'admin';
  if (!isAdmin && to.toLowerCase() !== (authData.user.email || '').toLowerCase()) {
    return res.status(403).json({ error: 'You may only send notifications to your own verified address.' });
  }

  try {
    const message = renderEmail(event, data && typeof data === 'object' ? data : {});
    await mailer.sendMail({ from: getMailFrom(), to, ...message });
    return res.status(202).json({ sent: true });
  } catch (error) {
    console.error('SMTP delivery failed:', error);
    return res.status(502).json({ error: 'Email delivery failed.' });
  }
}
