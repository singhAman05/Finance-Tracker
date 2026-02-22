import { Account, Category, Transaction, CategoryAnalysis, AccountAnalysis, MonthlyData, ChartDataInput } from "@/types/interfaces";

interface Bill {
  id: string;
  amount: number;
  due_date: Date;
  paid: boolean;
}

export interface Budget {
  id: string;
  category_id: string;
  limit: number;
}

export const getBudgetVsActual = (
  categories: Category[],
  budgets: Budget[],
  categoryMap: Record<string, { income: number; expenses: number; count: number }>
) => {
  const budgetMap = Object.fromEntries(
    budgets.map(b => [b.category_id, b])
  );

  return categories.map(category => {
    const stats = categoryMap[category.id];
    const budget = budgetMap[category.id];

    const actual = stats?.expenses || 0;
    const limit = budget?.limit || 0;
    const remaining = limit - actual;
    const percentage = limit > 0 ? (actual / limit) * 100 : 0;

    return {
      category_id: category.id,
      category_name: category.name,
      limit,
      actual,
      remaining,
      percentage,
      overspent: limit > 0 && actual > limit,
    };
  });
};


// Calculate summary values
export const calculateSummaryFromAggregation = (
  accounts: Account[],
  categoryMap: Record<string, { income: number; expenses: number; count: number }>
) => {
  const totalBalance = accounts.reduce(
    (sum, acc) => sum + (acc.balance || 0),
    0
  );

  let totalIncome = 0;
  let totalExpenses = 0;

  Object.values(categoryMap).forEach(stat => {
    totalIncome += stat.income;
    totalExpenses += stat.expenses;
  });

  return {
    totalBalance,
    totalIncome: totalIncome + totalBalance,
    totalExpenses,
    netWorthChange: (totalIncome + totalBalance) - totalExpenses,
  };
};


export const aggregateTransactions = (transactions: Transaction[]) => {
  const categoryMap: Record<string, { income: number; expenses: number; count: number }> = {};
  const accountMap: Record<string, { income: number; expenses: number; count: number }> = {};
  const monthlyMap: Record<string, { income: number; expenses: number }> = {};

  for (const tx of transactions) {
    const dateObj = tx.date instanceof Date ? tx.date : new Date(tx.date);
    const monthKey = `${dateObj.getFullYear()}-${dateObj.getMonth()}`; // stable key

    if (!monthlyMap[monthKey]) {
      monthlyMap[monthKey] = { income: 0, expenses: 0 };
    }

    const isIncome = tx.type === 'income' || tx.amount < 0; // fallback for some old data
    const absAmount = Math.abs(tx.amount);

    // Monthly
    if (isIncome) monthlyMap[monthKey].income += absAmount;
    else monthlyMap[monthKey].expenses += absAmount;

    // Category
    if (!categoryMap[tx.category_id]) {
      categoryMap[tx.category_id] = { income: 0, expenses: 0, count: 0 };
    }

    if (isIncome) categoryMap[tx.category_id].income += absAmount;
    else categoryMap[tx.category_id].expenses += absAmount;

    categoryMap[tx.category_id].count++;

    // Account
    if (!accountMap[tx.account_id]) {
      accountMap[tx.account_id] = { income: 0, expenses: 0, count: 0 };
    }

    if (isIncome) accountMap[tx.account_id].income += absAmount;
    else accountMap[tx.account_id].expenses += absAmount;

    accountMap[tx.account_id].count++;
  }

  return { categoryMap, accountMap, monthlyMap };
};


// Prepare data for category-wise analysis
export const getCategoryData = (
  categories: Category[],
  categoryMap: Record<string, { income: number; expenses: number; count: number }>
): CategoryAnalysis[] => {
  return categories
    .map(category => {
      const stats = categoryMap[category.id];

      if (!stats) return null;

      return {
        id: category.id,
        name: category.name,
        income: stats.income,
        expenses: stats.expenses,
        net: stats.income - stats.expenses,
        count: stats.count,
        color: category.color,
      };
    })
    .filter(Boolean) as CategoryAnalysis[];
};


// Prepare data for account-wise analysis
export const getAccountData = (
  accounts: Account[],
  accountMap: Record<string, { income: number; expenses: number; count: number }>
): AccountAnalysis[] => {
  return accounts
    .map(account => {
      const stats = accountMap[account.id];
      if (!stats) return null;

      return {
        id: account.id,
        name: account.name,
        bankName: account.bankName,
        income: stats.income,
        expenses: stats.expenses,
        net: stats.income - stats.expenses,
        count: stats.count,
        currentBalance: account.balance || 0,
      };
    })
    .filter(Boolean) as AccountAnalysis[];
};


// Prepare data for time-based analysis (monthly)
export const getMonthlyData = (
  monthlyMap: Record<string, { income: number; expenses: number }>
) => {
  return Object.entries(monthlyMap)
    .map(([key, value]) => {
      const [year, month] = key.split("-").map(Number);
      const date = new Date(year, month);

      return {
        month: date.toLocaleString("default", { month: "short", year: "numeric" }),
        income: value.income,
        expenses: value.expenses,
        sortKey: date.getTime(),
      };
    })
    .sort((a, b) => a.sortKey - b.sortKey)
    .map(({ sortKey, ...rest }) => rest);
};

export const getUpcomingBillsSummary = (bills: Bill[], daysAhead = 30) => {
  const now = new Date();
  const future = new Date();
  future.setDate(now.getDate() + daysAhead);

  const upcoming = bills.filter(
    bill =>
      !bill.paid &&
      new Date(bill.due_date) >= now &&
      new Date(bill.due_date) <= future
  );

  const totalDue = upcoming.reduce((sum, bill) => sum + bill.amount, 0);

  return {
    count: upcoming.length,
    totalDue,
    upcoming,
  };
};


// Get top spending categories
export const getTopSpendingCategories = (categoryData: CategoryAnalysis[], limit = 5) => {
  return categoryData
    .filter(c => c.expenses > 0)
    .toSorted((a, b) => b.expenses - a.expenses)
    .slice(0, limit);
};

// Get category with highest income
export const getTopIncomeCategories = (categoryData: CategoryAnalysis[], limit = 5) => {
  return categoryData
    .filter(c => c.income > 0)
    .toSorted((a, b) => b.income - a.income)
    .slice(0, limit);
};

// Get accounts with highest balance
export const getTopAccountsByBalance = (accountData: AccountAnalysis[], limit = 5) => {
  return accountData
    .toSorted((a, b) => b.currentBalance - a.currentBalance)
    .slice(0, limit);
};

export const convertToChartData = (data: CategoryAnalysis[]): ChartDataInput[] => {
  return data
    .filter(item => item.expenses > 0)
    .map(item => ({
      name: item.name,
      value: item.expenses,
      color: item.color
    }));
};

// Similarly, you can add functions for other conversions
export const convertToIncomeChartData = (data: CategoryAnalysis[]): ChartDataInput[] => {
  return data
    .filter(item => item.income > 0)
    .map(item => ({
      name: item.name,
      value: item.income,
      color: item.color
    }));
};

// Add this function to your service_reports.ts
export const exportCategoryDataToCSV = (categoryData: CategoryAnalysis[], filename: string = 'financial-report.csv') => {
  const header = 'Category,Income,Expenses,Net,Transactions\n';
  const rows = categoryData.map(category =>
    `"${category.name.replace(/"/g, '""')}",${category.income},${category.expenses},${category.net},${category.count}`
  ).join('\n');

  const csv = header + rows;
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });

  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};