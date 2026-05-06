import { supabase } from '../config/supabase';

export interface ClientSettings {
  currency: string;
  date_format: string;
  notify_bills: boolean;
  notify_budgets: boolean;
  notify_recurring: boolean;
}

const defaultSettings: ClientSettings = {
  currency: 'INR',
  date_format: 'DD/MM/YYYY',
  notify_bills: true,
  notify_budgets: true,
  notify_recurring: true,
};

export const getSettingsService = async (client_id: string): Promise<ClientSettings> => {
  const { data, error } = await supabase
    .from('client_settings')
    .select('currency, date_format, notify_bills, notify_budgets, notify_recurring')
    .eq('client_id', client_id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return defaultSettings;
    throw error;
  }

  return data;
};

export const updateSettingsService = async (
  client_id: string,
  settings: Partial<ClientSettings>
): Promise<ClientSettings> => {
  // Fetch current settings to avoid overwriting unrelated fields with defaults
  const current = await getSettingsService(client_id);
  const payload = { ...current, ...settings, client_id };

  const { data, error } = await supabase
    .from('client_settings')
    .upsert(payload, { onConflict: 'client_id' })
    .select('currency, date_format, notify_bills, notify_budgets, notify_recurring')
    .single();

  if (error) throw error;
  return data;
};

export const exportUserDataService = async (client_id: string) => {
  const [accountsRes, transactionsRes, billsRes, billInstancesRes, budgetsRes, settings] = await Promise.all([
    supabase.from('accounts').select('*').eq('client_id', client_id),
    supabase.from('transactions').select('*').eq('client_id', client_id),
    supabase.from('bills').select('*').eq('client_id', client_id),
    supabase.from('bill_instances').select('*').eq('client_id', client_id),
    supabase.from('budgets').select('*').eq('client_id', client_id),
    getSettingsService(client_id),
  ]);

  const responses = [accountsRes, transactionsRes, billsRes, billInstancesRes, budgetsRes];
  const failed = responses.find((r) => r.error);
  if (failed?.error) throw failed.error;

  return {
    exported_at: new Date().toISOString(),
    accounts: accountsRes.data ?? [],
    transactions: transactionsRes.data ?? [],
    bills: billsRes.data ?? [],
    bill_instances: billInstancesRes.data ?? [],
    budgets: budgetsRes.data ?? [],
    categories: [],
    settings,
  };
};

export const clearHistoryService = async (client_id: string) => {
  const { data, error } = await supabase.rpc('clear_client_history', { p_client_id: client_id });

  if (error) {
    throw error;
  }

  return { deleted: data };
};
