"use client";

import { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setAccounts } from "../redux/slices/slice_accounts";
import { setTransactions } from "../redux/slices/slice_transactions";
import { setCategories } from "../redux/slices/slice_categories";
import { RootState } from "@/app/store";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { fetchTransactions } from "@/service/service_transactions";
import { fetchCategories } from "@/service/service_categories";
import { fetchAccounts } from "@/service/service_accounts";
import Loader from "@/utils/loader";
import { useRouter } from "next/navigation";

// Import our new components and services
import ReportHeader from "@/components/reports/reportHeader";
import SummaryCards from "@/components/reports/summaryCards";
import OverviewTab from "@/components/reports/overviewTab";
import CategoriesTab from "@/components/reports/categoryTab";
import AccountsTab from "@/components/reports/accountsTab";
import TrendsTab from "@/components/reports/trendsTab";
import TransactionsTab from "@/components/reports/transactionTab";
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
      dispatch(setAccounts(data));
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
      const data = await fetchTransactions();
      const transformedData = data.map((tx: any) => ({
        ...tx,
        date: new Date(tx.date),
      }));
      dispatch(setTransactions(transformedData));
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
      dispatch(setCategories(data));
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
  const { categoryMap, accountMap: aggregatedAccountMap, monthlyMap } =
  aggregateTransactions(transactions);

  const categoryData = getCategoryData(categories, categoryLookup);
  const accountData = getAccountData(accounts, aggregatedAccountMap);
  const monthlyData = getMonthlyData(monthlyMap);

  const summary = calculateSummaryFromAggregation(accounts, categoryLookup);

  const handleExport = () => {
    const today = new Date();
    const dateStr = today.toISOString().split("T")[0];
    exportCategoryDataToCSV(categoryData, `financial-report-${dateStr}.csv`);
  };


  return (
    <div className="w-full p-6">
      <div className="flex flex-col gap-6 relative">
        <ReportHeader
          title="Financial Reports"
          subtitle="Analyze your income, expenses, and financial trends"
          onExport={handleExport}
        />

        {pendingLoads > 0 ? (
          <div className="w-full flex items-center justify-center min-h-[400px]">
            <Loader size="md" text="Loading your financial data..." />
          </div>
        ) : (
          <>
            <SummaryCards
              totalBalance={summary.totalBalance}
              totalIncome={summary.totalIncome}
              totalExpenses={summary.totalExpenses}
              netWorthChange={summary.netWorthChange}
            />

            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-3 lg:grid-cols-5">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="categories">By Category</TabsTrigger>
                <TabsTrigger value="accounts">By Account</TabsTrigger>
                <TabsTrigger value="trends">Trends</TabsTrigger>
                <TabsTrigger value="transactions">Transactions</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="mt-6">
                <OverviewTab
                  monthlyData={monthlyData}
                  categoryData={categoryData}
                  totalExpenses={summary.totalExpenses}
                />
              </TabsContent>

              <TabsContent value="categories" className="mt-6">
                <CategoriesTab categoryData={categoryData} />
              </TabsContent>

              <TabsContent value="accounts" className="mt-6">
                <AccountsTab accountData={accountData} />
              </TabsContent>

              <TabsContent value="trends" className="mt-6">
                <TrendsTab monthlyData={monthlyData} />
              </TabsContent>

              <TabsContent value="transactions" className="mt-6">
                <TransactionsTab
                  transactions={transactions}
                  accountMap={accountLookup}
                  categoryMap={categoryLookup}
                />
              </TabsContent>
            </Tabs>
          </>
        )}
      </div>
    </div>
  );
}
