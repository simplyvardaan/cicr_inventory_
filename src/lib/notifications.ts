import { supabase } from './supabase';

export type NotificationEvent =
  | 'login'
  | 'logout'
  | 'account_created'
  | 'account_approved'
  | 'account_rejected'
  | 'role_updated'
  | 'borrow_requested'
  | 'borrow_approved'
  | 'borrow_rejected'
  | 'item_returned'
  | 'return_reminder';

export async function notifyEmail(
  event: NotificationEvent,
  to: string | undefined,
  data: Record<string, unknown>
): Promise<boolean> {
  if (!to) {
    console.warn(`Email notification skipped for ${event}: recipient is missing.`);
    return false;
  }
  try {
    const { data: sessionData } = await supabase.auth.getSession();
    const token = sessionData?.session?.access_token;
    if (!token) {
      // If not authenticated, email cannot be dispatched via protected endpoint
      return false;
    }

    const response = await fetch('/api/email', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ event, to, data }),
    });
    if (!response.ok) {
      const details = await response.text();
      console.warn(`Email notification failed for ${event}: ${response.status} ${details}`);
      return false;
    }
    return true;
  } catch (error) {
    console.warn(`Email notification failed for ${event}:`, error);
    return false;
  }
}
