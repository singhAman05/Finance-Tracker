import { Account, Category, Transaction,   CategoryAnalysis, AccountAnalysis, MonthlyData, ChartDataInput  } from "@/types/interfaces";

// Calculate summary values
export const calculateSummary = (accounts: Account[], transactions: Transaction[]) => {
  const totalBalance = accounts.reduce(
    (sum, acc) => sum + (acc.balance || 0),
    0
  );
  
  const totalIncome = transactions
    .filter(tx => tx.amount < 0)
    .reduce((sum, tx) => sum + Math.abs(tx.amount), 0);
    
  const totalExpenses = transactions
    .filter(tx => tx.amount > 0)
    .reduce((sum, tx) => sum + tx.amount, 0);
    
  const netWorthChange = totalIncome - totalExpenses;

  return { totalBalance, totalIncome, totalExpenses, netWorthChange };
};

// Prepare data for category-wise analysis
export const getCategoryData = (categories: Category[], transactions: Transaction[]) => {
  return categories.map(category => {
    const categoryTransactions = transactions.filter(
      tx => tx.category_id === category.id
    );
    
    const income = categoryTransactions
      .filter(tx => tx.amount < 0)
      .reduce((sum, tx) => sum + Math.abs(tx.amount), 0);
      
    const expenses = categoryTransactions
      .filter(tx => tx.amount > 0)
      .reduce((sum, tx) => sum + tx.amount, 0);
      
    return {
      id: category.id,
      name: category.name,
      income,
      expenses,
      net: income - expenses,
      count: categoryTransactions.length,
      color: category.color
    };
  }).filter(item => item.count > 0);
};

// Prepare data for account-wise analysis
export const getAccountData = (accounts: Account[], transactions: Transaction[]) => {
  return accounts.map(account => {
    const accountTransactions = transactions.filter(
      tx => tx.account_id === account.id
    );
    
    const income = accountTransactions
      .filter(tx => tx.amount < 0)
      .reduce((sum, tx) => sum + Math.abs(tx.amount), 0);
      
    const expenses = accountTransactions
      .filter(tx => tx.amount > 0)
      .reduce((sum, tx) => sum + tx.amount, 0);
      
    return {
      id: account.id,
      name: account.name,
      bankName: account.bankName,
      income,
      expenses,
      net: income - expenses,
      count: accountTransactions.length,
      currentBalance: account.balance || 0
    };
  }).filter(item => item.count > 0);
};

// Prepare data for time-based analysis (monthly)
export const getMonthlyData = (transactions: Transaction[]) => {
  const months: Record<string, MonthlyData> = {};
  
  transactions.forEach(tx => {
    const monthKey = new Date(tx.date).toLocaleString('default', { month: 'short', year: 'numeric' });
    if (!months[monthKey]) {
      months[monthKey] = { month: monthKey, income: 0, expenses: 0 };
    }
    
    if (tx.amount < 0) {
      months[monthKey].income += Math.abs(tx.amount);
    } else {
      months[monthKey].expenses += tx.amount;
    }
  });
  
  return Object.values(months).sort((a, b) => {
    const aDate = new Date(a.month);
    const bDate = new Date(b.month);
    return aDate.getTime() - bDate.getTime();
  });
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