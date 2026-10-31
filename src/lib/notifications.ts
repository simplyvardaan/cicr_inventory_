export type NotificationEvent =
  | 'login'
  | 'logout'
  | 'account_created'
  | 'account_approved'
  | 'account_rejected'
  | 'borrow_requested'
  | 'borrow_approved'
  | 'borrow_rejected'
  | 'item_returned';

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
    const response = await fetch('/api/email', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
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
