import nodemailer from 'nodemailer';
import { logger } from '../utils/logger';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const FROM_ADDRESS = process.env.SMTP_FROM || 'Finance Tracker <noreply@financetracker.app>';

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

export const sendEmail = async (options: EmailOptions): Promise<boolean> => {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    logger.warn('email_skipped', { reason: 'SMTP credentials not configured' });
    return false;
  }

  try {
    await transporter.sendMail({
      from: FROM_ADDRESS,
      to: options.to,
      subject: options.subject,
      html: options.html,
    });
    logger.info('email_sent', { to: options.to, subject: options.subject });
    return true;
  } catch (error) {
    logger.error('email_failed', { to: options.to, error: String(error) });
    return false;
  }
};

// --- Email Templates ---

export const billReminderTemplate = (billName: string, amount: number, dueDate: string, currency: string) => `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: 'Inter', -apple-system, sans-serif; background: #f8fafc; margin: 0; padding: 20px; }
    .container { max-width: 520px; margin: 0 auto; background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden; }
    .header { background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%); padding: 24px 32px; }
    .header h1 { color: #fff; margin: 0; font-size: 20px; font-weight: 700; }
    .body { padding: 32px; }
    .amount { font-size: 32px; font-weight: 800; color: #0f172a; margin: 16px 0; }
    .detail { color: #64748b; font-size: 14px; margin: 8px 0; }
    .detail strong { color: #0f172a; }
    .footer { padding: 16px 32px; background: #f8fafc; border-top: 1px solid #e2e8f0; text-align: center; color: #94a3b8; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>📋 Bill Reminder</h1>
    </div>
    <div class="body">
      <p class="detail">Your bill <strong>${billName}</strong> is coming up soon.</p>
      <p class="amount">${currency} ${amount.toLocaleString()}</p>
      <p class="detail">Due Date: <strong>${dueDate}</strong></p>
      <p class="detail" style="margin-top: 24px; color: #6366f1;">Make sure you have enough balance to cover this payment.</p>
    </div>
    <div class="footer">
      Finance Tracker — Keeping your finances on track
    </div>
  </div>
</body>
</html>
`;

export const recurringTransactionTemplate = (description: string, amount: number, type: string, currency: string) => `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: 'Inter', -apple-system, sans-serif; background: #f8fafc; margin: 0; padding: 20px; }
    .container { max-width: 520px; margin: 0 auto; background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden; }
    .header { background: linear-gradient(135deg, ${type === 'income' ? '#10b981' : '#f43f5e'} 0%, ${type === 'income' ? '#059669' : '#e11d48'} 100%); padding: 24px 32px; }
    .header h1 { color: #fff; margin: 0; font-size: 20px; font-weight: 700; }
    .body { padding: 32px; }
    .amount { font-size: 32px; font-weight: 800; color: ${type === 'income' ? '#10b981' : '#f43f5e'}; margin: 16px 0; }
    .detail { color: #64748b; font-size: 14px; margin: 8px 0; }
    .detail strong { color: #0f172a; }
    .footer { padding: 16px 32px; background: #f8fafc; border-top: 1px solid #e2e8f0; text-align: center; color: #94a3b8; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🔄 Recurring ${type === 'income' ? 'Income' : 'Expense'} Processed</h1>
    </div>
    <div class="body">
      <p class="detail">A recurring transaction has been automatically processed:</p>
      <p class="detail"><strong>${description}</strong></p>
      <p class="amount">${type === 'income' ? '+' : '-'}${currency} ${amount.toLocaleString()}</p>
      <p class="detail">Type: <strong>${type === 'income' ? 'Income' : 'Expense'}</strong></p>
    </div>
    <div class="footer">
      Finance Tracker — Keeping your finances on track
    </div>
  </div>
</body>
</html>
`;

export const budgetExceededTemplate = (categoryName: string, spent: number, limit: number, currency: string) => `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: 'Inter', -apple-system, sans-serif; background: #f8fafc; margin: 0; padding: 20px; }
    .container { max-width: 520px; margin: 0 auto; background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden; }
    .header { background: linear-gradient(135deg, #f43f5e 0%, #e11d48 100%); padding: 24px 32px; }
    .header h1 { color: #fff; margin: 0; font-size: 20px; font-weight: 700; }
    .body { padding: 32px; }
    .amount { font-size: 28px; font-weight: 800; color: #f43f5e; margin: 16px 0; }
    .detail { color: #64748b; font-size: 14px; margin: 8px 0; }
    .detail strong { color: #0f172a; }
    .progress-bar { width: 100%; height: 8px; background: #e2e8f0; border-radius: 4px; margin: 16px 0; overflow: hidden; }
    .progress-fill { height: 100%; background: #f43f5e; border-radius: 4px; }
    .footer { padding: 16px 32px; background: #f8fafc; border-top: 1px solid #e2e8f0; text-align: center; color: #94a3b8; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>⚠️ Budget Alert</h1>
    </div>
    <div class="body">
      <p class="detail">Your budget for <strong>${categoryName}</strong> has been exceeded.</p>
      <p class="amount">${currency} ${spent.toLocaleString()} / ${currency} ${limit.toLocaleString()}</p>
      <div class="progress-bar">
        <div class="progress-fill" style="width: 100%"></div>
      </div>
      <p class="detail">You've spent <strong>${Math.round((spent / limit) * 100)}%</strong> of your budget limit.</p>
    </div>
    <div class="footer">
      Finance Tracker — Keeping your finances on track
    </div>
  </div>
</body>
</html>
`;
