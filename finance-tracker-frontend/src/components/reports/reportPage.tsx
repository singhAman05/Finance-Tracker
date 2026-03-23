"use client";

import { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
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
  const [pendingLoads, setPendingLoads] = useState(0);

  const accountLookup = accounts.reduce((map, acc) => {
    map[acc.id] = acc;
    return map;
  }, {} as Record<string, any>);

  const categoryLookup = categories.reduce((map, cat) => {
    map[cat.id] = cat;
    return map;
  }, {} as Record<string, any>);

  const loadAccounts = useCallback(async () => {
    if (accounts.length > 0) return;
    try {
      setPendingLoads((prev) => prev + 1);
      const data = await fetchAccounts();
      dispatch(setAccounts(data?.data || data)); // Handle both {data} and raw array
    } catch (err) {
      console.error(err);
    } finally {
      setPendingLoads((prev) => prev - 1);
    }
  }, [accounts, dispatch]);

  const loadTransactions = useCallback(async () => {
    if (transactions.length > 0) return;
    try {
      setPendingLoads((prev) => prev + 1);
      const res = await fetchTransactions();
      const txArray = res?.data || res; // Extract .data if it exists
      if (Array.isArray(txArray)) {
        const transformedData = txArray.map((tx: any) => ({
          ...tx,
          date: new Date(tx.date),
        }));
        dispatch(setTransactions(transformedData));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setPendingLoads((prev) => prev - 1);
    }
  }, [transactions, dispatch]);

  const loadCategories = useCallback(async () => {
    if (categories.length > 0) return;
    try {
      setPendingLoads((prev) => prev + 1);
      const data = await fetchCategories();
      dispatch(setCategories(data?.data || data));
    } catch (err) {
      console.error(err);
    } finally {
      setPendingLoads((prev) => prev - 1);
    }
  }, [categories, dispatch]);

  useEffect(() => {
    loadAccounts();
    loadTransactions();
    loadCategories();
  }, [loadAccounts, loadTransactions, loadCategories]);

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
        <ReportHeader
          title="Financial Reports"
          subtitle="Analyze your income, expenses, and financial trends"
          onExport={handleExport}
        />

        {pendingLoads > 0 ? (
          <div className="w-full flex items-center justify-center min-h-[400px]">
            <Loader size="md" text="Loading your financial data..." />
          </div>
        ) : transactions.length === 0 && accounts.length === 0 ? (
          <motion.div variants={fadeUp} className="w-full flex-col flex items-center justify-center min-h-[400px] bg-card border border-border rounded-3xl p-8 max-w-lg mx-auto text-center mt-12 shadow-sm">
            <PieChart className="h-16 w-16 text-muted-foreground mx-auto mb-6 opacity-50" />
            <h2 className="text-2xl font-bold mb-3 text-text-primary">No Financial Data</h2>
            <p className="text-text-secondary mb-8">
              Add transactions and accounts to review your analytics and see insights on your spending heavily.
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
