import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getMailFrom, isSmtpConfigured, getTransporter, renderEmail } from './_mailer';

const allowedEvents = new Set([
  'login',
  'logout',
  'account_created',
  'account_approved',
  'account_rejected',
  'role_updated',
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

  try {
    const transporter = getTransporter();
    const message = renderEmail(event, data && typeof data === 'object' ? data : {});
    await Promise.race([
      transporter.sendMail({ from: getMailFrom(), to, ...message }),
      new Promise((_, reject) => setTimeout(() => reject(new Error('SMTP transmission timed out')), 5000))
    ]);
    return res.status(202).json({ sent: true });
  } catch (error) {
    console.error('SMTP delivery failed:', error);
    return res.status(502).json({
      error: 'Email delivery failed.',
      details: error instanceof Error ? error.message : String(error)
    });
  }
}
