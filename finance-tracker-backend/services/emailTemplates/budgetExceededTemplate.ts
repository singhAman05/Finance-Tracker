import { renderEmailLayout } from './layout';

export const budgetExceededTemplate = (categoryName: string, spent: number, limit: number, currency: string): string => {
  const ratio = limit > 0 ? Math.round((spent / limit) * 100) : 0;

  return renderEmailLayout({
    title: 'Budget Alert',
    eyebrow: 'Limit Exceeded',
    accent: 'linear-gradient(135deg, #b91c1c 0%, #991b1b 100%)',
    body: `
      <p class="muted">You have exceeded your budget for this category.</p>
      <p class="metric">${currency} ${spent.toLocaleString()} / ${currency} ${limit.toLocaleString()}</p>
      <span class="pill">${ratio}% used</span>
      <div class="panel">
        <strong>${categoryName}</strong><br />
        Consider reducing spend in this category or adjusting the monthly limit.
      </div>
    `,
  });
};
