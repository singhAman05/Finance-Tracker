import {supabase} from "../config/supabase"

export type NewTransactionPayload = {
  client_id: string;
  account_id: string;
  category_id: string;
  amount: number;
  date?: string;
  description?: string;
  is_recurring?: boolean;
  recurrence_rule?: "weekly" | "bi-weekly" | "monthly" | "quarterly" | "yearly";
};

export const createTransaction = async (payload: NewTransactionPayload) => {
    const { data, error } = await supabase
        .from("transactions")
        .insert([
        {
            client_id: payload.client_id,
            account_id: payload.account_id,
            category_id: payload.category_id,
            amount: payload.amount,
            date: payload.date || new Date().toISOString().split("T")[0],
            description: payload.description || null,
            is_recurring: payload.is_recurring ?? false,
            recurrence_rule: payload.recurrence_rule || null,
        },
        ])
        .select()
        .single();

    return { data, error };
};

export const fetchTransactions = async(client_id : string)=>{
    const {data, error} = await supabase
    .from('transactions')
    .select()
    .eq('client_id', client_id)

    return {data, error};
}

export const deleteTransaction = async(transaction_id: string)=>{
    const {data, error} = await supabase
    .from('transactions')
    .delete()
    .eq('id', transaction_id)
    .select()
    console.log("Delete transaction result:", {data, error});
    return {data, error};
}