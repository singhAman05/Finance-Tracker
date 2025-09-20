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
    <div className="flex flex-col gap-4 md:gap-6">
      {/* Header */}
      <div className="flex flex-col gap-4 py-4 md:flex-row md:justify-between md:items-center">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white">
            Financial Dashboard
          </h1>
          <div className="mt-1">
            {isClient && user ? (
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Welcome back,{" "}
                <span className="font-semibold">{user.full_name}</span>
              </p>
            ) : (
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Welcome to your dashboard
              </p>
            )}
          </div>
        </div>

        <Button size="sm" className="gap-2 w-full md:w-auto mt-2 md:mt-0">
          <Plus size={16} />
          Add Transaction
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {/* Net Worth */}
        <Card className="bg-primary/5 border-primary/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Worth</CardTitle>
            <Wallet className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(netWorth)}</div>
            <p className="text-xs text-muted-foreground flex items-center mt-1">
              <ArrowUpRight className="h-4 w-4 text-green-500 mr-1" />
              <span>+12.5% from last month</span>
            </p>
          </CardContent>
        </Card>

        {/* Cash Flow */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cash Flow</CardTitle>
            <ArrowUpDown className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(cashFlow)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Income: {formatCurrency(income)} | Expenses:{" "}
              {formatCurrency(expenses)}
            </p>
          </CardContent>
        </Card>

        {/* Budget Health */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Budget Health</CardTitle>
            <PiggyBank className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{budgetHealth}%</div>
            <p className="text-xs text-muted-foreground mt-1">
              {formatCurrency(budgetUsed)} of {formatCurrency(budgetTotal)} used
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-6">
        {/* Monthly Cash Flow */}
        <div className="lg:col-span-8">
          <Card>
            <CardHeader>
              <CardTitle>Monthly Cash Flow</CardTitle>
              <CardDescription>
                Income vs Expenses over last 6 months
              </CardDescription>
            </CardHeader>
            <CardContent className="h-64">
              <div className="flex items-center justify-center h-full border rounded-lg bg-muted/50">
                <BarChart2 className="h-16 w-16 text-muted-foreground" />
                <span className="ml-2 text-muted-foreground">
                  Cash Flow Chart
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Spending Distribution */}
        <div className="lg:col-span-4">
          <Card>
            <CardHeader>
              <CardTitle>Spending Distribution</CardTitle>
            </CardHeader>
            <CardContent className="h-64">
              <div className="flex items-center justify-center h-full border rounded-lg bg-muted/50">
                <PieChart className="h-16 w-16 text-muted-foreground" />
                <span className="ml-2 text-muted-foreground">
                  Spending Chart
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Financial Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Net Worth Trend */}
        <div className="lg:col-span-5">
          <Card>
            <CardHeader>
              <CardTitle>Net Worth Trend</CardTitle>
              <CardDescription>12-month progression</CardDescription>
            </CardHeader>
            <CardContent className="h-64">
              <div className="flex items-center justify-center h-full border rounded-lg bg-muted/50">
                <LineChart className="h-16 w-16 text-muted-foreground" />
                <span className="ml-2 text-muted-foreground">
                  Net Worth Chart
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Budget Progress */}
        <div className="lg:col-span-7">
          <Card>
            <CardHeader>
              <CardTitle>Budget Progress</CardTitle>
              <CardDescription>Monthly spending by category</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {spendingData.map((item) => (
                  <div key={item.name}>
                    <div className="flex justify-between text-sm mb-1">
                      <span>{item.name}</span>
                      <span>{formatCurrency(item.value)}</span>
                    </div>
                    <Progress
                      value={(item.value / 2000) * 100}
                      className={`h-2 ${item.color}`}
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Recent Transactions */}
        <div className="lg:col-span-5">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Recent Transactions</CardTitle>
              <Button variant="ghost" size="sm" className="text-primary">
                View All
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentTransactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center">
                      <div
                        className={`p-2 rounded-lg mr-3 ${
                          transaction.amount > 0
                            ? "bg-green-100 text-green-600"
                            : "bg-red-100 text-red-600"
                        }`}
                      >
                        {transaction.amount > 0 ? (
                          <ArrowUpRight className="h-4 w-4" />
                        ) : (
                          <ArrowDownRight className="h-4 w-4" />
                        )}
                      </div>
                      <div>
                        <div className="font-medium">{transaction.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {transaction.date} • {transaction.category}
                        </div>
                      </div>
                    </div>
                    <div
                      className={`font-medium ${
                        transaction.amount > 0
                          ? "text-green-600"
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
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Bills</CardTitle>
              <CardDescription>Next 7 days</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {upcomingBills.map((bill) => (
                  <div
                    key={bill.id}
                    className="flex items-center justify-between"
                  >
                    <div>
                      <div className="font-medium">{bill.name}</div>
                      <div className="text-sm text-muted-foreground">
                        Due: {bill.dueDate}
                      </div>
                    </div>
                    <div className="font-medium text-red-600">
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
          <Card>
            <CardHeader>
              <CardTitle>Financial Goals</CardTitle>
              <CardDescription>Savings progress</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {financialGoals.map((goal) => {
                  const progress = (goal.current / goal.target) * 100;
                  return (
                    <div key={goal.id}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-medium">{goal.name}</span>
                        <span>{progress.toFixed(0)}%</span>
                      </div>
                      <Progress value={progress} className="h-2 bg-primary" />
                      <div className="flex justify-between text-xs text-muted-foreground mt-1">
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
      </div>
    </div>
  );
}
