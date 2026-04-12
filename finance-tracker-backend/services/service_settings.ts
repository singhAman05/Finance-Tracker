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
  const payload = { ...defaultSettings, ...settings, client_id };

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

  if (!error) {
    return { deleted: data };
  }

  // Fallback for environments where RPC has not been applied yet.
  const { data: txData, error: txFetchError } = await supabase
    .from('transactions')
    .select('account_id, amount, type')
    .eq('client_id', client_id);

  if (txFetchError) throw txFetchError;

  const accountDelta = new Map<string, number>();
  (txData ?? []).forEach((tx: { account_id: string; amount: number; type: string }) => {
    const delta = tx.type === 'income' ? Number(tx.amount) : -Number(tx.amount);
    accountDelta.set(tx.account_id, (accountDelta.get(tx.account_id) ?? 0) + delta);
  });

  for (const [accountId, delta] of accountDelta.entries()) {
    if (!delta) continue;
    const { error: rpcError } = await supabase.rpc('adjust_account_balance', {
      p_account_id: accountId,
      p_amount: -delta,
    });
    if (rpcError) throw rpcError;
  }

  const { data: deletedInstances, error: instError } = await supabase
    .from('bill_instances')
    .delete()
    .eq('client_id', client_id)
    .select('id');
  if (instError) throw instError;

  const { data: deletedBills, error: billsError } = await supabase
    .from('bills')
    .delete()
    .eq('client_id', client_id)
    .select('id');
  if (billsError) throw billsError;

  const { data: deletedTx, error: delTxError } = await supabase
    .from('transactions')
    .delete()
    .eq('client_id', client_id)
    .select('id');
  if (delTxError) throw delTxError;

  return {
    deleted: {
      transactions: deletedTx?.length ?? 0,
      bills: deletedBills?.length ?? 0,
      bill_instances: deletedInstances?.length ?? 0,
    },
  };
};
