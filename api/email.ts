import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import { getMailFrom, isSmtpConfigured, getTransporter, renderEmail } from './_mailer';

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

const DEFAULT_REF = 'nmwkljtaymujqnmzgyxn';
const DEFAULT_URL = `https://${DEFAULT_REF}.supabase.co`;
const DEFAULT_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5td2tsanRheW11anFubXpneXhuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTMzODQ0MDYsImV4cCI6MjEwODk2MDQwNn0.LGEoX7QPu2O9yxw0LT74rerIo4_Tj9CHCWlsT1hoxT8';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed.' });

  try {
    if (!isSmtpConfigured()) {
      // Return 200 indicating SMTP is disabled/not configured so frontend doesn't error
      return res.status(200).json({ sent: false, message: 'SMTP service is not configured.' });
    }

    let body = req.body;
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch {
        return res.status(400).json({ error: 'Invalid JSON request body.' });
      }
    }

    const { event, to, data } = body || {};
    if (typeof event !== 'string' || !allowedEvents.has(event)) {
      return res.status(400).json({ error: 'Unsupported email event.' });
    }
    if (typeof to !== 'string' || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(to)) {
      return res.status(400).json({ error: 'A valid recipient is required.' });
    }

    // Optional verification if authorization header is provided
    const authorization = req.headers.authorization;
    if (authorization?.startsWith('Bearer ')) {
      try {
        const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || DEFAULT_URL;
        const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || DEFAULT_ANON_KEY;
        const supabase = createClient(supabaseUrl, supabaseAnonKey, { auth: { persistSession: false } });
        const { data: authData } = await supabase.auth.getUser(authorization.slice(7));
        if (authData?.user) {
          const userEmail = (authData.user.email || '').toLowerCase();
          const targetEmail = to.trim().toLowerCase();
          const isAdmin =
            authData.user.user_metadata?.role === 'admin' ||
            ['vardaansaxena096@gmail.com', 'cicrinventory@gmail.com', 'cicrinventoryofficial@gmail.com'].includes(userEmail);

          if (!isAdmin && userEmail && targetEmail !== userEmail) {
            return res.status(403).json({ error: 'You may only send notifications to your own verified address.' });
          }
        }
      } catch {
        // Continue if auth verification times out
      }
    }

    const transporter = getTransporter();
    const message = renderEmail(event, data && typeof data === 'object' ? data : {});

    await Promise.race([
      transporter.sendMail({ from: getMailFrom(), to, ...message }),
      new Promise((_, reject) => setTimeout(() => reject(new Error('SMTP transmission timed out')), 4000))
    ]);

    return res.status(200).json({ sent: true });
  } catch (error) {
    console.warn('Notice from email notification handler:', error instanceof Error ? error.message : String(error));
    return res.status(200).json({
      sent: false,
      message: 'Email transmission was deferred or unavailable.'
    });
  }
}
