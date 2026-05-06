import { notify } from "@/lib/notifications";
import { addTransactionRoute, fetchTransactionsRoute, deleteTransactionRoute } from "@/routes/route_transactions";
import type { Transaction, Account } from "@/types/interfaces";

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
    notify.success(result?.message || "Transaction added successfully");
    return result;
};

export const fetchTransactions = async (
    page = 1,
    limit = 20,
    options?: { start_date?: string; end_date?: string }
) => {
    const result = await fetchTransactionsRoute(page, limit, options);
    if (!result || !Array.isArray(result.data)) {
        return { message: result?.message || "", data: [] as Transaction[], pagination: undefined };
    }

    const mappedData = result.data.map((tx: any) => ({
        ...tx,
        amount: Number.isFinite(Number(tx?.amount)) ? Number(tx.amount) : 0,
    })) as Transaction[];

    return { ...result, data: mappedData };
};

export const deleteTransaction = async (transaction_id: string) => {
    const result = await deleteTransactionRoute(transaction_id);
    notify.success(result?.message || "Transaction deleted successfully");
    return result;
};

function percentageChange(current: number, previous: number): number | null {
    if (previous === 0) return null;
    return ((current - previous) / Math.abs(previous)) * 100;
}

export function getTransactionStats(
    transactions: Transaction[],
    accounts: Account[]
) {
    const getMonthKey = (date: string | Date): string => {
        const d = date instanceof Date ? date : new Date(date);
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    };

    const now = new Date();
    const currentMonthKey = getMonthKey(now);
    const prevDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const prevMonthKey = getMonthKey(prevDate);

    let income = 0;
    let expense = 0;
    let currentIncome = 0;
    let currentExpense = 0;
    let prevIncome = 0;
    let prevExpense = 0;

    transactions.forEach((tx) => {
        const key = getMonthKey(tx.date as string | Date);
        const amt = Math.abs(tx.amount);
        if (tx.type === "income") {
            income += amt;
            if (key === currentMonthKey) currentIncome += amt;
            if (key === prevMonthKey) prevIncome += amt;
        } else {
            expense += amt;
            if (key === currentMonthKey) currentExpense += amt;
            if (key === prevMonthKey) prevExpense += amt;
        }
    });

    // Net flow for the currently viewed list
    const net = income - expense;
    // Month-over-month growth should compare current month net flow vs previous month net flow
    const currentMonthNet = currentIncome - currentExpense;
    const prevNet = prevIncome - prevExpense;
    const growthPercent = percentageChange(currentMonthNet, prevNet);

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
        growthPercent:
            growthPercent !== null ? Number(growthPercent.toFixed(2)) : null,
        trend,
    };
}

export function getFinancialHealth(transactions: Transaction[], accounts: Account[]) {
    const getMonthKey = (date: string | Date): string => {
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
        const key = getMonthKey(tx.date as string | Date);
        const amt = Math.abs(tx.amount);
        if (key === currentMonthKey) {
            if (tx.type === "income") currentIncome += amt;
            else currentExpense += amt;
        } else if (key === prevMonthKey) {
            if (tx.type === "income") prevIncome += amt;
            else prevExpense += amt;
        }
    });

    const totalBalances = accounts.reduce((sum, acc) => sum + (acc.balance || 0), 0);
    // Accounts balance already reflects posted transactions, so net worth = current balances.
    const netWorth = totalBalances;
    const cashFlow = currentIncome - currentExpense;
    const prevCashFlow = prevIncome - prevExpense;

    // Percent changes — use null check (not truthy) so 0% growth is preserved
    const incomeGrowth = percentageChange(currentIncome, prevIncome);
    const expenseGrowth = percentageChange(currentExpense, prevExpense);

    // Net worth trend proxy: compare this month's net movement to previous month's net movement.
    // This is based on previous-month transaction data (not just current-month reconstructed balance).
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
