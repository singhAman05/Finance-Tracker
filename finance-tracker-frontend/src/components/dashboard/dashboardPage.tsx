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
  PieChart,
  LineChart,
  Plus,
  TrendingUp,
  Activity,
  CalendarDays,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  AreaChart,
  Area,
  Line,
  Cell,
  PieChart as RechartsPieChart,
  Pie,
} from "recharts";
import { useSelector, useDispatch } from "react-redux";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { useRouter } from "next/navigation";

// Services and Actions
import { fetchTransactions, getFinancialHealth } from "@/service/service_transactions";
import { fetchAccounts, getBankLogoUrl } from "@/service/service_accounts";
import { getCategoryData, aggregateTransactions, getMonthlyData } from "@/service/service_reports"; 
import { fetchCategories } from "@/service/service_categories";
import { fetchBudgetSummary, calculateBudgetSummaryStats } from "@/service/service_budgets";
import { fetchBillInstances } from "@/service/service_bills";
import { setTransactions } from "../redux/slices/slice_transactions";
import { setAccounts } from "../redux/slices/slice_accounts";
import { setCategories } from "../redux/slices/slice_categories";

// Types
import { BillInstance } from "@/types/interfaces";

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

const GlassTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card/80 backdrop-blur-md border border-border p-3 rounded-2xl shadow-xl">
        <p className="font-bold text-xs mb-2 text-text-primary">{label}</p>
        <div className="space-y-1.5">
          {payload.map((item: any, idx: number) => (
            <div key={idx} className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-[10px] font-bold text-text-secondary uppercase tracking-tight">{item.name}:</span>
              </div>
              <span className="text-xs font-bold text-text-primary">₹{item.value.toLocaleString()}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

export default function DashboardPage() {
  const dispatch = useDispatch();
  const router = useRouter();
  const user = useSelector((state: RootState) => state.auth.user);
  const transactions = useSelector((state: RootState) => state.transactions.transactions);
  const accounts = useSelector((state: RootState) => state.accounts.accounts);
  const categories = useSelector((state: RootState) => state.categories.categories);

  const [isClient, setIsClient] = useState(false);
  const [budgetSummary, setBudgetSummary] = useState<any[]>([]);
  const [upcomingBills, setUpcomingBills] = useState<BillInstance[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // --- Data Loading ---
  useEffect(() => {
    const loadData = async () => {
        setLoading(true);
        try {
            // Only fetch if we don't have data (or you could perform a background refresh)
            const promises = [];
            
            if (transactions.length === 0) promises.push(fetchTransactions().then(res => dispatch(setTransactions(res.data))));
            if (accounts.length === 0) promises.push(fetchAccounts().then(res => dispatch(setAccounts(res.data))));
            if (categories.length === 0) promises.push(fetchCategories().then(res => dispatch(setCategories(res.data))));
            
            // Always fetch fresh summaries for dashboard
            promises.push(fetchBudgetSummary().then(res => setBudgetSummary(res?.data || [])));
            promises.push(fetchBillInstances().then(res => {
                const instances = res?.data || [];
                // Filter for upcoming/unpaid bills in the next 15 days
                const now = new Date();
                const fifteenDaysLater = new Date();
                fifteenDaysLater.setDate(now.getDate() + 15);

                const upcoming = instances
                    .filter((bi: any) => bi.status !== 'paid' && new Date(bi.due_date) <= fifteenDaysLater)
                    .sort((a: any, b: any) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime())
                    .slice(0, 5);
                setUpcomingBills(upcoming);
            }));

            await Promise.all(promises);
        } catch (error) {
            console.error("Dashboard data load error:", error);
        } finally {
            setLoading(false);
        }
    };
    loadData();
  }, [dispatch, transactions.length, accounts.length, categories.length]);


  // --- Derived Data ---
  const financialHealth = useMemo(() => {
      return getFinancialHealth(transactions, accounts);
  }, [transactions, accounts]);

  const categoryData = useMemo(() => {
    if (!Array.isArray(categories) || !Array.isArray(transactions) || transactions.length === 0) {
        return [];
    }
    const { categoryMap } = aggregateTransactions(transactions);
    return getCategoryData(categories, categoryMap);
  }, [categories, transactions]);
  
  // Budget stats
  const budgetStats = useMemo(() => {
    return calculateBudgetSummaryStats(budgetSummary);
  }, [budgetSummary]);

  // Prepared data for charts using real data
  const { monthlyMap } = aggregateTransactions(transactions);
  const monthlyData = getMonthlyData(monthlyMap).slice(-6); // Last 6 months
  
  // Prepare data for "Spending Distribution" (Top 5 expenses)
  const spendingChartData = useMemo(() => {
    if (!Array.isArray(categoryData)) return [];
    return [...categoryData]
      .sort((a, b) => b.expenses - a.expenses)
      .slice(0, 5)
      .map(c => ({
          name: c.name,
          value: c.expenses,
          color: c.color || "#6366f1" // Fallback indigo
      })); 
  }, [categoryData]);


  // Recent transactions (Top 5)
  const recentTransactions = useMemo(() => {
    if (!Array.isArray(transactions) || !Array.isArray(categories)) return [];
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
          backgroundImage: `radial-gradient(circle, var(--color-text-primary) 1px, transparent 1px)`,
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
            <h1 className="text-3xl md:text-4xl font-bold tracking-tighter text-text-primary">
              Financial Dashboard
            </h1>
            <div className="mt-2">
              {isClient && user ? (
                <p className="text-base text-text-secondary">
                  Welcome back,{" "}
                  <span className="font-semibold text-text-primary">{user.full_name}</span>
                </p>
              ) : (
                <p className="text-base text-text-secondary">
                  Welcome to your dashboard
                </p>
              )}
            </div>
          </div>

          <Button 
            size="lg" 
            className="gap-2 w-full md:w-auto shadow-lg hover:shadow-xl transition-all duration-300 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer"
            onClick={() => router.push("/dashboard/bills")}
          >
            <Plus size={18} />
            View Bills
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
              <p className="text-xs text-text-secondary flex items-center mt-2 font-medium">
                 {/* Placeholder for Net Worth Growth since we don't have history yet */}
                <ArrowUpRight className="h-4 w-4 text-success mr-1" />
                <span className="text-success">Live</span>
                <span className="ml-1 text-text-secondary">updated from accounts</span>
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
              <div className={`text-3xl font-bold tracking-tighter ${financialHealth.cashFlow >= 0 ? "text-success" : "text-danger"}`}>
                <AnimatedCounter target={Math.abs(financialHealth.cashFlow)} prefix={financialHealth.cashFlow < 0 ? "-₹" : "₹"} />
              </div>
              <p className="text-xs text-text-secondary mt-2 font-medium">
                Income: <span className="text-text-primary">{formatCurrency(financialHealth.currentIncome)}</span> | Expenses:{" "}
                <span className="text-text-primary">{formatCurrency(financialHealth.currentExpense)}</span>
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-sm hover:shadow-md transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Budget Health</CardTitle>
              <div className="p-2 bg-secondary rounded-full">
                <PiggyBank className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold tracking-tighter">
                <AnimatedCounter target={Math.min(100, Math.round(budgetStats.overallPercentage))} />
                <span>%</span>
              </div>
              <p className="text-xs text-text-secondary mt-2 font-medium">
                <span className="text-text-primary">{formatCurrency(budgetStats.totalSpent)}</span> of {formatCurrency(budgetStats.totalBudget)} used
              </p>
              <Progress value={budgetStats.overallPercentage} className="h-1.5 mt-3 bg-muted" />
            </CardContent>
          </Card>
        </motion.div>

        {/* Charts Row */}
        <motion.div variants={fadeUp} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Monthly Cash Flow - Placeholder/Future Feature */}
          <div className="lg:col-span-8">
            <Card className="shadow-sm hover:shadow-md transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                   <CardTitle className="text-lg">Monthly Cash Flow</CardTitle>
                   <CardDescription>
                     Income vs Expenses over last 6 months
                   </CardDescription>
                </div>
                <div className="flex items-center gap-4 text-xs font-semibold uppercase tracking-wider">
                    <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full bg-success" />
                        <span className="text-text-secondary">Income</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full bg-danger" />
                        <span className="text-text-secondary">Expense</span>
                    </div>
                </div>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="opacity-[0.05]" />
                    <XAxis 
                        dataKey="month" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fontSize: 10, fontWeight: 600 }}
                        dy={10}
                    />
                    <YAxis 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fontSize: 10, fontWeight: 600 }}
                        tickFormatter={(val) => `₹${val/1000}k`}
                    />
                    <Tooltip content={<GlassTooltip />} cursor={{ fill: 'currentColor', opacity: 0.05 }} />
                    <Bar dataKey="income" name="Income" fill="#10b981" radius={[4, 4, 0, 0]} barSize={24} />
                    <Bar dataKey="expenses" name="Expense" fill="#ef4444" radius={[4, 4, 0, 0]} barSize={24} />
                  </BarChart>
                </ResponsiveContainer>
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
                <CardDescription>Monthly progression</CardDescription>
              </CardHeader>
              <CardContent className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorNet" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="opacity-[0.05]" />
                    <XAxis 
                        dataKey="month" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fontSize: 10, fontWeight: 600 }}
                        dy={10}
                    />
                    <YAxis 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fontSize: 10, fontWeight: 600 }}
                        tickFormatter={(val) => `₹${val/1000}k`}
                    />
                    <Tooltip content={<GlassTooltip />} />
                    <Area 
                        type="monotone" 
                        dataKey={(d) => d.income - d.expenses} 
                        name="Net Cash Flow"
                        stroke="#6366f1" 
                        strokeWidth={3}
                        fillOpacity={1} 
                        fill="url(#colorNet)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-7">
            <Card className="shadow-sm hover:shadow-md transition-all duration-300 h-full">
              <CardHeader>
                <CardTitle className="text-lg">Budget Progress</CardTitle>
                <CardDescription>Monthly spending by category</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {budgetSummary.slice(0, 4).map((item) => (
                    <div key={item.category_id || item.category_name}>
                      <div className="flex justify-between text-sm mb-2 font-medium">
                        <span className="tracking-tight">{item.category_name}</span>
                        <span className="text-muted-foreground">{formatCurrency(item.spent_amount)} / {formatCurrency(item.budget_amount)}</span>
                      </div>
                      <Progress
                        value={item.percentage_used}
                        className={`h-2.5 rounded-full`} 
                      />
                    </div>
                  ))}
                  {budgetSummary.length === 0 && (
                      <p className="text-sm text-center text-muted-foreground py-4">No budgets set up yet.</p>
                  )}
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
                    className="text-primary hover:text-primary/80 hover:bg-primary/5"
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
                              ? "bg-success/10 text-success"
                              : "bg-danger/10 text-danger"
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
                          <div className="text-xs text-text-secondary mt-0.5">
                            {new Date(transaction.date).toLocaleDateString()} • {transaction.categoryName}
                          </div>
                        </div>
                      </div>
                      <div
                        className={`font-semibold tracking-tight ${
                          transaction.amount > 0
                            ? "text-success"
                            : "text-danger"
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

          <div className="lg:col-span-3">
            <Card className="shadow-sm hover:shadow-md transition-all duration-300 h-full bg-primary text-primary-foreground border-primary/20">
              <CardHeader className="pb-6">
                <CardTitle className="text-lg text-primary-foreground">Upcoming Bills</CardTitle>
                <CardDescription className="text-primary-foreground/60">Next 15 days</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {upcomingBills.map((bill) => (
                    <div
                      key={bill.id}
                      className="flex items-center justify-between"
                    >
                      <div className="max-w-[120px]">
                        <div className="font-semibold tracking-tight text-primary-foreground truncate">Bill Due</div>
                        <div className="text-xs text-primary-foreground/60 mt-0.5">
                          {new Date(bill.due_date).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="font-semibold text-danger bg-white/10 px-2 py-1 rounded-lg">
                        {formatCurrency(bill.amount)}
                      </div>
                    </div>
                  ))}
                  {upcomingBills.length === 0 && (
                      <p className="text-sm text-center text-primary-foreground/60 py-4">No upcoming bills.</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-4">
            <Card className="shadow-sm hover:shadow-md transition-all duration-300 h-full">
              <CardHeader className="pb-6">
                <CardTitle className="text-lg">Financial Overview</CardTitle>
                <CardDescription>Monthly Analysis</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                   <div>
                        <div className="flex justify-between text-sm mb-2">
                           <span className="font-semibold tracking-tight text-text-primary">Savings Goal Progress</span>
                           <span className="text-text-secondary font-medium">Inactive</span>
                        </div>
                        <Progress value={0} className="h-2.5 rounded-full bg-muted" />
                        <div className="flex justify-between text-xs text-text-secondary mt-2 font-medium">
                           <span>Module disabled in settings</span>
                        </div>
                   </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
