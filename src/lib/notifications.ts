import { supabase } from './supabase';

export type NotificationEvent =
  | 'login'
  | 'logout'
  | 'account_created'
  | 'account_approved'
  | 'account_rejected'
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
  if (!to) return false;
  try {
    const { data: sessionData } = await supabase.auth.getSession();
    const token = sessionData?.session?.access_token;

    const headers: Record<string, string> = {
      'content-type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch('/api/email', {
      method: 'POST',
      headers,
      body: JSON.stringify({ event, to, data }),
    });

    if (!response.ok) {
      return false;
    }
    const result = await response.json().catch(() => ({}));
    return Boolean(result?.sent);
  } catch {
    return false;
  }
}
