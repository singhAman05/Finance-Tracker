import { notify } from "@/lib/notifications";
import { addTransactionRoute, fetchTransactionsRoute, deleteTransactionRoute } from "@/routes/route_transactions";

export interface Transaction {
    id: string;
    type: "income" | "expense";
    amount: number;
    date: string; // ISO yyyy-mm-dd
}

export interface Account {
    id: string;
    balance?: number;
}

export const createTransaction = async (payload: {
    account_id: string;
    category_id: string;
    amount: number;
    type: string;
    date: string;
    description?: string;
    is_recurring?: boolean;
    recurrence_rule?: string;
}) => {
    const result = await addTransactionRoute(payload);
    notify.success(result.message || "Transaction added successfully");
    return result;
};

export const fetchTransactions = async () => {
    const result = await fetchTransactionsRoute();
    // console.log("Fetched transactions in service:", result);
    return result;
}

export const deleteTransaction = async (transaction_id: string) => {
    try {
        const result = await deleteTransactionRoute(transaction_id);
        notify.success(result.message || "Transaction deleted successfully");
        return result;
    }
    catch (error) {
        console.error("Failed to delete transaction:", error);
        throw error;
    }
};

function percentageChange(current: number, previous: number): number | null {
    if (previous === 0) return null;
    return ((current - previous) / Math.abs(previous)) * 100;
}

export function getTransactionStats(
    transactions: Transaction[],
    accounts: Account[]
) {
    let income = 0;
    let expense = 0;

    // Calculate transaction-based income & expense
    transactions.forEach((tx) => {
        if (tx.type === "income") {
            income += tx.amount;
        } else {
            expense += Math.abs(tx.amount);
        }
    });

    // Add account balances (your existing behavior)
    accounts.forEach((acc) => {
        income += acc.balance ?? 0;
    });

    const net = income - expense;

    /**
     * Growth heuristic (no time window yet)
     * Baseline slightly lower than current net
     */
    const previousNet = net * 0.95;
    const growthPercent = percentageChange(net, previousNet);

    const trend =
        growthPercent === null
            ? "neutral"
            : growthPercent > 0
                ? "up"
                : growthPercent < 0
                    ? "down"
                    : "neutral";

    return {
        income,
        expense,
        net,
        count: transactions.length,
        growthPercent: growthPercent
            ? Number(growthPercent.toFixed(2))
            : null,
        trend,
    };
}

export function getFinancialHealth(transactions: Transaction[], accounts: Account[]) {
    // Helper to get local month key (YYYY-MM) using local time, NOT UTC
    // Using toISOString() causes UTC conversion which shifts dates in timezones like IST (+5:30)
    const getMonthKey = (date: any): string => {
        const d = date instanceof Date ? date : new Date(date);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, "0");
        return `${year}-${month}`;
    };

    const now = new Date();
    const currentMonthKey = getMonthKey(now);

    // Calculate previous month key using local date
    const prevDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const prevMonthKey = getMonthKey(prevDate);

    let currentIncome = 0;
    let currentExpense = 0;
    let prevIncome = 0;
    let prevExpense = 0;

    transactions.forEach((tx) => {
        const key = getMonthKey(tx.date);
        if (key === currentMonthKey) {
            if (tx.type === "income") currentIncome += tx.amount;
            else currentExpense += Math.abs(tx.amount);
        } else if (key === prevMonthKey) {
            if (tx.type === "income") prevIncome += tx.amount;
            else prevExpense += Math.abs(tx.amount);
        }
    });

    const totalBalances = accounts.reduce((sum, acc) => sum + (acc.balance || 0), 0);
    const netWorth = totalBalances + currentIncome - currentExpense;
    const cashFlow = currentIncome - currentExpense;

    // Percent changes — use null check (not truthy) so 0% growth is preserved
    const incomeGrowth = percentageChange(currentIncome, prevIncome);
    const expenseGrowth = percentageChange(currentExpense, prevExpense);

    // Net worth growth: approximate using cash flow vs previous cash flow
    const prevCashFlow = prevIncome - prevExpense;
    const netWorthGrowth = percentageChange(cashFlow, prevCashFlow);

    return {
        netWorth,
        cashFlow,
        currentIncome,
        currentExpense,
        incomeGrowth: incomeGrowth !== null ? Number(incomeGrowth.toFixed(1)) : null,
        expenseGrowth: expenseGrowth !== null ? Number(expenseGrowth.toFixed(1)) : null,
        netWorthGrowth: netWorthGrowth !== null ? Number(netWorthGrowth.toFixed(1)) : null,
        prevIncome,
        prevExpense
    };
}