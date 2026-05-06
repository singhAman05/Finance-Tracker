import { supabase } from "../config/supabase"

export type NewTransactionPayload = {
  client_id: string;
  account_id: string;
  category_id: string;
  amount: number;
  type: string;
  date?: string;
  description?: string;
  is_recurring?: boolean;
  recurrence_rule?: "weekly" | "bi-weekly" | "monthly" | "quarterly" | "yearly";
};

// --- #11: Create transaction AND update account balance atomically ---
export const createTransaction = async (payload: NewTransactionPayload) => {
    const { data, error } = await supabase
        .from("transactions")
        .insert([
        {
            client_id: payload.client_id,
            account_id: payload.account_id,
            category_id: payload.category_id,
            amount: payload.amount,
            type: payload.type,
            date: payload.date || new Date().toISOString().split("T")[0],
            description: payload.description || null,
            is_recurring: payload.is_recurring ?? false,
            recurrence_rule: payload.recurrence_rule || null,
        },
        ])
        .select()
        .single();

    if (error) return { data, error };

    // Update account balance atomically via RPC
    const balanceChange = payload.type === 'income' ? payload.amount : -payload.amount;
    const { error: balanceError } = await supabase.rpc('adjust_account_balance', {
        p_account_id: payload.account_id,
        p_amount: balanceChange,
    });

    if (balanceError) {
        // Compensate: remove the inserted transaction
        await supabase.from("transactions").delete().eq("id", data.id);
        return { data: null, error: balanceError };
    }

    return { data, error: null };
};

export const fetchTransactions = async (
    client_id: string,
    pagination?: { from: number; to: number },
    dateRange?: { start_date?: string; end_date?: string }
) => {
    let query = supabase
        .from('transactions')
        .select('*', { count: 'exact' })
        .eq('client_id', client_id)
        .order('date', { ascending: false })
        .order('created_at', { ascending: false });

    if (dateRange?.start_date) {
        query = query.gte('date', dateRange.start_date);
    }
    if (dateRange?.end_date) {
        query = query.lte('date', dateRange.end_date);
    }

    if (pagination) {
        query = query.range(pagination.from, pagination.to);
    }

    const { data, error, count } = await query;
    return { data, error, count: count ?? 0 };
}

// --- #13: Delete transaction AND reverse balance change ---
export const deleteTransaction = async (transaction_id: string, client_id: string) => {
    // First, fetch the transaction to know the amount and type
    const { data: tx, error: fetchError } = await supabase
        .from("transactions")
        .select("*")
        .eq("id", transaction_id)
        .eq("client_id", client_id)
        .single();

    if (fetchError || !tx) {
        return { data: null, error: fetchError || { message: "Transaction not found" } };
    }

    // Reverse the balance change first via atomic RPC
    const balanceReversal = tx.type === 'income' ? -tx.amount : tx.amount;
    const { error: balanceError } = await supabase.rpc('adjust_account_balance', {
        p_account_id: tx.account_id,
        p_amount: balanceReversal,
    });

    if (balanceError) {
        return { data: null, error: balanceError };
    }

    // Delete the transaction after successful balance reversal
    const { data, error } = await supabase
        .from("transactions")
        .delete()
        .eq("id", transaction_id)
        .eq("client_id", client_id)
        .select()
        .single();

    if (error) {
        // Best-effort compensation: re-apply removed balance effect
        const compensation = -balanceReversal;
        await supabase.rpc('adjust_account_balance', {
            p_account_id: tx.account_id,
            p_amount: compensation,
        });
        return { data, error };
    }

    return { data, error: null };
};
