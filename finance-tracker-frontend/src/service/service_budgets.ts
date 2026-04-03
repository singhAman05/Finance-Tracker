import { notify } from "@/lib/notifications";
import {
    createBudgetRoute,
    fetchBudgetsRoute,
    fetchBudgetSummaryRoute,
    updateBudgetRoute,
    deleteBudgetRoute,
    expireBudgetRoute,
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
    if (result?.data && Array.isArray(result.data)) {
        result.data = result.data.map((s: any) => ({
            ...s,
            budget_amount: Number(s.budget_amount) || 0,
            total_spent: Number(s.total_spent) || 0,
            remaining: Number(s.remaining) || 0,
            percentage_used: Number(s.percentage_used) || 0,
            is_active: Boolean(s.is_active),
            budget_name: s.budget_name || null,
            period_type: s.period_type || "monthly",
        }));
    }
    return result;
};

export const calculateBudgetSummaryStats = (summary: any[]) => {
    if (!Array.isArray(summary)) return {
        totalBudget: 0,
        totalSpent: 0,
        overallPercentage: 0,
        healthyCount: 0,
        warningCount: 0,
        exceededCount: 0
    };

    const activeSummaries = summary.filter((s) => Boolean(s.is_active));

    const totalBudget = activeSummaries.reduce((acc, curr) => acc + (Number(curr.budget_amount) || 0), 0);
    const totalSpent = activeSummaries.reduce((acc, curr) => acc + (Number(curr.total_spent) || 0), 0);
    const overallPercentage = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

    const healthyCount = activeSummaries.filter(s => (Number(s.percentage_used) || 0) < 90).length;
    const warningCount = activeSummaries.filter(s => (Number(s.percentage_used) || 0) >= 90 && (Number(s.percentage_used) || 0) < 100).length;
    const exceededCount = activeSummaries.filter(s => (Number(s.percentage_used) || 0) >= 100).length;

    return {
        totalBudget,
        totalSpent,
        overallPercentage,
        healthyCount,
        warningCount,
        exceededCount
    };
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

export const expireBudget = async (budget_id: string) => {
    const result = await expireBudgetRoute(budget_id);
    if (result) {
        notify.success(result.message || "Budget ended early");
    }
    return result;
};
