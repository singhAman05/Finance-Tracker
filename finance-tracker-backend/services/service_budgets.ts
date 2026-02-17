import { supabase } from "../config/supabase";

export type NewBudgetPayload = {
    client_id: string;
    category_id: string;
    name?: string;
    amount: number;
    period_type: "weekly" | "monthly" | "quarterly" | "yearly" | "custom";
    start_date: string;
    end_date: string;
    notes?: string;
};

export const createBudget = async (payload: NewBudgetPayload) => {
    const { data, error } = await supabase
        .from("budgets")
        .insert({
            client_id: payload.client_id,
            category_id: payload.category_id,
            name: payload.name ?? null,
            amount: payload.amount,
            period_type: payload.period_type,
            start_date: payload.start_date,
            end_date: payload.end_date,
            notes: payload.notes ?? null,
        })
        .select(`
      id,
      client_id,
      category_id,
      name,
      amount,
      period_type,
      start_date,
      end_date,
      is_active,
      notes,
      created_at
    `)
        .single();

    return { data, error };
};

export const fetchBudgets = async (client_id: string) => {
    const { data, error } = await supabase
        .from("budgets")
        .select(`
      id,
      category_id,
      name,
      amount,
      period_type,
      start_date,
      end_date,
      is_active,
      notes,
      created_at
    `)
        .eq("client_id", client_id)
        .order("start_date", { ascending: false });

    return { data, error };
};

export const deleteBudget = async (
    budget_id: string,
    client_id: string
) => {
    const { data, error } = await supabase
        .from("budgets")
        .delete()
        .eq("id", budget_id)
        .eq("client_id", client_id)
        .select()
        .single();

    return { data, error };
};

export const updateBudget = async (
    budget_id: string,
    client_id: string,
    updates: Partial<Omit<NewBudgetPayload, "client_id">>
) => {
    const { data, error } = await supabase
        .from("budgets")
        .update({
            ...updates,
            updated_at: new Date().toISOString(),
        })
        .eq("id", budget_id)
        .eq("client_id", client_id)
        .select()
        .single();

    return { data, error };
};

export const fetchBudgetSummary = async (client_id: string) => {
    const { data, error } = await supabase.rpc("get_budget_summary", {
        p_client_id: client_id,
    });

    return { data, error };
};
