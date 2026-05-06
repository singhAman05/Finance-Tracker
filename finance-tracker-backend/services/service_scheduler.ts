import cron from 'node-cron';
import { supabase } from '../config/supabase';
import redisClient, { getRedisReady } from '../config/redisClient';
import { sendEmail, billReminderTemplate, recurringTransactionTemplate, budgetExceededTemplate } from './service_email';
import { createTransaction } from './service_transactions';
import { generateNextInstance } from './service_bills';
import { logger } from '../utils/logger';

// --- Helpers ---

const SYMBOL_MAP: Record<string, string> = {
  INR: '₹', USD: '$', EUR: '€', GBP: '£', JPY: '¥',
  AUD: 'A$', CAD: 'C$', CHF: 'CHF', CNY: '¥', SGD: 'S$',
};

function getSymbol(currency: string): string {
  return SYMBOL_MAP[currency] || currency;
}

// --- Bill Reminders ---

async function processBillReminders() {
  const today = new Date().toISOString().split('T')[0];

  // Find upcoming bill instances where reminder window is today
  // due_date - reminder_days_before <= today AND status = 'upcoming'
  const { data: upcomingInstances, error } = await supabase
    .from('bill_instances')
    .select(`
      id, due_date, amount, status, bill_id,
      bills!inner (id, client_id, name, reminder_days_before, account_id)
    `)
    .eq('status', 'upcoming')
    .gte('due_date', today);

  if (error || !upcomingInstances) {
    logger.error('scheduler_bill_reminders_failed', { error: String(error) });
    return;
  }

  for (const instance of upcomingInstances) {
    const bill = (instance as any).bills;
    if (!bill || bill.reminder_days_before <= 0) continue;

    // Check if reminder window matches: due_date - reminder_days <= today
    const dueDate = new Date(instance.due_date);
    const reminderDate = new Date(dueDate);
    reminderDate.setDate(reminderDate.getDate() - bill.reminder_days_before);
    const reminderDateStr = reminderDate.toISOString().split('T')[0];

    if (reminderDateStr !== today) continue;

    // Get client settings & email
    const { data: client } = await supabase
      .from('clients')
      .select('email')
      .eq('id', bill.client_id)
      .single();

    if (!client?.email) continue;

    const { data: settings } = await supabase
      .from('client_settings')
      .select('notify_bills, currency')
      .eq('client_id', bill.client_id)
      .single();

    if (!settings?.notify_bills) continue;

    const currencySymbol = getSymbol(settings.currency || 'INR');
    const html = billReminderTemplate(bill.name, instance.amount, instance.due_date, currencySymbol);

    await sendEmail({
      to: client.email,
      subject: `📋 Bill Reminder: ${bill.name} due on ${instance.due_date}`,
      html,
    });

    logger.info('bill_reminder_sent', { bill_id: bill.id, client_id: bill.client_id, due_date: instance.due_date });
  }
}

// --- Recurring Transactions ---

async function processRecurringTransactions() {
  const today = new Date().toISOString().split('T')[0];

  // Find bill instances that are due today and still 'upcoming'
  const { data: dueInstances, error } = await supabase
    .from('bill_instances')
    .select(`
      id, due_date, amount, status, bill_id,
      bills!inner (id, client_id, name, account_id, system_category_id, is_recurring, recurrence_type, recurrence_interval)
    `)
    .eq('status', 'upcoming')
    .eq('due_date', today);

  if (error || !dueInstances) {
    logger.error('scheduler_recurring_failed', { error: String(error) });
    return;
  }

  for (const instance of dueInstances) {
    const bill = (instance as any).bills;
    if (!bill?.account_id) continue;

    try {
      // Create the transaction automatically
      const result = await createTransaction({
        client_id: bill.client_id,
        account_id: bill.account_id,
        category_id: bill.system_category_id,
        amount: instance.amount,
        type: 'expense',
        date: today,
        description: `Auto: ${bill.name}`,
        is_recurring: true,
      });

      if (result.error) {
        logger.error('scheduler_auto_tx_failed', { bill_id: bill.id, error: String(result.error) });
        continue;
      }

      // Mark instance as paid
      await supabase
        .from('bill_instances')
        .update({ status: 'paid', paid_at: new Date().toISOString() })
        .eq('id', instance.id);

      // Generate next instance if recurring
      if (bill.is_recurring) {
        try {
          await generateNextInstance(bill);
        } catch (e) {
          logger.error('scheduler_next_instance_failed', { bill_id: bill.id, error: String(e) });
        }
      }

      // Send notification email
      const { data: client } = await supabase
        .from('clients')
        .select('email')
        .eq('id', bill.client_id)
        .single();

      if (!client?.email) continue;

      const { data: settings } = await supabase
        .from('client_settings')
        .select('notify_recurring, currency')
        .eq('client_id', bill.client_id)
        .single();

      if (!settings?.notify_recurring) continue;

      const currencySymbol = getSymbol(settings.currency || 'INR');
      const html = recurringTransactionTemplate(bill.name, instance.amount, 'expense', currencySymbol);

      await sendEmail({
        to: client.email,
        subject: `🔄 Recurring Payment Processed: ${bill.name}`,
        html,
      });

      logger.info('recurring_tx_processed', { bill_id: bill.id, client_id: bill.client_id });
    } catch (err) {
      logger.error('scheduler_recurring_tx_error', { bill_id: bill.id, error: String(err) });
    }
  }
}

// --- Budget Exceeded Alerts ---

async function processBudgetAlerts() {
  // Get all active budgets with their spending
  const { data: budgets, error } = await supabase
    .from('budgets')
    .select('id, client_id, category_id, amount, name')
    .eq('is_active', true);

  if (error || !budgets) {
    logger.error('scheduler_budget_alerts_failed', { error: String(error) });
    return;
  }

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
  const today = now.toISOString().split('T')[0];

  for (const budget of budgets) {
    // Sum expenses for this category this month
    const { data: txData, error: txError } = await supabase
      .from('transactions')
      .select('amount')
      .eq('client_id', budget.client_id)
      .eq('category_id', budget.category_id)
      .eq('type', 'expense')
      .gte('date', startOfMonth)
      .lte('date', today);

    if (txError || !txData) continue;

    const totalSpent = txData.reduce((sum, tx) => sum + Number(tx.amount), 0);

    // Only alert if exceeded (> 100%)
    if (totalSpent <= budget.amount) continue;

    // Check if we already sent an alert today (avoid spam via Redis)
    const cacheKey = `budget_alert:${budget.id}:${today}`;
    if (getRedisReady()) {
      const alreadySent = await redisClient.get(cacheKey);
      if (alreadySent) continue;
    }

    // Get client settings & email
    const { data: client } = await supabase
      .from('clients')
      .select('email')
      .eq('id', budget.client_id)
      .single();

    if (!client?.email) continue;

    const { data: settings } = await supabase
      .from('client_settings')
      .select('notify_budgets, currency')
      .eq('client_id', budget.client_id)
      .single();

    if (!settings?.notify_budgets) continue;

    // Get category name
    const { data: category } = await supabase
      .from('system_categories')
      .select('name')
      .eq('id', budget.category_id)
      .single();

    const categoryName = category?.name || budget.name || 'Unknown';
    const currencySymbol = getSymbol(settings.currency || 'INR');
    const html = budgetExceededTemplate(categoryName, totalSpent, budget.amount, currencySymbol);

    await sendEmail({
      to: client.email,
      subject: `⚠️ Budget Exceeded: ${categoryName}`,
      html,
    });

    // Mark as sent in Redis (expires at end of day)
    if (getRedisReady()) {
      await redisClient.set(cacheKey, '1', { EX: 86400 });
    }

    logger.info('budget_alert_sent', { budget_id: budget.id, client_id: budget.client_id, spent: totalSpent, limit: budget.amount });
  }
}

// --- Mark Overdue Instances ---

async function markOverdueInstances() {
  const today = new Date().toISOString().split('T')[0];

  const { error } = await supabase
    .from('bill_instances')
    .update({ status: 'overdue' })
    .eq('status', 'upcoming')
    .lt('due_date', today);

  if (error) {
    logger.error('scheduler_overdue_mark_failed', { error: String(error) });
  }
}

// --- Main Scheduler Setup ---

export function startScheduler() {
  // Run every day at 8:00 AM
  cron.schedule('0 8 * * *', async () => {
    logger.info('scheduler_run_started', { time: new Date().toISOString() });

    try {
      await markOverdueInstances();
      await processBillReminders();
      await processRecurringTransactions();
      await processBudgetAlerts();
    } catch (err) {
      logger.error('scheduler_run_error', { error: String(err) });
    }

    logger.info('scheduler_run_completed', { time: new Date().toISOString() });
  });

  logger.info('scheduler_initialized', { schedule: 'daily at 08:00' });
}
