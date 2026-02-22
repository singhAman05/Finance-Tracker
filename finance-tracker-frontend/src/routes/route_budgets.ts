import { apiClient } from "@/utils/Error_handler";

export interface CreateBudgetPayload {
    category_id: string;
    name?: string;
    amount: number;
    period_type: "weekly" | "monthly" | "quarterly" | "yearly" | "custom";
    start_date: string;
    end_date: string;
    notes?: string;
}

export const createBudgetRoute = async (payload: CreateBudgetPayload) => {
    const data = await apiClient<any>("/api/budgets/create-budget", {
        method: "POST",
        body: JSON.stringify(payload),
    });
    return data.result;
};

export const fetchBudgetsRoute = async () => {
    const data = await apiClient<any>("/api/budgets/fetch-budgets", {
        method: "GET",
    });
    return data.result;
};

export const fetchBudgetSummaryRoute = async () => {
    const data = await apiClient<any>("/api/budgets/fetch-budget-summary", {
        method: "GET",
    });
    return data.result;
};

export const updateBudgetRoute = async (budget_id: string, payload: Partial<CreateBudgetPayload>) => {
    const data = await apiClient<any>(`/api/budgets/update-budget/${budget_id}`, {
        method: "PUT",
        body: JSON.stringify(payload),
    });
    return data.result;
};

export const deleteBudgetRoute = async (budget_id: string) => {
    const data = await apiClient<any>(`/api/budgets/delete-budget/${budget_id}`, {
        method: "DELETE",
    });
    return data.result;
};
