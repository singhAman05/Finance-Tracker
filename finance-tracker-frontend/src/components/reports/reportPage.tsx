"use client";

import { useEffect, useState, useRef, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion } from "framer-motion";
import { setAccounts } from "../redux/slices/slice_accounts";
import { setTransactions } from "../redux/slices/slice_transactions";
import { setCategories } from "../redux/slices/slice_categories";
import { RootState } from "@/app/store";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { fetchTransactions } from "@/service/service_transactions";
import { fetchCategories } from "@/service/service_categories";
import { fetchAccounts } from "@/service/service_accounts";
import { PieChart, RefreshCw } from "lucide-react";
import Loader from "@/utils/loader";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

import ReportHeader from "@/components/reports/reportHeader";
import SummaryCards from "@/components/reports/summaryCards";
import OverviewTab from "@/components/reports/overviewTab";
import CategoriesTab from "@/components/reports/categoryTab";
import AccountsTab from "@/components/reports/accountsTab";
import TrendsTab from "@/components/reports/trendsTab";
import TransactionsTab from "@/components/reports/transactionTab";
import CashFlowTab from "@/components/reports/cashFlowTab";
import {
  aggregateTransactions,
  getCategoryData,
  getAccountData,
  getMonthlyData,
  calculateSummaryFromAggregation,
  exportCategoryDataToCSV,
} from "@/service/service_reports";

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

export default function ReportPage() {
  const dispatch = useDispatch();
  const router = useRouter();
  const accounts = useSelector((state: RootState) => state.accounts.accounts);
  const transactions = useSelector(
    (state: RootState) => state.transactions.transactions
  );
  const categories = useSelector(
    (state: RootState) => state.categories.categories
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const hasLoadedOnce = useRef(false);

  // Safe lookup maps — memoized to avoid re-creation on every render
  const accountLookup = useMemo(
    () =>
      accounts.reduce((map, acc) => {
        map[acc.id] = acc;
        return map;
      }, {} as Record<string, any>),
    [accounts]
  );

  const categoryLookup = useMemo(
    () =>
      categories.reduce((map, cat) => {
        map[cat.id] = cat;
        return map;
      }, {} as Record<string, any>),
    [categories]
  );

  const loadData = async (isRefresh = false) => {
    if (isRefresh) {
      setIsRefreshing(true);
    } else if (!hasLoadedOnce.current) {
      setIsLoading(true);
    }

    try {
      const [accRes, txRes, catRes] = await Promise.allSettled([
        fetchAccounts(),
        fetchTransactions(),
        fetchCategories(),
      ]);

      if (accRes.status === "fulfilled" && accRes.value?.data) {
        dispatch(setAccounts(accRes.value.data));
      }
      if (txRes.status === "fulfilled" && txRes.value?.data) {
        dispatch(setTransactions(txRes.value.data));
      }
      if (catRes.status === "fulfilled" && catRes.value?.data) {
        dispatch(setCategories(catRes.value.data));
      }
    } catch (err) {
      console.error("Reports data load failed:", err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
      hasLoadedOnce.current = true;
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Derived data — all memoized ──────────────────────────────────────────

  // Current month transactions (for category/account breakdown)
  const currentMonthTransactions = useMemo(() => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    return transactions.filter((tx) => {
      const d = tx.date instanceof Date ? tx.date : new Date(tx.date);
      return d.getFullYear() === currentYear && d.getMonth() === currentMonth;
    });
  }, [transactions]);

  // All-time aggregation for trend charts
  const allTimeAggregation = useMemo(
    () => aggregateTransactions(transactions),
    [transactions]
  );

  // Current month aggregation for category/account analysis
  const currentMonthAggregation = useMemo(
    () => aggregateTransactions(currentMonthTransactions),
    [currentMonthTransactions]
  );

  const categoryData = useMemo(
    () => getCategoryData(categories, currentMonthAggregation.categoryMap),
    [categories, currentMonthAggregation.categoryMap]
  );

  const accountData = useMemo(
    () => getAccountData(accounts, allTimeAggregation.accountMap),
    [accounts, allTimeAggregation.accountMap]
  );

  const monthlyData = useMemo(
    () => getMonthlyData(allTimeAggregation.monthlyMap),
    [allTimeAggregation.monthlyMap]
  );

  const summary = useMemo(
    () => calculateSummaryFromAggregation(accounts, currentMonthAggregation.categoryMap),
    [accounts, currentMonthAggregation.categoryMap]
  );

  const handleExport = () => {
    const today = new Date();
    const dateStr = today.toISOString().slice(0, 10);
    exportCategoryDataToCSV(categoryData, `financial-report-${dateStr}.csv`);
  };

  const tabs = [
    { value: "overview", label: "Overview" },
    { value: "cashflow", label: "Cash Flow" },
    { value: "categories", label: "Categories" },
    { value: "accounts", label: "Accounts" },
    { value: "trends", label: "Trends" },
    { value: "transactions", label: "Transactions" },
  ];

  return (
    <div className="min-h-screen bg-background text-text-primary px-4 md:px-6 py-6 md:py-8 relative overflow-hidden">
      {/* Background Pattern — consistent with all dashboard pages */}
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
        className="flex flex-col gap-6 relative z-10 mx-auto w-full"
      >
        {/* Header */}
        <motion.div variants={fadeUp}>
          <ReportHeader
            title="Financial Reports"
            subtitle="Analyze your income, expenses, and financial trends"
            onExport={handleExport}
          />
        </motion.div>

        {isLoading ? (
          <motion.div
            variants={fadeUp}
            className="w-full flex items-center justify-center min-h-[400px]"
          >
            <Loader size="md" text="Loading your financial data..." />
          </motion.div>
        ) : transactions.length === 0 ? (
          <motion.div
            variants={fadeUp}
            className="flex flex-col items-center justify-center min-h-[400px] bg-card border border-border rounded-3xl p-8 max-w-lg mx-auto text-center shadow-sm"
          >
            <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-4">
              <PieChart className="h-10 w-10 text-text-secondary/50" />
            </div>
            <h2 className="text-xl font-bold mb-2 text-text-primary">
              No data to report yet
            </h2>
            <p className="text-text-secondary text-sm mb-6 max-w-xs">
              Add transactions to generate meaningful financial insights and
              visualizations.
            </p>
            <Button
              onClick={() => router.push("/dashboard")}
              className="rounded-full px-8 bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Go to Dashboard
            </Button>
          </motion.div>
        ) : (
          <>
            {/* Refreshing overlay */}
            {isRefreshing && (
              <div className="fixed inset-0 z-50 pointer-events-none flex items-start justify-center pt-8">
                <div className="flex items-center gap-2 bg-card border border-border rounded-full px-4 py-2 shadow-lg text-sm font-medium text-text-secondary">
                  <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                  Refreshing…
                </div>
              </div>
            )}

            {/* Summary Cards */}
            <motion.div variants={fadeUp}>
              <SummaryCards
                totalBalance={summary.totalBalance}
                totalIncome={summary.totalIncome}
                totalExpenses={summary.totalExpenses}
                netWorthChange={summary.netWorthChange}
              />
            </motion.div>

            {/* Tabs */}
            <motion.div variants={fadeUp}>
              <Tabs defaultValue="overview" className="w-full">
                <div className="overflow-x-auto pb-1">
                  <TabsList className="inline-flex items-center p-1 bg-muted/50 backdrop-blur-md rounded-2xl border border-border mb-6 whitespace-nowrap min-w-full sm:min-w-0 w-fit">
                    {tabs.map((tab) => (
                      <TabsTrigger
                        key={tab.value}
                        value={tab.value}
                        className="px-4 sm:px-6 py-2.5 rounded-xl font-bold text-xs uppercase tracking-[0.1em] text-text-secondary data-[state=active]:bg-card data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all whitespace-nowrap"
                      >
                        {tab.label}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </div>

                <TabsContent
                  value="overview"
                  className="mt-0 focus-visible:outline-none"
                >
                  <OverviewTab
                    monthlyData={monthlyData}
                    categoryData={categoryData}
                    totalExpenses={summary.totalExpenses}
                  />
                </TabsContent>

                <TabsContent
                  value="cashflow"
                  className="mt-0 focus-visible:outline-none"
                >
                  <CashFlowTab
                    transactions={transactions}
                    monthlyData={monthlyData}
                  />
                </TabsContent>

                <TabsContent
                  value="categories"
                  className="mt-0 focus-visible:outline-none"
                >
                  <CategoriesTab categoryData={categoryData} />
                </TabsContent>

                <TabsContent
                  value="accounts"
                  className="mt-0 focus-visible:outline-none"
                >
                  <AccountsTab accountData={accountData} />
                </TabsContent>

                <TabsContent
                  value="trends"
                  className="mt-0 focus-visible:outline-none"
                >
                  <TrendsTab monthlyData={monthlyData} />
                </TabsContent>

                <TabsContent
                  value="transactions"
                  className="mt-0 focus-visible:outline-none"
                >
                  <TransactionsTab
                    transactions={transactions}
                    accountMap={accountLookup}
                    categoryMap={categoryLookup}
                  />
                </TabsContent>
              </Tabs>
            </motion.div>
          </>
        )}
      </motion.div>
    </div>
  );
}