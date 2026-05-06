"use client";

import type { Account, BillInstance, Category, Transaction } from "@/types/interfaces";
import type { BudgetSummary } from "@/components/redux/slices/slice_budgets";

export type ReportPeriod =
  | "thisMonth"
  | "lastMonth"
  | "last3Months"
  | "last6Months"
  | "allTime"
  | "custom";

export interface KpiSummary {
  totalBalance: number;
  totalIncome: number;
  totalExpenses: number;
  netCashFlow: number;
  savingsRate: number | null;
  burnRateWeekly: number;
  runwayDays: number | null;
  netTrendPercent: number | null;
}

export interface MonthlyInsight {
  month: string;
  income: number;
  expenses: number;
  net: number;
}

export interface CategoryInsight {
  [key: string]: string | number;
  id: string;
  name: string;
  color: string;
  income: number;
  expenses: number;
  net: number;
  txCount: number;
  shareOfExpense: number;
}

export interface AccountInsight {
  [key: string]: string | number;
  id: string;
  name: string;
  bankName: string;
  balance: number;
  income: number;
  expenses: number;
  net: number;
  txCount: number;
}

export interface BudgetInsight extends BudgetSummary {
  health: "healthy" | "warning" | "exceeded";
}

export interface ForecastPoint {
  date: string;
  projectedBalance: number;
  projectedIncome: number;
  projectedExpense: number;
  dueBillsTotal: number;
  confidence: "high" | "medium" | "low";
}

const toNumber = (value: unknown): number => {
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? n : 0;
};

const toDate = (value: unknown): Date | null => {
  if (!value) return null;
  const d = value instanceof Date ? value : new Date(String(value));
  return Number.isNaN(d.getTime()) ? null : d;
};

const getMonthKey = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

const monthStart = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1);

const percentageChange = (current: number, previous: number): number | null => {
  if (previous === 0) return null;
  return ((current - previous) / Math.abs(previous)) * 100;
};

/**
 * Compute ISO date strings (YYYY-MM-DD) for a report period.
 * Returns undefined values for "allTime".
 */
export const getDateRangeForPeriod = (
  period: ReportPeriod,
  customStart?: string,
  customEnd?: string
): { start_date?: string; end_date?: string } => {
  const now = new Date();
  const refMonthStart = monthStart(now);

  let start: Date | undefined;
  let end: Date | undefined;

  if (period === "thisMonth") {
    start = refMonthStart;
    end = new Date(now.getFullYear(), now.getMonth() + 1, 0); // last day of month
  } else if (period === "lastMonth") {
    start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    end = new Date(now.getFullYear(), now.getMonth(), 0); // last day of prev month
  } else if (period === "last3Months") {
    start = new Date(now.getFullYear(), now.getMonth() - 2, 1);
    end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  } else if (period === "last6Months") {
    start = new Date(now.getFullYear(), now.getMonth() - 5, 1);
    end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  } else if (period === "custom") {
    return { start_date: customStart, end_date: customEnd };
  } else {
    // allTime
    return {};
  }

  const fmt = (d: Date) => d.toISOString().slice(0, 10);
  return { start_date: fmt(start!), end_date: fmt(end!) };
};

export const filterTransactionsByPeriod = (
  transactions: Transaction[],
  period: ReportPeriod,
  customStart?: string,
  customEnd?: string,
  referenceDate: Date = new Date()
) => {
  const ref = new Date(referenceDate);
  const refMonthStart = monthStart(ref);

  let start: Date | null = null;
  let end: Date | null = null;

  if (period === "thisMonth") {
    start = refMonthStart;
    end = new Date(ref.getFullYear(), ref.getMonth() + 1, 1);
  } else if (period === "lastMonth") {
    start = new Date(ref.getFullYear(), ref.getMonth() - 1, 1);
    end = refMonthStart;
  } else if (period === "last3Months") {
    start = new Date(ref.getFullYear(), ref.getMonth() - 2, 1);
    end = new Date(ref.getFullYear(), ref.getMonth() + 1, 1);
  } else if (period === "last6Months") {
    start = new Date(ref.getFullYear(), ref.getMonth() - 5, 1);
    end = new Date(ref.getFullYear(), ref.getMonth() + 1, 1);
  } else if (period === "custom") {
    start = customStart ? toDate(customStart) : null;
    end = customEnd ? toDate(customEnd) : null;
    if (end) end = new Date(end.getFullYear(), end.getMonth(), end.getDate() + 1);
  }

  if (period === "allTime") return transactions.slice();

  return transactions.filter((tx) => {
    const d = toDate(tx.date);
    if (!d) return false;
    if (start && d < start) return false;
    if (end && d >= end) return false;
    return true;
  });
};

export const aggregateTransactions = (transactions: Transaction[]) => {
  const categoryMap: Record<string, { income: number; expenses: number; count: number }> = {};
  const accountMap: Record<string, { income: number; expenses: number; count: number }> = {};
  const monthlyMap: Record<string, { income: number; expenses: number }> = {};

  for (const tx of transactions) {
    const d = toDate(tx.date);
    if (!d) continue;
    const amount = toNumber(tx.amount);
    const isIncome = tx.type === "income";
    const monthKey = getMonthKey(d);

    if (!monthlyMap[monthKey]) monthlyMap[monthKey] = { income: 0, expenses: 0 };
    if (isIncome) monthlyMap[monthKey].income += amount;
    else monthlyMap[monthKey].expenses += amount;

    const categoryId = tx.category_id || "unknown-category";
    if (!categoryMap[categoryId]) categoryMap[categoryId] = { income: 0, expenses: 0, count: 0 };
    if (isIncome) categoryMap[categoryId].income += amount;
    else categoryMap[categoryId].expenses += amount;
    categoryMap[categoryId].count += 1;

    const accountId = tx.account_id || "unknown-account";
    if (!accountMap[accountId]) accountMap[accountId] = { income: 0, expenses: 0, count: 0 };
    if (isIncome) accountMap[accountId].income += amount;
    else accountMap[accountId].expenses += amount;
    accountMap[accountId].count += 1;
  }

  return { categoryMap, accountMap, monthlyMap };
};

export const getMonthlyInsights = (transactions: Transaction[]): MonthlyInsight[] => {
  const { monthlyMap } = aggregateTransactions(transactions);
  return Object.entries(monthlyMap)
    .map(([monthKey, values]) => {
      const [year, month] = monthKey.split("-").map((x) => Number(x));
      const date = new Date(year, month - 1, 1);
      return {
        sortKey: monthKey,
        month: date.toLocaleString("default", { month: "short", year: "numeric" }),
        income: values.income,
        expenses: values.expenses,
        net: values.income - values.expenses,
      };
    })
    .sort((a, b) => a.sortKey.localeCompare(b.sortKey))
    .map(({ sortKey, ...rest }) => rest);
};

export const getCategoryInsights = (
  categories: Category[],
  transactions: Transaction[]
): CategoryInsight[] => {
  const { categoryMap } = aggregateTransactions(transactions);
  const totalExpenses = Object.values(categoryMap).reduce((sum, c) => sum + c.expenses, 0);
  const lookup = categories.reduce((map, cat) => {
    map[cat.id] = cat;
    return map;
  }, {} as Record<string, Category>);

  return Object.entries(categoryMap)
    .map(([id, stats]) => {
      const cat = lookup[id];
      const expenses = stats.expenses;
      return {
        id,
        name: cat?.name || "Unknown Category",
        color: cat?.color || "#94a3b8",
        income: stats.income,
        expenses,
        net: stats.income - stats.expenses,
        txCount: stats.count,
        shareOfExpense: totalExpenses > 0 ? (expenses / totalExpenses) * 100 : 0,
      };
    })
    .sort((a, b) => b.expenses - a.expenses);
};

export const getAccountInsights = (
  accounts: Account[],
  transactions: Transaction[]
): AccountInsight[] => {
  const { accountMap } = aggregateTransactions(transactions);
  const lookup = accounts.reduce((map, acc) => {
    map[acc.id] = acc;
    return map;
  }, {} as Record<string, Account>);

  return Object.entries(accountMap)
    .map(([id, stats]) => {
      const acc = lookup[id];
      return {
        id,
        name: acc?.name || "Unknown Account",
        bankName: acc?.bankName || "Unknown Bank",
        balance: toNumber(acc?.balance),
        income: stats.income,
        expenses: stats.expenses,
        net: stats.income - stats.expenses,
        txCount: stats.count,
      };
    })
    .sort((a, b) => b.balance - a.balance);
};

export const getBudgetInsights = (budgetSummary: BudgetSummary[]): BudgetInsight[] =>
  (budgetSummary || [])
    .map((b) => {
      const usage = toNumber(b.percentage_used);
      let health: BudgetInsight["health"] = "healthy";
      if (usage >= 100) health = "exceeded";
      else if (usage >= 90) health = "warning";
      return { ...b, health };
    })
    .sort((a, b) => Number(b.is_active) - Number(a.is_active) || b.percentage_used - a.percentage_used);

export const calculateKpis = (
  accounts: Account[],
  allTransactions: Transaction[],
  periodTransactions: Transaction[],
  referenceDate: Date = new Date()
): KpiSummary => {
  const totalBalance = accounts.reduce((sum, acc) => sum + toNumber(acc.balance), 0);

  const totalIncome = periodTransactions
    .filter((tx) => tx.type === "income")
    .reduce((sum, tx) => sum + toNumber(tx.amount), 0);
  const totalExpenses = periodTransactions
    .filter((tx) => tx.type !== "income")
    .reduce((sum, tx) => sum + toNumber(tx.amount), 0);
  const netCashFlow = totalIncome - totalExpenses;
  const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome) * 100 : null;

  const last30Start = new Date(referenceDate);
  last30Start.setDate(last30Start.getDate() - 30);
  const last30Expense = allTransactions.reduce((sum, tx) => {
    const d = toDate(tx.date);
    if (!d || d < last30Start || tx.type === "income") return sum;
    return sum + toNumber(tx.amount);
  }, 0);
  const burnRateWeekly = (last30Expense / 30) * 7;
  const runwayDays = burnRateWeekly > 0 ? totalBalance / (burnRateWeekly / 7) : null;

  const thisMonthTx = filterTransactionsByPeriod(allTransactions, "thisMonth", undefined, undefined, referenceDate);
  const prevMonthTx = filterTransactionsByPeriod(allTransactions, "lastMonth", undefined, undefined, referenceDate);
  const currentMonthNet =
    thisMonthTx.filter((t) => t.type === "income").reduce((s, t) => s + toNumber(t.amount), 0) -
    thisMonthTx.filter((t) => t.type !== "income").reduce((s, t) => s + toNumber(t.amount), 0);
  const previousMonthNet =
    prevMonthTx.filter((t) => t.type === "income").reduce((s, t) => s + toNumber(t.amount), 0) -
    prevMonthTx.filter((t) => t.type !== "income").reduce((s, t) => s + toNumber(t.amount), 0);

  const netTrendPercent = percentageChange(currentMonthNet, previousMonthNet);

  return {
    totalBalance,
    totalIncome,
    totalExpenses,
    netCashFlow,
    savingsRate: savingsRate !== null ? Number(savingsRate.toFixed(1)) : null,
    burnRateWeekly: Number(burnRateWeekly.toFixed(2)),
    runwayDays: runwayDays !== null ? Number(runwayDays.toFixed(0)) : null,
    netTrendPercent: netTrendPercent !== null ? Number(netTrendPercent.toFixed(1)) : null,
  };
};

export const getDailyCumulativeFlow = (
  transactions: Transaction[],
  targetDate: Date = new Date()
) => {
  const year = targetDate.getFullYear();
  const month = targetDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const daily = Array.from({ length: daysInMonth }, (_, i) => ({
    date: new Date(year, month, i + 1).toLocaleDateString("default", { day: "numeric", month: "short" }),
    cumulative: 0,
    income: 0,
    expenses: 0,
  }));

  transactions.forEach((tx) => {
    const d = toDate(tx.date);
    if (!d || d.getFullYear() !== year || d.getMonth() !== month) return;
    const idx = d.getDate() - 1;
    const amount = toNumber(tx.amount);
    if (tx.type === "income") daily[idx].income += amount;
    else daily[idx].expenses += amount;
  });

  let running = 0;
  daily.forEach((row) => {
    running += row.income - row.expenses;
    row.cumulative = running;
  });

  return daily;
};

export const getForecast = (
  accounts: Account[],
  transactions: Transaction[],
  billInstances: BillInstance[],
  horizonDays: number = 60,
  referenceDate: Date = new Date()
): ForecastPoint[] => {
  const now = new Date(referenceDate);
  const startBalance = accounts.reduce((sum, acc) => sum + toNumber(acc.balance), 0);

  const historyStart = new Date(now);
  historyStart.setDate(historyStart.getDate() - 90);

  let historyIncome = 0;
  let historyExpense = 0;
  transactions.forEach((tx) => {
    const d = toDate(tx.date);
    if (!d || d < historyStart || d > now) return;
    const amount = toNumber(tx.amount);
    if (tx.type === "income") historyIncome += amount;
    else historyExpense += amount;
  });
  const avgDailyIncome = historyIncome / 90;
  const avgDailyExpense = historyExpense / 90;

  const billsByDate = billInstances.reduce((map, bill) => {
    if (bill.status === "paid") return map;
    const key = String(bill.due_date).slice(0, 10);
    map[key] = (map[key] || 0) + toNumber(bill.amount);
    return map;
  }, {} as Record<string, number>);

  let balance = startBalance;
  const points: ForecastPoint[] = [
    {
      date: now.toISOString().slice(0, 10),
      projectedBalance: Number(balance.toFixed(2)),
      projectedIncome: 0,
      projectedExpense: 0,
      dueBillsTotal: 0,
      confidence: "high",
    },
  ];

  for (let i = 1; i <= horizonDays; i += 1) {
    const d = new Date(now);
    d.setDate(now.getDate() + i);
    const key = d.toISOString().slice(0, 10);
    const dueBillsTotal = billsByDate[key] || 0;
    const projectedIncome = avgDailyIncome;
    const projectedExpense = avgDailyExpense + dueBillsTotal;
    balance += projectedIncome - projectedExpense;

    points.push({
      date: key,
      projectedBalance: Number(balance.toFixed(2)),
      projectedIncome: Number(projectedIncome.toFixed(2)),
      projectedExpense: Number(projectedExpense.toFixed(2)),
      dueBillsTotal: Number(dueBillsTotal.toFixed(2)),
      confidence: i <= 14 ? "high" : i <= 45 ? "medium" : "low",
    });
  }

  return points;
};

const sanitizeForCsv = (value: string) => (/^[=+\-@]/.test(value) ? `\t${value}` : value);

const downloadBlob = (blob: Blob, filename: string) => {
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const exportCsv = (
  filename: string,
  headers: string[],
  rows: Array<Array<string | number | null | undefined>>
) => {
  const headerLine = `${headers.join(",")}\n`;
  const lines = rows
    .map((row) =>
      row
        .map((cell) => {
          const raw = cell === null || cell === undefined ? "" : String(cell);
          const escaped = sanitizeForCsv(raw.replace(/"/g, '""'));
          return `"${escaped}"`;
        })
        .join(",")
    )
    .join("\n");

  downloadBlob(new Blob([headerLine + lines], { type: "text/csv;charset=utf-8;" }), filename);
};

export const exportJson = (filename: string, payload: unknown) => {
  const json = JSON.stringify(payload, null, 2);
  downloadBlob(new Blob([json], { type: "application/json;charset=utf-8;" }), filename);
};
