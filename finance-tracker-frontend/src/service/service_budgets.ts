import { notify } from "@/lib/notifications";
import {
    createBudgetRoute,
    fetchBudgetsRoute,
    fetchBudgetSummaryRoute,
    updateBudgetRoute,
    deleteBudgetRoute,
    CreateBudgetPayload,
} from "@/routes/route_budgets";

export type { CreateBudgetPayload };

export const createBudget = async (payload: CreateBudgetPayload) => {
    const result = await createBudgetRoute(payload);
    if (result) {
        notify.success(result.message || "Budget created successfully");
    }
    return result;
};

export const fetchBudgets = async () => {
    const result = await fetchBudgetsRoute();
    return result;
};

export const fetchBudgetSummary = async () => {
    const result = await fetchBudgetSummaryRoute();
    return result;
};

export const updateBudget = async (budget_id: string, payload: Partial<CreateBudgetPayload>) => {
    const result = await updateBudgetRoute(budget_id, payload);
    if (result) {
        notify.success(result.message || "Budget updated successfully");
    }
    return result;
};

export const deleteBudget = async (budget_id: string) => {
    const result = await deleteBudgetRoute(budget_id);
    if (result) {
        notify.success(result.message || "Budget deleted successfully");
    }
    return result;
};
