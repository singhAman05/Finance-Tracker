import { supabase } from "../config/supabase";
import { createTransaction } from "./service_transactions";

export const creatingAccount = async (account_payload: any) => {
   const {
      client_id,
      bank_name,
      account_type,
      balance,
      currency,
      account_holder_name,
      account_number_last4,
      // Recurring fields (optional)
      is_recurring,
      recurring_amount,
      recurring_type,
      recurring_category_id,
      recurring_day_of_month,
      recurring_frequency,
      recurring_description,
   } = account_payload;

   const { data, error } = await supabase
      .from('accounts')
      .insert({
         client_id,
         account_type: account_type,
         balance: balance ?? 0,
         currency: currency ?? 'INR',
         account_holder_name,
         bank_name,
         account_number_last4,
         // Only persist recurring fields if is_recurring is true
         is_recurring: is_recurring ?? false,
         recurring_amount: is_recurring ? recurring_amount : null,
         recurring_type: is_recurring ? recurring_type : null,
         recurring_category_id: is_recurring ? recurring_category_id : null,
         recurring_day_of_month: is_recurring ? (recurring_day_of_month ?? 1) : null,
         recurring_frequency: is_recurring ? (recurring_frequency ?? 'monthly') : null,
         recurring_description: is_recurring ? recurring_description : null,
      })
      .select()
      .single();

   return { data, error };
};

export const fetchAllaccounts = async (client_id: string) => {
   const { data, error } = await supabase
      .from('accounts')
      .select()
      .eq('client_id', client_id)

   return { data, error };
};

export const deleteAccount = async (account_id: string, client_id: string) => {
   const { data, error } = await supabase
      .from("accounts")
      .delete()
      .eq("id", account_id)
      .eq("client_id", client_id)
      .select()
      .single();
   return { data, error };
};

/* ============================================================
   Recurring Account Processing
   ============================================================
   Finds all accounts with is_recurring = true that are due
   for their period, creates the transaction, updates balance,
   and stamps recurring_last_posted to prevent double-posting.
*/

/** Returns true if 'lastPosted' date is already in the current period */
const alreadyPostedThisPeriod = (lastPosted: string | null, frequency: string): boolean => {
   if (!lastPosted) return false;
   const last = new Date(lastPosted);
   const now = new Date();

   switch (frequency) {
      case 'weekly':
         // Same ISO week number and year
         const getWeek = (d: Date) => {
            const tmp = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
            tmp.setUTCDate(tmp.getUTCDate() + 4 - (tmp.getUTCDay() || 7));
            const yearStart = new Date(Date.UTC(tmp.getUTCFullYear(), 0, 1));
            return Math.ceil((((tmp as any) - (yearStart as any)) / 86400000 + 1) / 7);
         };
         return last.getFullYear() === now.getFullYear() && getWeek(last) === getWeek(now);
      case 'monthly':
         return last.getFullYear() === now.getFullYear() && last.getMonth() === now.getMonth();
      case 'quarterly':
         return last.getFullYear() === now.getFullYear() &&
            Math.floor(last.getMonth() / 3) === Math.floor(now.getMonth() / 3);
      case 'yearly':
         return last.getFullYear() === now.getFullYear();
      default:
         return false;
   }
};

/** Returns true if today's day-of-month >= the configured trigger day */
const isDueToday = (dayOfMonth: number): boolean => {
   return new Date().getDate() >= dayOfMonth;
};

export const processRecurringAccounts = async (client_id: string) => {
   // Fetch all recurring accounts for this client
   const { data: accounts, error: fetchError } = await supabase
      .from('accounts')
      .select('*')
      .eq('client_id', client_id)
      .eq('is_recurring', true)
      .eq('status', 'active');

   if (fetchError) throw new Error(fetchError.message);
   if (!accounts || accounts.length === 0) return { processed: 0 };

   let processed = 0;

   for (const account of accounts) {
      const {
         id: account_id,
         recurring_amount,
         recurring_type,
         recurring_category_id,
         recurring_day_of_month,
         recurring_frequency,
         recurring_description,
         recurring_last_posted,
         balance,
      } = account;

      // Skip if missing required recurring config
      if (!recurring_amount || !recurring_type || !recurring_frequency) continue;

      // Idempotency: skip if already posted this period
      if (alreadyPostedThisPeriod(recurring_last_posted, recurring_frequency)) continue;

      // Skip if today is before the trigger day
      if (!isDueToday(recurring_day_of_month ?? 1)) continue;

      // 1. Create the transaction
      const today = new Date().toISOString().split('T')[0];
      const { data: tx, error: txError } = await createTransaction({
         client_id,
         account_id,
         category_id: recurring_category_id,
         amount: recurring_amount,
         type: recurring_type,
         date: today,
         description: recurring_description || `Auto: ${recurring_frequency} ${recurring_type}`,
         is_recurring: false, // This instance is a materialized transaction, not a new template
      });

      if (txError) {
         console.error(`Failed to create recurring transaction for account ${account_id}:`, txError);
         continue;
      }

      // 2. Update balance
      const newBalance = recurring_type === 'income'
         ? balance + recurring_amount
         : balance - recurring_amount;

      const { error: balanceError } = await supabase
         .from('accounts')
         .update({
            balance: newBalance,
            recurring_last_posted: today,
         })
         .eq('id', account_id);

      if (balanceError) {
         console.error(`Failed to update balance for account ${account_id}:`, balanceError);
         continue;
      }

      processed++;
   }

   return { processed };
};

export const fetchRecurringAccounts = async (client_id: string) => {
   const { data, error } = await supabase
      .from('accounts')
      .select('*')
      .eq('client_id', client_id)
      .eq('is_recurring', true);

   return { data, error };
};
