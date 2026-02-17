// components/dashboard/dashboard.tsx
"use client";

import { useEffect, useState, useMemo } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { RootState } from "@/app/store";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  ArrowUpDown,
  ArrowDownLeft,
  Wallet,
  PiggyBank,
  ArrowUpRight,
  ArrowDownRight,
  BarChart2,
  PieChart,
  LineChart,
  Plus,
} from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { useRouter } from "next/navigation";

// Services and Actions
import { fetchTransactions, getFinancialHealth } from "@/service/service_transactions";
import { fetchAccounts, getBankLogoUrl } from "@/service/service_accounts";
import { getCategoryData } from "@/service/service_reports"; 
import { fetchCategories } from "@/service/service_categories";
import { setTransactions } from "../redux/slices/slice_transactions";
import { setAccounts } from "../redux/slices/slice_accounts";
import { setCategories } from "../redux/slices/slice_categories";

// Mock Data
import { mockUpcomingBills, mockFinancialGoals, mockBudgetData } from "@/lib/mockDashboardData";

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] as const },
  },
};

function AnimatedCounter({ target, duration = 2, prefix = "" }: { target: number; duration?: number, prefix?: string }) {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (v) => `${prefix}${Math.floor(v).toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`);
  const [display, setDisplay] = useState("0");
  
  useEffect(() => {
    const controls = animate(count, target, { duration });
    const unsubscribe = rounded.on("change", (v) => setDisplay(v));
    return () => {
      controls.stop();
      unsubscribe();
    };
  }, [count, target, duration, rounded]);

  return <span>{display}</span>;
}

export default function DashboardPage() {
  const dispatch = useDispatch();
  const router = useRouter();
  const user = useSelector((state: RootState) => state.auth.user);
  const transactions = useSelector((state: RootState) => state.transactions.transactions);
  const accounts = useSelector((state: RootState) => state.accounts.accounts);
  const categories = useSelector((state: RootState) => state.categories.categories);

  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // --- Data Loading ---
  useEffect(() => {
    const loadData = async () => {
        // Only fetch if we don't have data (or you could perform a background refresh)
        if (transactions.length === 0) {
            const txRes = await fetchTransactions();
            dispatch(setTransactions(txRes.data));
        }
        if (accounts.length === 0) {
            const accRes = await fetchAccounts();
            dispatch(setAccounts(accRes.data));
        }
        if (categories.length === 0) {
            const catRes = await fetchCategories();
            dispatch(setCategories(catRes.data));
        }
    };
    loadData();
  }, [dispatch, transactions.length, accounts.length, categories.length]);


  // --- Derived Data ---
  const financialHealth = useMemo(() => {
      return getFinancialHealth(transactions, accounts);
  }, [transactions, accounts]);

  const categoryData = useMemo(() => {
      // Map category names to transactions for the chart
      // We need to ensure categories are loaded to get names if they aren't in transaction objects directly? 
      // The current getCategoryData helper uses the category list.
      return getCategoryData(categories, transactions);
  }, [categories, transactions]);
  
  // Prepare data for "Spending Distribution" (Top 5 expenses)
  const spendingChartData = useMemo(() => {
    return categoryData
      .sort((a, b) => b.expenses - a.expenses)
      .slice(0, 5)
      .map(c => ({
          name: c.name,
          value: c.expenses,
          color: c.color || "bg-gray-500" // Fallback color
      })); 
  }, [categoryData]);


  // Recent transactions (Top 5)
  const recentTransactions = useMemo(() => {
    return [...transactions]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5)
    .map(tx => {
        const cat = categories.find(c => c.id === tx.category_id);
        return {
            ...tx,
            categoryName: cat ? cat.name : "Uncategorized"
        };
    });
  }, [transactions, categories]);


  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="min-h-screen bg-background text-text-primary px-4 md:px-6 py-6 md:py-8 relative overflow-hidden">
      {/* Background Pattern */}
      <div 
        className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle, currentColor 1px, transparent 1px)`,
          backgroundSize: "32px 32px",
        }}
      />

      <motion.div 
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="flex flex-col gap-6 relative z-10"
      >
        {/* Header */}
        <motion.div variants={fadeUp} className="flex flex-col gap-4 md:flex-row md:justify-between md:items-center">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tighter text-gray-900 dark:text-white">
              Financial Dashboard
            </h1>
            <div className="mt-2">
              {isClient && user ? (
                <p className="text-base text-muted-foreground">
                  Welcome back,{" "}
                  <span className="font-semibold text-foreground">{user.full_name}</span>
                </p>
              ) : (
                <p className="text-base text-muted-foreground">
                  Welcome to your dashboard
                </p>
              )}
            </div>
          </div>

          <Button 
            size="lg" 
            className="gap-2 w-full md:w-auto shadow-lg hover:shadow-xl transition-all duration-300 rounded-full"
            onClick={() => router.push("/transactions")} // Redirect to add transaction there or open modal
          >
            <Plus size={18} />
            View Transactions
          </Button>
        </motion.div>

        {/* Summary Cards */}
        <motion.div variants={fadeUp} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Net Worth */}
          <Card className="bg-primary/5 border-primary/20 shadow-sm hover:shadow-md transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-primary">Net Worth</CardTitle>
              <div className="p-2 bg-primary/10 rounded-full">
                <Wallet className="h-4 w-4 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold tracking-tighter">
                <AnimatedCounter target={financialHealth.netWorth} prefix="₹" />
              </div>
              <p className="text-xs text-muted-foreground flex items-center mt-2 font-medium">
                 {/* Placeholder for Net Worth Growth since we don't have history yet */}
                <ArrowUpRight className="h-4 w-4 text-emerald-500 mr-1" />
                <span className="text-emerald-500">Live</span>
                <span className="ml-1">updated from accounts</span>
              </p>
            </CardContent>
          </Card>

          {/* Cash Flow (Current Month) */}
          <Card className="shadow-sm hover:shadow-md transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Cash Flow (This Month)</CardTitle>
              <div className="p-2 bg-secondary rounded-full">
                <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              <div className={`text-3xl font-bold tracking-tighter ${financialHealth.cashFlow >= 0 ? "text-emerald-600" : "text-red-500"}`}>
                <AnimatedCounter target={Math.abs(financialHealth.cashFlow)} prefix={financialHealth.cashFlow < 0 ? "-₹" : "₹"} />
              </div>
              <p className="text-xs text-muted-foreground mt-2 font-medium">
                Income: <span className="text-foreground">{formatCurrency(financialHealth.currentIncome)}</span> | Expenses:{" "}
                <span className="text-foreground">{formatCurrency(financialHealth.currentExpense)}</span>
              </p>
            </CardContent>
          </Card>

          {/* Budget Health - MOCK DATA */}
          <Card className="shadow-sm hover:shadow-md transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Budget Health</CardTitle>
              <div className="p-2 bg-secondary rounded-full">
                <PiggyBank className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold tracking-tighter">
                <AnimatedCounter target={mockBudgetData.health} />
                <span>%</span>
              </div>
              <p className="text-xs text-muted-foreground mt-2 font-medium">
                <span className="text-foreground">{formatCurrency(mockBudgetData.used)}</span> of {formatCurrency(mockBudgetData.total)} used
              </p>
              <Progress value={mockBudgetData.health} className="h-1.5 mt-3 bg-secondary" />
            </CardContent>
          </Card>
        </motion.div>

        {/* Charts Row */}
        <motion.div variants={fadeUp} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Monthly Cash Flow - Placeholder/Future Feature */}
          <div className="lg:col-span-8">
            <Card className="shadow-sm hover:shadow-md transition-all duration-300">
              <CardHeader>
                <CardTitle className="text-lg">Monthly Cash Flow</CardTitle>
                <CardDescription>
                  Income vs Expenses over last 6 months
                </CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <div className="flex items-center justify-center h-full border-2 border-dashed border-muted rounded-xl bg-muted/20">
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <BarChart2 className="h-10 w-10" />
                    <span className="font-medium">Cash Flow Chart (Coming Soon)</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Spending Distribution - DYNAMIC */}
          <div className="lg:col-span-4">
            <Card className="shadow-sm hover:shadow-md transition-all duration-300 h-full">
              <CardHeader>
                <CardTitle className="text-lg">Spending Distribution</CardTitle>
                <CardDescription>Top Categories</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px] overflow-y-auto">
                 {spendingChartData.length > 0 ? (
                    <div className="space-y-4 mt-4">
                        {spendingChartData.map((item, idx) => (
                             <div key={idx} className="flex items-center justify-between">
                             <div className="flex items-center gap-2">
                                 <div className={`w-3 h-3 rounded-full ${item.color.startsWith('bg') ? item.color : "bg-gray-500"}`} style={{ backgroundColor: item.color.startsWith('#') ? item.color : undefined}} /> 
                                 <span className="text-sm font-medium">{item.name}</span>
                             </div>
                             <span className="text-sm text-text-secondary">{formatCurrency(item.value)}</span>
                         </div>
                        ))}
                    </div>
                 ) : (
                    <div className="flex items-center justify-center h-full border-2 border-dashed border-muted rounded-xl bg-muted/20">
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                        <PieChart className="h-10 w-10" />
                        <span className="font-medium">No expenses yet</span>
                    </div>
                    </div>
                 )}
              </CardContent>
            </Card>
          </div>
        </motion.div>

        {/* Financial Overview */}
        <motion.div variants={fadeUp} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Net Worth Trend - Placeholder */}
          <div className="lg:col-span-5">
            <Card className="shadow-sm hover:shadow-md transition-all duration-300 h-full">
              <CardHeader>
                <CardTitle className="text-lg">Net Worth Trend</CardTitle>
                <CardDescription>12-month progression</CardDescription>
              </CardHeader>
              <CardContent className="h-[250px]">
                <div className="flex items-center justify-center h-full border-2 border-dashed border-muted rounded-xl bg-muted/20">
                   <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <LineChart className="h-10 w-10" />
                    <span className="font-medium">Trend Chart (Coming Soon)</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Budget Progress - MOCK DATA (reusing Spending Data logic for UI but using mock values) */}
          <div className="lg:col-span-7">
            <Card className="shadow-sm hover:shadow-md transition-all duration-300 h-full">
              <CardHeader>
                <CardTitle className="text-lg">Budget Progress</CardTitle>
                <CardDescription>Monthly spending by category (Target)</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {mockBudgetData.spending.map((item) => (
                    <div key={item.name}>
                      <div className="flex justify-between text-sm mb-2 font-medium">
                        <span className="tracking-tight">{item.name}</span>
                        <span className="text-muted-foreground">{formatCurrency(item.value)}</span>
                      </div>
                      <Progress
                        value={(item.value / 4000) * 100} // Arbitrary denom for mock
                        className={`h-2.5 rounded-full ${item.color.replace('bg-', 'bg-')}`} 
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </motion.div>

        {/* Bottom Row */}
        <motion.div variants={fadeUp} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Recent Transactions - DYNAMIC */}
          <div className="lg:col-span-5">
            <Card className="shadow-sm hover:shadow-md transition-all duration-300 h-full">
              <CardHeader className="flex flex-row items-center justify-between pb-6">
                <CardTitle className="text-lg">Recent Transactions</CardTitle>
                <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-primary hover:text-primary/80 hover:bg-primary/10"
                    onClick={() => router.push("/transactions")}
                >
                  View All
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {recentTransactions.map((transaction) => (
                    <div
                      key={transaction.id}
                      className="flex items-center justify-between group"
                    >
                      <div className="flex items-center">
                        <div
                          className={`p-2.5 rounded-xl mr-4 transition-colors ${
                            transaction.amount > 0
                              ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20"
                              : "bg-red-100 text-red-600 dark:bg-red-500/20"
                          }`}
                        >
                          {transaction.amount > 0 ? (
                            <ArrowUpRight className="h-4 w-4" />
                          ) : (
                            <ArrowDownLeft className="h-4 w-4" />
                          )}
                        </div>
                        <div>
                          <div className="font-semibold tracking-tight group-hover:text-primary transition-colors max-w-[150px] truncate">{transaction.description || "No description"}</div>
                          <div className="text-xs text-muted-foreground mt-0.5">
                            {new Date(transaction.date).toLocaleDateString()} • {transaction.categoryName}
                          </div>
                        </div>
                      </div>
                      <div
                        className={`font-semibold tracking-tight ${
                          transaction.amount > 0
                            ? "text-emerald-600"
                            : "text-red-600"
                        }`}
                      >
                        {transaction.amount < 0 ? "-" : "+"}{formatCurrency(Math.abs(transaction.amount))}
                      </div>
                    </div>
                  ))}
                  {recentTransactions.length === 0 && (
                      <p className="text-sm text-center text-muted-foreground py-4">No recent transactions found.</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Upcoming Bills - MOCK DATA */}
          <div className="lg:col-span-3">
            <Card className="shadow-sm hover:shadow-md transition-all duration-300 h-full bg-slate-900 text-white dark:bg-slate-950">
              <CardHeader className="pb-6">
                <CardTitle className="text-lg text-white">Upcoming Bills</CardTitle>
                <CardDescription className="text-slate-400">Next 7 days</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {mockUpcomingBills.map((bill) => (
                    <div
                      key={bill.id}
                      className="flex items-center justify-between"
                    >
                      <div>
                        <div className="font-semibold tracking-tight text-white">{bill.name}</div>
                        <div className="text-xs text-slate-400 mt-0.5">
                          Due: {bill.dueDate}
                        </div>
                      </div>
                      <div className="font-semibold text-red-400">
                        {formatCurrency(bill.amount)}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Financial Goals - MOCK DATA */}
          <div className="lg:col-span-4">
            <Card className="shadow-sm hover:shadow-md transition-all duration-300 h-full">
              <CardHeader className="pb-6">
                <CardTitle className="text-lg">Financial Goals</CardTitle>
                <CardDescription>Savings progress</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {mockFinancialGoals.map((goal) => {
                    const progress = (goal.current / goal.target) * 100;
                    return (
                      <div key={goal.id}>
                        <div className="flex justify-between text-sm mb-2">
                          <span className="font-semibold tracking-tight">{goal.name}</span>
                          <span className="text-muted-foreground font-medium">{progress.toFixed(0)}%</span>
                        </div>
                        <Progress value={progress} className="h-2.5 rounded-full bg-secondary" />
                        <div className="flex justify-between text-xs text-muted-foreground mt-2 font-medium">
                          <span>
                            {formatCurrency(goal.current)} /{" "}
                            {formatCurrency(goal.target)}
                          </span>
                          <span>Until {goal.deadline}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
