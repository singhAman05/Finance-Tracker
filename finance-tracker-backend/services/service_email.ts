import nodemailer from 'nodemailer';
import { logger } from '../utils/logger';

export { billReminderTemplate, recurringTransactionTemplate, budgetExceededTemplate } from './emailTemplates';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const FROM_ADDRESS = process.env.SMTP_FROM || 'Fintrak <noreply@fintrak.app>';

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
