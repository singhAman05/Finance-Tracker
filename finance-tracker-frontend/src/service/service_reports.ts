import { Account, Category, Transaction, CategoryAnalysis, AccountAnalysis, MonthlyData, ChartDataInput, BillInstance } from "@/types/interfaces";
import type { Budget } from "@/components/redux/slices/slice_budgets";

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
    const limit = budget?.amount || 0;
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
    totalIncome: totalIncome,
    totalExpenses,
    netWorthChange: totalIncome - totalExpenses,
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

    const isIncome = tx.type === 'income';
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

export const getUpcomingBillsSummary = (bills: BillInstance[], daysAhead = 30) => {
  const now = new Date();
  const future = new Date();
  future.setDate(now.getDate() + daysAhead);

  const upcoming = bills.filter(
    bill =>
      bill.status !== "paid" &&
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
  // Sanitize values to prevent CSV injection (prefix with tab if starts with =, +, -, @)
  const sanitize = (val: string) => /^[=+\-@]/.test(val) ? `\t${val}` : val;
  const header = 'Category,Income,Expenses,Net,Transactions\n';
  const rows = categoryData.map(category =>
    `"${sanitize(category.name.replace(/"/g, '""'))}",${category.income},${category.expenses},${category.net},${category.count}`
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

// --- Cash Flow Functions ---

// Calculate daily cumulative cash flow for a specific month
export const getDailyCumulativeFlow = (
  transactions: Transaction[],
  targetDate: Date = new Date()
) => {
  const targetYear = targetDate.getFullYear();
  const targetMonth = targetDate.getMonth();
  const daysInMonth = new Date(targetYear, targetMonth + 1, 0).getDate();
  
  // Filter transactions for the target month
  const monthTransactions = transactions.filter(tx => {
    const d = tx.date instanceof Date ? tx.date : new Date(tx.date);
    return d.getFullYear() === targetYear && d.getMonth() === targetMonth;
  });

  // Initialize array for all days in the month
  const dailyData = Array.from({ length: daysInMonth }, (_, i) => ({
    day: i + 1,
    date: new Date(targetYear, targetMonth, i + 1).toLocaleDateString("default", { day: "numeric", month: "short" }),
    income: 0,
    expenses: 0,
    cumulative: 0
  }));

  // Aggregate by day
  monthTransactions.forEach(tx => {
    const d = tx.date instanceof Date ? tx.date : new Date(tx.date);
    const dayIndex = d.getDate() - 1; // 0-indexed for array
    const isIncome = tx.type === 'income';
    const absAmount = Math.abs(tx.amount);
    
    if (dayIndex >= 0 && dayIndex < daysInMonth) {
      if (isIncome) dailyData[dayIndex].income += absAmount;
      else dailyData[dayIndex].expenses += absAmount;
    }
  });

  // Calculate cumulative running total
  let runningTotal = 0;
  dailyData.forEach(day => {
    runningTotal += (day.income - day.expenses);
    day.cumulative = runningTotal;
  });

  return dailyData;
};

// Simple forecast based on historical monthly averages
export const getCashFlowForecast = (
  monthlyData: MonthlyData[],
  monthsToForecast = 3
) => {
  if (monthlyData.length === 0) return [];
  
  // Calculate historical averages
  const totalHistoricalIncome = monthlyData.reduce((sum, d) => sum + d.income, 0);
  const totalHistoricalExpenses = monthlyData.reduce((sum, d) => sum + d.expenses, 0);
  const avgIncome = totalHistoricalIncome / monthlyData.length;
  const avgExpenses = totalHistoricalExpenses / monthlyData.length;
  
  // Start from the month after the latest data point, or current month if no data
  const latestDataPoint = monthlyData[monthlyData.length - 1];
  let startYear, startMonth;
  
  if (latestDataPoint && latestDataPoint.month) {
    // Parse the "MMM YYYY" format (e.g. "Mar 2026")
    const [monthName, yearStr] = latestDataPoint.month.split(' ');
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    startMonth = months.indexOf(monthName) + 1; // Start from next month
    startYear = parseInt(yearStr);
    
    if (startMonth > 11) {
      startMonth = 0;
      startYear += 1;
    }
  } else {
    const now = new Date();
    startYear = now.getFullYear();
    startMonth = now.getMonth() + 1; // Next month
  }
  
  const forecastData = [];
  
  for (let i = 0; i < monthsToForecast; i++) {
    let m = startMonth + i;
    let y = startYear;
    
    if (m > 11) {
      m = m % 12;
      y += 1;
    }
    
    const d = new Date(y, m);
    forecastData.push({
      month: d.toLocaleString("default", { month: "short", year: "numeric" }),
      income: Math.round(avgIncome),
      expenses: Math.round(avgExpenses),
      isForecast: true
    });
  }
  
  return forecastData;
};