import { renderEmailLayout } from './layout';

export const billReminderTemplate = (billName: string, amount: number, dueDate: string, currency: string): string =>
  renderEmailLayout({
    title: 'Bill Reminder',
    eyebrow: 'Upcoming Payment',
    accent: 'linear-gradient(135deg, #1d4ed8 0%, #4338ca 100%)',
    body: `
      <p class="muted">Your bill is due soon. Please review the details below.</p>
      <p class="metric">${currency} ${amount.toLocaleString()}</p>
      <ul class="list">
        <li><span class="label">Bill:</span> <span class="strong">${billName}</span></li>
        <li><span class="label">Due date:</span> <span class="strong">${dueDate}</span></li>
      </ul>
      <div class="panel">
        Keep enough balance in the linked account so this payment clears on time.
      </div>
    `,
  });
