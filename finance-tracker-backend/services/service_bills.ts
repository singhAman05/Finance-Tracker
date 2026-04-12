import { supabase } from '../config/supabase';
import { createTransaction } from './service_transactions';
import { AppError } from '../utils/AppError';

export type NewBillPayload = {
  client_id: string;
  account_id?: string;
  system_category_id: string;
  name: string;
  amount: number;
  is_recurring?: boolean;
  recurrence_type?: 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  recurrence_interval?: number;
  start_date: string;
  end_date?: string;
  reminder_days_before?: number;
  notes?: string;
};

const calculateNextDueDate = (currentDate: Date, recurrence_type: string, interval: number): Date => {
  const next = new Date(currentDate);
  switch (recurrence_type) {
    case 'weekly':
      next.setDate(next.getDate() + 7 * interval);
      break;
    case 'monthly':
      next.setMonth(next.getMonth() + interval);
      break;
    case 'quarterly':
      next.setMonth(next.getMonth() + 3 * interval);
      break;
    case 'yearly':
      next.setFullYear(next.getFullYear() + interval);
      break;
    default:
      throw new Error('Invalid recurrence type');
  }
  return next;
};

export const createBill = async (payload: NewBillPayload) => {
  const {
    client_id,
    account_id,
    system_category_id,
    name,
    amount,
    is_recurring = false,
    recurrence_type,
    recurrence_interval = 1,
    start_date,
    end_date,
    reminder_days_before = 0,
    notes,
  } = payload;

  const { data: bill, error: billError } = await supabase
    .from('bills')
    .insert({
      client_id,
      account_id: account_id ?? null,
      system_category_id,
      name,
      amount,
      is_recurring,
      recurrence_type: is_recurring ? recurrence_type : null,
      recurrence_interval: is_recurring ? recurrence_interval : null,
      start_date,
      end_date: end_date ?? null,
      reminder_days_before,
      notes: notes ?? null,
    })
    .select()
    .single();

  if (billError) throw new Error(billError.message);

  const { error: instanceError } = await supabase.from('bill_instances').insert({
    bill_id: bill.id,
    client_id,
    due_date: start_date,
    amount,
    status: 'upcoming',
  });

  if (instanceError) throw new Error(instanceError.message);
  return bill;
};

export const fetchBills = async (client_id: string, pagination?: { from: number; to: number }) => {
  let query = supabase
    .from('bills')
    .select('*', { count: 'exact' })
    .eq('client_id', client_id)
    .order('created_at', { ascending: false });

  if (pagination) {
    query = query.range(pagination.from, pagination.to);
  }

  const { data, error, count } = await query;
  if (error) throw new Error(error.message);
  return { data, count: count ?? 0 };
};

export const fetchBillInstances = async (client_id: string, pagination?: { from: number; to: number }) => {
  let query = supabase
    .from('bill_instances')
    .select('*', { count: 'exact' })
    .eq('client_id', client_id)
    .order('due_date', { ascending: true });

  if (pagination) {
    query = query.range(pagination.from, pagination.to);
  }

  const { data, error, count } = await query;
  if (error) throw new Error(error.message);
  return { data, count: count ?? 0 };
};

export const markBillInstanceAsPaid = async (bill_instance_id: string, client_id: string) => {
  // Preferred atomic path using DB RPC.
  const { data: rpcData, error: rpcError } = await supabase.rpc('pay_bill_instance', {
    p_bill_instance_id: bill_instance_id,
    p_client_id: client_id,
  });

  if (!rpcError) {
    return { success: true, data: rpcData };
  }

  // Fallback when RPC is not deployed yet.
  if (!rpcError.message.includes('function')) {
    throw new Error(rpcError.message);
  }

  const { data: instance, error: fetchError } = await supabase
    .from('bill_instances')
    .select('*')
    .eq('id', bill_instance_id)
    .eq('client_id', client_id)
    .single();

  if (fetchError) throw new Error(fetchError.message);
  if (!instance) throw AppError.notFound('Bill instance not found');
  if (instance.status !== 'upcoming') throw AppError.badRequest('Bill already processed');

  const { data: bill, error: billError } = await supabase.from('bills').select('*').eq('id', instance.bill_id).single();
  if (billError) throw new Error(billError.message);
  if (!bill.account_id) throw AppError.badRequest('Bill is not linked to an account');

  const { data: transaction, error: txError } = await createTransaction({
    client_id,
    account_id: bill.account_id,
    category_id: bill.system_category_id,
    amount: instance.amount,
    type: 'expense',
    description: `Bill payment: ${bill.name}`,
  });

  if (txError || !transaction) throw new Error(txError?.message || 'Failed to create transaction');

  const { error: updateError } = await supabase
    .from('bill_instances')
    .update({ status: 'paid', paid_at: new Date().toISOString(), transaction_id: transaction.id })
    .eq('id', bill_instance_id)
    .eq('status', 'upcoming');

  if (updateError) throw new Error(updateError.message);

  if (bill.is_recurring) {
    await generateNextInstance(bill);
  }

  return { success: true };
};

export const generateNextInstance = async (bill: any) => {
  const { data: lastInstance, error } = await supabase
    .from('bill_instances')
    .select('*')
    .eq('bill_id', bill.id)
    .order('due_date', { ascending: false })
    .limit(1)
    .single();

  if (error) throw new Error(error.message);

  const nextDueDate = calculateNextDueDate(new Date(lastInstance.due_date), bill.recurrence_type, bill.recurrence_interval);
  if (bill.end_date && nextDueDate > new Date(bill.end_date)) return;

  const { error: insertError } = await supabase.from('bill_instances').insert({
    bill_id: bill.id,
    client_id: bill.client_id,
    due_date: nextDueDate.toISOString().split('T')[0],
    amount: bill.amount,
    status: 'upcoming',
  });

  if (insertError) throw new Error(insertError.message);
};
