// components/dashboard/dashboard.tsx
"user client";

import { useEffect, useState } from "react";
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
import { useSelector } from "react-redux";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";

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
  const rounded = useTransform(count, (v) => `${prefix}${Math.floor(v).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`);
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
  const [isClient, setIsClient] = useState(false);
  const user = useSelector((state: RootState) => state.auth.user);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Dummy data
  const netWorth = 45231.89;
  const cashFlow = 1234.56;
  const income = 5000;
  const expenses = 3765.44;
  const budgetHealth = 78;
  const budgetUsed = 3765;
  const budgetTotal = 4800;

  const spendingData = [
    { name: "Housing", value: 1200, color: "bg-blue-500" },
    { name: "Food", value: 750, color: "bg-green-500" },
    { name: "Transport", value: 450, color: "bg-yellow-500" },
    { name: "Entertainment", value: 300, color: "bg-purple-500" },
    { name: "Utilities", value: 200, color: "bg-orange-500" },
  ];

  const recentTransactions = [
    {
      id: 1,
      name: "Grocery Store",
      date: "2023-06-15",
      amount: -86.75,
      category: "Food",
    },
    {
      id: 2,
      name: "Salary Deposit",
      date: "2023-06-10",
      amount: 2500.0,
      category: "Income",
    },
    {
      id: 3,
      name: "Electric Bill",
      date: "2023-06-08",
      amount: -120.3,
      category: "Utilities",
    },
    {
      id: 4,
      name: "Coffee Shop",
      date: "2023-06-05",
      amount: -5.25,
      category: "Food",
    },
    {
      id: 5,
      name: "Gas Station",
      date: "2023-06-03",
      amount: -45.0,
      category: "Transport",
    },
  ];

  const upcomingBills = [
    { id: 1, name: "Rent Payment", dueDate: "2023-07-01", amount: 1200.0 },
    { id: 2, name: "Netflix", dueDate: "2023-06-20", amount: 15.99 },
    { id: 3, name: "Car Insurance", dueDate: "2023-06-25", amount: 89.5 },
  ];

  const financialGoals = [
    {
      id: 1,
      name: "Emergency Fund",
      target: 10000,
      current: 6500,
      deadline: "2024-12-31",
    },
    {
      id: 2,
      name: "Vacation Fund",
      target: 3000,
      current: 1200,
      deadline: "2023-11-15",
    },
    {
      id: 3,
      name: "New Laptop",
      target: 1500,
      current: 800,
      deadline: "2023-09-30",
    },
  ];

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
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

          <Button size="lg" className="gap-2 w-full md:w-auto shadow-lg hover:shadow-xl transition-all duration-300 rounded-full">
            <Plus size={18} />
            Add Transaction
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
                <AnimatedCounter target={netWorth} prefix="$" />
              </div>
              <p className="text-xs text-muted-foreground flex items-center mt-2 font-medium">
                <ArrowUpRight className="h-4 w-4 text-emerald-500 mr-1" />
                <span className="text-emerald-500">+12.5%</span>
                <span className="ml-1">from last month</span>
              </p>
            </CardContent>
          </Card>

          {/* Cash Flow */}
          <Card className="shadow-sm hover:shadow-md transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Cash Flow</CardTitle>
              <div className="p-2 bg-secondary rounded-full">
                <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold tracking-tighter text-emerald-600">
                <AnimatedCounter target={cashFlow} prefix="$" />
              </div>
              <p className="text-xs text-muted-foreground mt-2 font-medium">
                Income: <span className="text-foreground">{formatCurrency(income)}</span> | Expenses:{" "}
                <span className="text-foreground">{formatCurrency(expenses)}</span>
              </p>
            </CardContent>
          </Card>

          {/* Budget Health */}
          <Card className="shadow-sm hover:shadow-md transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Budget Health</CardTitle>
              <div className="p-2 bg-secondary rounded-full">
                <PiggyBank className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold tracking-tighter">
                <AnimatedCounter target={budgetHealth} />
                <span>%</span>
              </div>
              <p className="text-xs text-muted-foreground mt-2 font-medium">
                <span className="text-foreground">{formatCurrency(budgetUsed)}</span> of {formatCurrency(budgetTotal)} used
              </p>
              <Progress value={budgetHealth} className="h-1.5 mt-3 bg-secondary" />
            </CardContent>
          </Card>
        </motion.div>

        {/* Charts Row */}
        <motion.div variants={fadeUp} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Monthly Cash Flow */}
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
                    <span className="font-medium">Cash Flow Chart</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Spending Distribution */}
          <div className="lg:col-span-4">
            <Card className="shadow-sm hover:shadow-md transition-all duration-300 h-full">
              <CardHeader>
                <CardTitle className="text-lg">Spending Distribution</CardTitle>
                <CardDescription>By category</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <div className="flex items-center justify-center h-full border-2 border-dashed border-muted rounded-xl bg-muted/20">
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <PieChart className="h-10 w-10" />
                    <span className="font-medium">Spending Chart</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </motion.div>

        {/* Financial Overview */}
        <motion.div variants={fadeUp} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Net Worth Trend */}
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
                    <span className="font-medium">Net Worth Chart</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Budget Progress */}
          <div className="lg:col-span-7">
            <Card className="shadow-sm hover:shadow-md transition-all duration-300 h-full">
              <CardHeader>
                <CardTitle className="text-lg">Budget Progress</CardTitle>
                <CardDescription>Monthly spending by category</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {spendingData.map((item) => (
                    <div key={item.name}>
                      <div className="flex justify-between text-sm mb-2 font-medium">
                        <span className="tracking-tight">{item.name}</span>
                        <span className="text-muted-foreground">{formatCurrency(item.value)}</span>
                      </div>
                      <Progress
                        value={(item.value / 2000) * 100}
                        className={`h-2.5 rounded-full ${item.color.replace('bg-', 'bg-')}`} // Ensuring bg classes work
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
          {/* Recent Transactions */}
          <div className="lg:col-span-5">
            <Card className="shadow-sm hover:shadow-md transition-all duration-300 h-full">
              <CardHeader className="flex flex-row items-center justify-between pb-6">
                <CardTitle className="text-lg">Recent Transactions</CardTitle>
                <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80 hover:bg-primary/10">
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
                          <div className="font-semibold tracking-tight group-hover:text-primary transition-colors">{transaction.name}</div>
                          <div className="text-xs text-muted-foreground mt-0.5">
                            {transaction.date} • {transaction.category}
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
                        {formatCurrency(transaction.amount)}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Upcoming Bills */}
          <div className="lg:col-span-3">
            <Card className="shadow-sm hover:shadow-md transition-all duration-300 h-full bg-slate-900 text-white dark:bg-slate-950">
              <CardHeader className="pb-6">
                <CardTitle className="text-lg text-white">Upcoming Bills</CardTitle>
                <CardDescription className="text-slate-400">Next 7 days</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {upcomingBills.map((bill) => (
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

          {/* Financial Goals */}
          <div className="lg:col-span-4">
            <Card className="shadow-sm hover:shadow-md transition-all duration-300 h-full">
              <CardHeader className="pb-6">
                <CardTitle className="text-lg">Financial Goals</CardTitle>
                <CardDescription>Savings progress</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {financialGoals.map((goal) => {
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
