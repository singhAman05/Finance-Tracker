import { apiClient } from "@/utils/Error_handler";
import type { Budget, BudgetSummary } from "@/components/redux/slices/slice_budgets";

interface BudgetResponse {
    message: string;
    data: Budget;
}

interface BudgetsListResponse {
    message: string;
    data: Budget[];
    pagination?: { page: number; limit: number; total: number; pages: number; };
}

interface BudgetSummaryListResponse {
    message: string;
    data: BudgetSummary[];
}

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
    const data = await apiClient<BudgetResponse>("/api/budgets/create-budget", {
        method: "POST",
        body: JSON.stringify(payload),
    });
    if (data.error) throw new Error(data.error.message);
    return data.result;
};

export const fetchBudgetsRoute = async () => {
    const data = await apiClient<BudgetsListResponse>("/api/budgets/fetch-budgets", {
        method: "GET",
    });
    if (data.error) throw new Error(data.error.message);
    return data.result;
};

export const fetchBudgetSummaryRoute = async () => {
    const data = await apiClient<BudgetSummaryListResponse>("/api/budgets/fetch-budget-summary", {
        method: "GET",
    });
    if (data.error) throw new Error(data.error.message);
    return data.result;
};

export const updateBudgetRoute = async (budget_id: string, payload: Partial<CreateBudgetPayload>) => {
    const data = await apiClient<BudgetResponse>(`/api/budgets/update-budget/${budget_id}`, {
        method: "PUT",
        body: JSON.stringify(payload),
    });
    if (data.error) throw new Error(data.error.message);
    return data.result;
};

export const deleteBudgetRoute = async (budget_id: string) => {
    const data = await apiClient<{ message: string }>(`/api/budgets/delete-budget/${budget_id}`, {
        method: "DELETE",
    });
    if (data.error) throw new Error(data.error.message);
    return data.result;
};

export const expireBudgetRoute = async (budget_id: string) => {
    const data = await apiClient<{ message: string }>(`/api/budgets/expire-budget/${budget_id}`, {
        method: "PUT",
    });
    if (data.error) throw new Error(data.error.message);
    return data.result;
};
