import { renderEmailLayout } from './layout';

export const recurringTransactionTemplate = (
  description: string,
  amount: number,
  type: string,
  currency: string,
): string => {
  const isIncome = type === 'income';
  const accent = isIncome
    ? 'linear-gradient(135deg, #059669 0%, #0f766e 100%)'
    : 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)';

  return renderEmailLayout({
    title: `Recurring ${isIncome ? 'Income' : 'Expense'} Processed`,
    eyebrow: 'Automated Transaction',
    accent,
    body: `
      <p class="muted">A recurring transaction has been posted automatically.</p>
      <p class="metric">${isIncome ? '+' : '-'}${currency} ${amount.toLocaleString()}</p>
      <ul class="list">
        <li><span class="label">Description:</span> <span class="strong">${description}</span></li>
        <li><span class="label">Type:</span> <span class="strong">${isIncome ? 'Income' : 'Expense'}</span></li>
      </ul>
    `,
  });
};
