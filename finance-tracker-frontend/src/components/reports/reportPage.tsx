"use client";

import { useEffect, useState, useRef } from "react";
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
import { PieChart } from "lucide-react";
import Loader from "@/utils/loader";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

// Import our new components and services
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

  const accountLookup = accounts.reduce((map, acc) => {
    map[acc.id] = acc;
    return map;
  }, {} as Record<string, any>);

  const categoryLookup = categories.reduce((map, cat) => {
    map[cat.id] = cat;
    return map;
  }, {} as Record<string, any>);

  useEffect(() => {
    let mounted = true;

    const loadData = async () => {
      if (hasLoadedOnce.current) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }
      const tasks: Promise<void>[] = [
        fetchAccounts()
          .then((data) => {
            const payload = data?.data || data;
            dispatch(setAccounts(Array.isArray(payload) ? payload : []));
          })
          .catch((err) => console.error(err)),
        fetchTransactions()
          .then((res) => {
            const txArray = res?.data || res;
            if (Array.isArray(txArray)) {
              dispatch(setTransactions(txArray));
            } else {
              dispatch(setTransactions([]));
            }
          })
          .catch((err) => console.error(err)),
        fetchCategories()
          .then((data) => {
            const payload = data?.data || data;
            dispatch(setCategories(Array.isArray(payload) ? payload : []));
          })
          .catch((err) => console.error(err)),
      ];

      await Promise.allSettled(tasks);
      if (mounted) {
        setIsLoading(false);
        setIsRefreshing(false);
        hasLoadedOnce.current = true;
      }
    };

    loadData();
    return () => {
      mounted = false;
    };
  }, [dispatch]);

  // Calculate all data using our service functions
  const currentMonthTransactions = transactions.filter(tx => {
    const txDate = tx.date instanceof Date ? tx.date : new Date(tx.date);
    const now = new Date();
    return txDate.getMonth() === now.getMonth() && txDate.getFullYear() === now.getFullYear();
  });

  const { categoryMap, accountMap: aggregatedAccountMap, monthlyMap } =
  aggregateTransactions(transactions); // Use all transactions for historical trends

  const { categoryMap: currentCategoryMap } = aggregateTransactions(currentMonthTransactions);

  const categoryData = getCategoryData(categories, currentCategoryMap);
  const accountData = getAccountData(accounts, aggregatedAccountMap);
  const monthlyData = getMonthlyData(monthlyMap);

  const summary = calculateSummaryFromAggregation(accounts, currentCategoryMap);

  const handleExport = () => {
    const today = new Date();
    const dateStr = today.toISOString().split("T")[0];
    exportCategoryDataToCSV(categoryData, `financial-report-${dateStr}.csv`);
  };


  // --- Animation Variants ---
  const staggerContainer = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.1 } },
  };

  const fadeUp = {
    hidden: { opacity: 0, y: 24 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] as const },
    },
  };

  return (
    <div className="min-h-screen bg-background text-text-primary relative overflow-hidden">
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
        className="relative w-full p-2 md:p-6 space-y-6 mx-auto z-10"
      >
        {isRefreshing && (
          <div className="pointer-events-none absolute inset-0 z-20 rounded-2xl bg-background/35 backdrop-blur-[1px] flex items-center justify-center">
            <Loader size="sm" text="Refreshing report..." />
          </div>
        )}
        <ReportHeader
          title="Financial Reports"
          subtitle="Analyze your income, expenses, and financial trends"
          onExport={handleExport}
        />

        {isLoading ? (
          <div className="w-full flex items-center justify-center min-h-[400px]">
            <Loader size="md" text="Loading your financial data..." />
          </div>
        ) : transactions.length === 0 ? (
          <motion.div variants={fadeUp} className="w-full flex-col flex items-center justify-center min-h-[400px] bg-card border border-border rounded-3xl p-8 max-w-lg mx-auto text-center mt-12 shadow-sm">
            <PieChart className="h-16 w-16 text-muted-foreground mx-auto mb-6 opacity-50" />
            <h2 className="text-2xl font-bold mb-3 text-text-primary">Not enough data to generate a report</h2>
            <p className="text-text-secondary mb-8">
              Add some transactions to generate meaningful report insights.
            </p>
            <Button 
              onClick={() => router.push("/dashboard")}
              className="w-full max-w-[200px] mx-auto h-12 bg-primary text-primary-foreground font-bold rounded-xl flex items-center justify-center gap-2 cursor-pointer hover:bg-primary/90 transition-colors"
            >
              Go to Dashboard
            </Button>
          </motion.div>
        ) : (
          <>
            <motion.div variants={fadeUp}>
              <SummaryCards
                totalBalance={summary.totalBalance}
                totalIncome={summary.totalIncome}
                totalExpenses={summary.totalExpenses}
                netWorthChange={summary.netWorthChange}
              />
            </motion.div>

            <motion.div variants={fadeUp}>
              <Tabs defaultValue="overview" className="w-full">
                <TabsList className="flex items-center justify-start p-1 bg-muted/50 backdrop-blur-md rounded-2xl border border-border w-fit mb-6 overflow-x-auto max-w-full no-scrollbar">
                  {[
                    { value: "overview", label: "Overview" },
                    { value: "cashflow", label: "Cash Flow" },
                    { value: "categories", label: "By Category" },
                    { value: "accounts", label: "By Account" },
                    { value: "trends", label: "Trends" },
                    { value: "transactions", label: "Transactions" }
                  ].map((tab) => (
                    <TabsTrigger 
                      key={tab.value}
                      value={tab.value} 
                      className="px-6 py-2.5 rounded-xl font-bold text-xs uppercase tracking-[0.1em] text-text-secondary data-[state=active]:bg-card data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all whitespace-nowrap"
                    >
                      {tab.label}
                    </TabsTrigger>
                  ))}
                </TabsList>

                <TabsContent value="overview" className="mt-0 focus-visible:outline-none">
                  <OverviewTab
                    monthlyData={monthlyData}
                    categoryData={categoryData}
                    totalExpenses={summary.totalExpenses}
                  />
                </TabsContent>

                <TabsContent value="cashflow" className="mt-0 focus-visible:outline-none">
                  <CashFlowTab 
                    transactions={transactions} 
                    monthlyData={monthlyData} 
                  />
                </TabsContent>

                <TabsContent value="categories" className="mt-0 focus-visible:outline-none">
                  <CategoriesTab categoryData={categoryData} />
                </TabsContent>

                <TabsContent value="accounts" className="mt-0 focus-visible:outline-none">
                  <AccountsTab accountData={accountData} />
                </TabsContent>

                <TabsContent value="trends" className="mt-0 focus-visible:outline-none">
                  <TrendsTab monthlyData={monthlyData} />
                </TabsContent>

                <TabsContent value="transactions" className="mt-0 focus-visible:outline-none">
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
