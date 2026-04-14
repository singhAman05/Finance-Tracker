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
import Loader from "@/utils/loader";
import {
  ArrowUpDown,
  ArrowDownLeft,
  Wallet,
  PiggyBank,
  ArrowUpRight,
  ArrowDownRight,
  PieChart,
  Plus,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  AreaChart,
  Area,
} from "recharts";
import { useSelector, useDispatch } from "react-redux";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { useRouter } from "next/navigation";

// Services and Actions
import { fetchTransactions, getFinancialHealth } from "@/service/service_transactions";
import { fetchAccounts } from "@/service/service_accounts";
import {
  calculateKpis,
  filterTransactionsByPeriod,
  getCategoryInsights,
  getMonthlyInsights,
} from "@/service/service_reports";
import { fetchCategories } from "@/service/service_categories";
import { fetchBudgetSummary, calculateBudgetSummaryStats } from "@/service/service_budgets";
import { fetchBillInstances, fetchBills } from "@/service/service_bills";
import { setTransactions } from "../redux/slices/slice_transactions";
import { setAccounts } from "../redux/slices/slice_accounts";
import { setCategories } from "../redux/slices/slice_categories";

// Types
import { BillInstance, Bill } from "@/types/interfaces";
import { useCurrency } from "@/hooks/useCurrency";
import { useDateFormat } from "@/hooks/useDateFormat";

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

function AnimatedCounter({
  target,
  duration = 2,
  prefix = "",
}: {
  target: number;
  duration?: number;
  prefix?: string;
}) {
  const count = useMotionValue(0);
  const rounded = useTransform(
    count,
    (v) =>
      `${prefix}${Math.floor(v).toLocaleString("en-US", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      })}`
  );
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

// Fixed: `active` is a boolean from recharts, not an object — currencySymbol must come from closure
const GlassTooltip = ({
  active,
  payload,
  label,
  currencySymbol,
}: {
  active?: boolean;
  payload?: any[];
  label?: string;
  currencySymbol: string;
}) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card/80 backdrop-blur-md border border-border p-3 rounded-2xl shadow-xl">
        <p className="font-bold text-xs mb-2 text-text-primary">{label}</p>
        <div className="space-y-1.5">
          {payload.map((item: any, idx: number) => (
            <div key={idx} className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-1.5">
                <div
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-[10px] font-bold text-text-secondary uppercase tracking-tight">
                  {item.name}:
                </span>
              </div>
              <span className="text-xs font-bold text-text-primary">
                {currencySymbol}
                {item.value.toLocaleString()}
              </span>
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
  const transactions = useSelector(
    (state: RootState) => state.transactions.transactions
  );
  const accounts = useSelector((state: RootState) => state.accounts.accounts);
  const categories = useSelector(
    (state: RootState) => state.categories.categories
  );
  const { formatCurrency, symbol, formatAxis } = useCurrency();
  const { formatDate } = useDateFormat();

  const [isClient, setIsClient] = useState(false);
  const [budgetSummary, setBudgetSummary] = useState<any[]>([]);
  const [bills, setBills] = useState<Bill[]>([]);
  const [billInstances, setBillInstances] = useState<BillInstance[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Data Loading
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const promises = [];

        if (transactions.length === 0)
          promises.push(
            fetchTransactions().then((res) => {
              if (res?.data) dispatch(setTransactions(res.data));
            })
          );
        if (accounts.length === 0)
          promises.push(
            fetchAccounts().then((res) => {
              if (res?.data) dispatch(setAccounts(res.data));
            })
          );
        if (categories.length === 0)
          promises.push(
            fetchCategories().then((res) => {
              if (res?.data) dispatch(setCategories(res.data));
            })
          );

        promises.push(
          fetchBudgetSummary().then((res) => setBudgetSummary(res?.data || []))
        );
        promises.push(
          fetchBills().then((res) => setBills(res?.data || []))
        );
        promises.push(
          fetchBillInstances().then((res) => {
            setBillInstances(res?.data || []);
          })
        );

        await Promise.all(promises);
      } catch (error) {
        console.error("Dashboard data load error:", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [dispatch, transactions.length, accounts.length, categories.length]);

  // Derived Data — all memoized
  const financialHealth = useMemo(
    () => getFinancialHealth(transactions, accounts),
    [transactions, accounts]
  );

  const categoryData = useMemo(() => {
    if (!Array.isArray(categories) || !Array.isArray(transactions) || transactions.length === 0) {
      return [];
    }
    return getCategoryInsights(categories, transactions);
  }, [categories, transactions]);

  const activeBudgetSummary = useMemo(
    () =>
      Array.isArray(budgetSummary)
        ? budgetSummary.filter((item: any) => Boolean(item.is_active))
        : [],
    [budgetSummary]
  );

  const budgetStats = useMemo(
    () => calculateBudgetSummaryStats(activeBudgetSummary),
    [activeBudgetSummary]
  );

  const { overdueBills, upcomingBills } = useMemo(() => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const fifteenDaysLater = new Date(now);
    fifteenDaysLater.setDate(now.getDate() + 15);

    const unpaid = (billInstances || []).filter(
      (bi: BillInstance) => bi.status !== "paid"
    );
    const overdue = unpaid
      .filter((bi: BillInstance) => new Date(bi.due_date) < now)
      .sort(
        (a: BillInstance, b: BillInstance) =>
          new Date(a.due_date).getTime() - new Date(b.due_date).getTime()
      )
      .slice(0, 3);

    const upcoming = unpaid
      .filter((bi: BillInstance) => {
        const due = new Date(bi.due_date);
        return due >= now && due <= fifteenDaysLater;
      })
      .sort(
        (a: BillInstance, b: BillInstance) =>
          new Date(a.due_date).getTime() - new Date(b.due_date).getTime()
      )
      .slice(0, 3);

    return { overdueBills: overdue, upcomingBills: upcoming };
  }, [billInstances]);

  // Charts — memoized
  const monthlyData = useMemo(() => getMonthlyInsights(transactions).slice(-6), [transactions]);

  const thisMonthTransactions = useMemo(
    () => filterTransactionsByPeriod(transactions, "thisMonth"),
    [transactions]
  );

  const dashboardKpis = useMemo(
    () => calculateKpis(accounts, transactions, thisMonthTransactions),
    [accounts, transactions, thisMonthTransactions]
  );

  const spendingChartData = useMemo(() => {
    if (!Array.isArray(categoryData)) return [];
    return [...categoryData]
      .sort((a, b) => b.expenses - a.expenses)
      .slice(0, 5)
      .map((c) => ({
        name: c.name,
        value: c.expenses,
        color: c.color || "#6366f1",
      }));
  }, [categoryData]);

  const recentTransactions = useMemo(() => {
    if (!Array.isArray(transactions) || !Array.isArray(categories)) return [];
    return [...transactions]
      .sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      )
      .slice(0, 5)
      .map((tx) => {
        const cat = categories.find((c) => c.id === tx.category_id);
        return {
          ...tx,
          categoryName: cat ? cat.name : "Uncategorized",
        };
      });
  }, [transactions, categories]);

  // Tooltip rendered with stable symbol from hook
  const renderTooltip = (props: any) => (
    <GlassTooltip {...props} currencySymbol={symbol} />
  );

  if (loading && transactions.length === 0) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader size="md" text="Loading dashboard insights..." />
      </div>
    );
  }

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
        <motion.div
          variants={fadeUp}
          className="flex flex-col gap-4 md:flex-row md:justify-between md:items-center"
        >
          <div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tighter text-text-primary">
              Financial Dashboard
            </h1>
            <div className="mt-2">
              {isClient && user ? (
                <p className="text-base text-text-secondary">
                  Welcome back,{" "}
                  <span className="font-semibold text-text-primary">
                    {user.full_name}
                  </span>
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
        <motion.div
          variants={fadeUp}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {/* Net Worth */}
          <Card className="bg-card border-border shadow-sm hover:shadow-md transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-primary">
                Net Worth
              </CardTitle>
              <div className="p-2 bg-primary/10 rounded-full">
                <Wallet className="h-4 w-4 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl sm:text-3xl font-bold tracking-tighter">
                <AnimatedCounter
                  target={financialHealth.netWorth}
                  prefix={symbol}
                />
              </div>
              {financialHealth.netWorthGrowth !== null ? (
                <p className="text-xs text-text-secondary flex items-center mt-2 font-medium">
                  {financialHealth.netWorthGrowth >= 0 ? (
                    <ArrowUpRight className="h-4 w-4 text-success mr-1" />
                  ) : (
                    <ArrowDownRight className="h-4 w-4 text-danger mr-1" />
                  )}
                  <span
                    className={
                      financialHealth.netWorthGrowth >= 0
                        ? "text-success"
                        : "text-danger"
                    }
                  >
                    {financialHealth.netWorthGrowth > 0 ? "+" : ""}
                    {financialHealth.netWorthGrowth}%
                  </span>
                  <span className="ml-1 text-text-secondary">
                    vs last month
                  </span>
                </p>
              ) : (
                <p className="text-xs text-text-secondary mt-2 font-medium">
                  No prior month data
                </p>
              )}
            </CardContent>
          </Card>

          {/* Cash Flow */}
          <Card className="shadow-sm hover:shadow-md transition-all duration-300 border border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Cash Flow (This Month)
              </CardTitle>
              <div className="p-2 bg-secondary rounded-full border border-border">
                <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              <div
                className={`text-2xl sm:text-3xl font-bold tracking-tighter ${
                  financialHealth.cashFlow >= 0 ? "text-success" : "text-danger"
                }`}
              >
                <AnimatedCounter
                  target={Math.abs(financialHealth.cashFlow)}
                  prefix={
                    financialHealth.cashFlow < 0 ? `-${symbol}` : symbol
                  }
                />
              </div>
              <p className="text-xs text-text-secondary mt-2 font-medium">
                Income:{" "}
                <span className="text-text-primary">
                  {formatCurrency(financialHealth.currentIncome)}
                </span>{" "}
                | Expenses:{" "}
                <span className="text-text-primary">
                  {formatCurrency(financialHealth.currentExpense)}
                </span>
              </p>
            </CardContent>
          </Card>

          {/* Budget Health */}
          <Card className="shadow-sm hover:shadow-md transition-all duration-300 border border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Budget Health
              </CardTitle>
              <div className="p-2 bg-secondary rounded-full border border-border">
                <PiggyBank className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl sm:text-3xl font-bold tracking-tighter">
                <AnimatedCounter
                  target={budgetStats.overallPercentage}
                />
                <span>%</span>
              </div>
              <p className="text-xs text-text-secondary mt-2 font-medium">
                <span className="text-text-primary">
                  {formatCurrency(budgetStats.totalSpent)}
                </span>{" "}
                of {formatCurrency(budgetStats.totalBudget)} used
              </p>
              <Progress
                value={Math.min(100, budgetStats.overallPercentage)}
                className="h-1.5 mt-3 bg-muted"
              />
            </CardContent>
          </Card>
        </motion.div>

        {/* Charts Row */}
        <motion.div
          variants={fadeUp}
          className="grid grid-cols-1 lg:grid-cols-12 gap-6"
        >
          {/* Monthly Cash Flow */}
          <div className="lg:col-span-8">
            <Card className="shadow-sm hover:shadow-md transition-all duration-300 border border-border">
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
                  <BarChart
                    data={monthlyData}
                    margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="currentColor"
                      className="opacity-[0.05]"
                    />
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
                      tickFormatter={formatAxis}
                    />
                    <Tooltip
                      content={renderTooltip}
                      cursor={{ fill: "currentColor", opacity: 0.05 }}
                    />
                    <Bar
                      dataKey="income"
                      name="Income"
                      fill="#10b981"
                      radius={[4, 4, 0, 0]}
                      barSize={24}
                    />
                    <Bar
                      dataKey="expenses"
                      name="Expense"
                      fill="#ef4444"
                      radius={[4, 4, 0, 0]}
                      barSize={24}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Spending Distribution */}
          <div className="lg:col-span-4">
            <Card className="shadow-sm hover:shadow-md transition-all duration-300 h-full border border-border">
              <CardHeader>
                <CardTitle className="text-lg">Spending Distribution</CardTitle>
                <CardDescription>Top Categories</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px] overflow-y-auto">
                {spendingChartData.length > 0 ? (
                  <div className="space-y-4 mt-4">
                    {spendingChartData.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full flex-shrink-0"
                            style={{
                              backgroundColor: item.color.startsWith("#")
                                ? item.color
                                : "#6366f1",
                            }}
                          />
                          <span className="text-sm font-medium truncate max-w-[120px]">
                            {item.name}
                          </span>
                        </div>
                        <span className="text-sm text-text-secondary flex-shrink-0">
                          {formatCurrency(item.value)}
                        </span>
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
        <motion.div
          variants={fadeUp}
          className="grid grid-cols-1 lg:grid-cols-12 gap-6"
        >
          {/* Net Worth Trend */}
          <div className="lg:col-span-5">
            <Card className="shadow-sm hover:shadow-md transition-all duration-300 h-full border border-border">
              <CardHeader>
                <CardTitle className="text-lg">Net Cash Flow Trend</CardTitle>
                <CardDescription>Monthly income minus expenses</CardDescription>
              </CardHeader>
              <CardContent className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={monthlyData}
                    margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient
                        id="colorNet"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="#6366f1"
                          stopOpacity={0.1}
                        />
                        <stop
                          offset="95%"
                          stopColor="#6366f1"
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="currentColor"
                      className="opacity-[0.05]"
                    />
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
                      tickFormatter={formatAxis}
                    />
                    <Tooltip content={renderTooltip} />
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

          {/* Budget Progress */}
          <div className="lg:col-span-7">
            <Card className="shadow-sm hover:shadow-md transition-all duration-300 h-full border border-border">
              <CardHeader>
                <CardTitle className="text-lg">Budget Progress</CardTitle>
                <CardDescription>Monthly spending by category</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {activeBudgetSummary.slice(0, 4).map((item, index) => (
                    <div
                      key={
                        item.budget_id ||
                        `${item.category_id || item.category_name}-${index}`
                      }
                    >
                      <div className="flex justify-between text-sm mb-2 font-medium">
                        <span className="tracking-tight">
                          {item.category_name}
                        </span>
                        <span className="text-muted-foreground">
                          {formatCurrency(item.total_spent)} /{" "}
                          {formatCurrency(item.budget_amount)}
                        </span>
                      </div>
                      <Progress
                        value={item.percentage_used}
                        className="h-2.5 rounded-full"
                      />
                    </div>
                  ))}
                  {activeBudgetSummary.length === 0 && (
                    <div className="text-sm text-center text-muted-foreground py-4">
                      <p>No active budgets found.</p>
                      <Button
                        variant="link"
                        onClick={() => router.push("/dashboard/budgets")}
                        className="mt-1"
                      >
                        Create a budget
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </motion.div>

        {/* Bottom Row */}
        <motion.div
          variants={fadeUp}
          className="grid grid-cols-1 lg:grid-cols-12 gap-6"
        >
          {/* Recent Transactions */}
          <div className="lg:col-span-5">
            <Card className="shadow-sm hover:shadow-md transition-all duration-300 h-full border border-border">
              <CardHeader className="flex flex-row items-center justify-between pb-6">
                <CardTitle className="text-lg">Recent Transactions</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-primary hover:text-primary/80 hover:bg-primary/5"
                  onClick={() => router.push("/dashboard/transactions")}
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
                            transaction.type === "income"
                              ? "bg-success/10 text-success"
                              : "bg-danger/10 text-danger"
                          }`}
                        >
                          {transaction.type === "income" ? (
                            <ArrowUpRight className="h-4 w-4" />
                          ) : (
                            <ArrowDownLeft className="h-4 w-4" />
                          )}
                        </div>
                        <div>
                          <div className="font-semibold tracking-tight group-hover:text-primary transition-colors max-w-[150px] truncate">
                            {transaction.description || "No description"}
                          </div>
                          <div className="text-xs text-text-secondary mt-0.5">
                            {formatDate(transaction.date)} •{" "}
                            {transaction.categoryName}
                          </div>
                        </div>
                      </div>
                        <div
                          className={`font-semibold tracking-tight flex-shrink-0 ${
                            transaction.type === "income"
                              ? "text-success"
                              : "text-danger"
                          }`}
                        >
                        {transaction.type === "expense" ? "-" : "+"}
                        {formatCurrency(Math.abs(transaction.amount))}
                      </div>
                    </div>
                  ))}
                  {recentTransactions.length === 0 && (
                    <p className="text-sm text-center text-muted-foreground py-4">
                      No recent transactions found.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Bills Snapshot */}
          <div className="lg:col-span-3">
            <Card className="shadow-sm hover:shadow-md transition-all duration-300 h-full border border-border">
              <CardHeader className="pb-6">
                <CardTitle className="text-lg text-primary">
                  Bills Snapshot
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  Overdue and next 15 days
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-danger mb-3">
                      Overdue
                    </p>
                    <div className="space-y-3">
                      {overdueBills.length > 0 ? (
                        overdueBills.map((bill) => {
                          const billName =
                            bills.find((b) => b.id === bill.bill_id)?.name ||
                            "Bill Due";
                          return (
                            <div
                              key={bill.id}
                              className="flex items-center justify-between"
                            >
                              <div className="max-w-[120px]">
                                <div className="font-semibold tracking-tight text-text-primary truncate">
                                  {billName}
                                </div>
                                <div className="text-xs text-muted-foreground mt-0.5">
                                  {formatDate(bill.due_date)}
                                </div>
                              </div>
                              <div className="font-semibold text-danger bg-danger/10 px-2 py-1 rounded-lg flex-shrink-0">
                                {formatCurrency(bill.amount)}
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <p className="text-xs text-muted-foreground">
                          No overdue bills.
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-primary mb-3">
                      Upcoming
                    </p>
                    <div className="space-y-3">
                      {upcomingBills.length > 0 ? (
                        upcomingBills.map((bill) => {
                          const billName =
                            bills.find((b) => b.id === bill.bill_id)?.name ||
                            "Bill Due";
                          return (
                            <div
                              key={bill.id}
                              className="flex items-center justify-between"
                            >
                              <div className="max-w-[120px]">
                                <div className="font-semibold tracking-tight text-text-primary truncate">
                                  {billName}
                                </div>
                                <div className="text-xs text-muted-foreground mt-0.5">
                                  {formatDate(bill.due_date)}
                                </div>
                              </div>
                              <div className="font-semibold text-primary bg-primary/10 px-2 py-1 rounded-lg flex-shrink-0">
                                {formatCurrency(bill.amount)}
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <p className="text-xs text-muted-foreground">
                          No upcoming bills.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Financial Overview */}
          <div className="lg:col-span-4">
            <Card className="shadow-sm hover:shadow-md transition-all duration-300 h-full border border-border">
              <CardHeader className="pb-6">
                <CardTitle className="text-lg">Financial Overview</CardTitle>
                <CardDescription>Actionable health indicators</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="font-semibold tracking-tight text-text-primary">
                        Savings Rate (This Month)
                      </span>
                      <span className="text-text-secondary font-medium">
                        {dashboardKpis.savingsRate !== null
                          ? `${dashboardKpis.savingsRate}%`
                          : "N/A"}
                      </span>
                    </div>
                    <Progress
                      value={Math.max(
                        0,
                        Math.min(100, dashboardKpis.savingsRate ?? 0)
                      )}
                      className="h-2.5 rounded-full bg-muted"
                    />
                    <div className="flex justify-between text-xs text-text-secondary mt-2 font-medium">
                      <span>
                        Burn Rate: {formatCurrency(dashboardKpis.burnRateWeekly)}
                        /week
                      </span>
                      <span>
                        Runway:{" "}
                        {dashboardKpis.runwayDays !== null
                          ? `${dashboardKpis.runwayDays} days`
                          : "N/A"}
                      </span>
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
