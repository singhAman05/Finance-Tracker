import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface Budget {
    id: string;
    category_id: string;
    name: string | null;
    amount: number;
    period_type: "weekly" | "monthly" | "quarterly" | "yearly" | "custom";
    start_date: string;
    end_date: string;
    is_active: boolean;
    notes: string | null;
    created_at: string;
}

export interface BudgetSummary {
    category_id: string;
    category_name: string;
    category_color?: string;
    budget_id: string;
    budget_amount: number;
    spent_amount: number;
    remaining_amount: number;
    percentage_used: number;
}

interface BudgetState {
    budgets: Budget[];
    summary: BudgetSummary[];
    loading: boolean;
    error: string | null;
}

const initialState: BudgetState = {
    budgets: [],
    summary: [],
    loading: false,
    error: null,
};

const budgetSlice = createSlice({
    name: "budgets",
    initialState,
    reducers: {
        setBudgets: (state, action: PayloadAction<Budget[]>) => {
            state.budgets = action.payload;
            state.loading = false;
            state.error = null;
        },
        addBudget: (state, action: PayloadAction<Budget>) => {
            state.budgets.unshift(action.payload);
        },
        updateBudgetSlice: (state, action: PayloadAction<Budget>) => {
            const index = state.budgets.findIndex((b) => b.id === action.payload.id);
            if (index !== -1) {
                state.budgets[index] = action.payload;
            }
        },
        removeBudget: (state, action: PayloadAction<string>) => {
            state.budgets = state.budgets.filter((b) => b.id !== action.payload);
        },
        setSummary: (state, action: PayloadAction<BudgetSummary[]>) => {
            state.summary = action.payload;
        },
        setLoading: (state, action: PayloadAction<boolean>) => {
            state.loading = action.payload;
        },
        setError: (state, action: PayloadAction<string | null>) => {
            state.error = action.payload;
            state.loading = false;
        },
    },
});

export const {
    setBudgets,
    addBudget,
    updateBudgetSlice,
    removeBudget,
    setSummary,
    setLoading,
    setError,
} = budgetSlice.actions;

export default budgetSlice.reducer;
