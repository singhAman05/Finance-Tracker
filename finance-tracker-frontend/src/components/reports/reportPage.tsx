"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { PieChart } from "lucide-react";

import { RootState } from "@/app/store";
import { setAccounts } from "../redux/slices/slice_accounts";
import { setCategories } from "../redux/slices/slice_categories";

import { fetchAccounts } from "@/service/service_accounts";
import { fetchTransactions } from "@/service/service_transactions";
import { fetchCategories } from "@/service/service_categories";
import { fetchBudgetSummary } from "@/service/service_budgets";
import { fetchBillInstances, fetchBills } from "@/service/service_bills";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Skeleton } from "boneyard-js/react";
import { ReportsFixture } from "@/bones/fixtures";

import ReportHeader from "@/components/reports/reportHeader";
import SummaryCards from "@/components/reports/summaryCards";
import OverviewTab from "@/components/reports/overviewTab";
import CashFlowTab from "@/components/reports/cashFlowTab";
import CategoriesTab from "@/components/reports/categoryTab";
import AccountsTab from "@/components/reports/accountsTab";
import TrendsTab from "@/components/reports/trendsTab";
import TransactionsTab from "@/components/reports/transactionTab";
import BudgetTab from "@/components/reports/budgetTab";

import {
  calculateKpis,
  exportCsv,
  exportJson,
  getAccountInsights,
  getBudgetInsights,
  getCategoryInsights,
  getDateRangeForPeriod,
  getDailyCumulativeFlow,
  getForecast,
  getMonthlyInsights,
  type ReportPeriod,
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
    transition: { duration: 0.4 },
  },
};

export default function ReportPage() {
  const dispatch = useDispatch();
  const router = useRouter();

  const accounts = useSelector((state: RootState) => state.accounts.accounts);
  const categories = useSelector((state: RootState) => state.categories.categories);

  const [budgetSummary, setBudgetSummary] = useState<any[]>([]);
  const [bills, setBills] = useState<any[]>([]);
  const [billInstances, setBillInstances] = useState<any[]>([]);
  const [reportTransactions, setReportTransactions] = useState<any[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [period, setPeriod] = useState<ReportPeriod>("last3Months");
  const [horizonDays, setHorizonDays] = useState(90);
  const [activeTab, setActiveTab] = useState("overview");

  const accountLookup = useMemo(
    () => accounts.reduce((map, acc) => ({ ...map, [acc.id]: acc }), {} as Record<string, any>),
    [accounts]
  );

  const categoryLookup = useMemo(
    () => categories.reduce((map, cat) => ({ ...map, [cat.id]: cat }), {} as Record<string, any>),
    [categories]
  );

  const loadData = async (isRefresh = false) => {
    if (isRefresh) setIsRefreshing(true);
    else setIsLoading(true);

    try {
      const dateRange = getDateRangeForPeriod(period);

      const [accRes, txRes, catRes, budgetRes, billsRes, billInstancesRes] = await Promise.allSettled([
        fetchAccounts(),
        fetchTransactions(1, 100, dateRange),
        fetchCategories(),
        fetchBudgetSummary(),
        fetchBills(),
        fetchBillInstances(),
      ]);

      if (accRes.status === "fulfilled") dispatch(setAccounts(accRes.value?.data || []));
      if (txRes.status === "fulfilled") setReportTransactions(txRes.value?.data || []);
      if (catRes.status === "fulfilled") dispatch(setCategories(catRes.value?.data || []));
      if (budgetRes.status === "fulfilled") setBudgetSummary(budgetRes.value?.data || []);
      if (billsRes.status === "fulfilled") setBills(billsRes.value?.data || []);
      if (billInstancesRes.status === "fulfilled") setBillInstances(billInstancesRes.value?.data || []);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadData(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Re-fetch transactions when period changes
  useEffect(() => {
    const fetchForPeriod = async () => {
      const dateRange = getDateRangeForPeriod(period);
      try {
        const txRes = await fetchTransactions(1, 100, dateRange);
        setReportTransactions(txRes?.data || []);
      } catch {
        // error surfaced via notifications
      }
    };
    // Skip initial mount (handled by loadData)
    if (!isLoading) {
      fetchForPeriod();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [period]);

  // Use local report transactions (not global Redux)
  const periodTransactions = reportTransactions;

  const monthlyData = useMemo(() => getMonthlyInsights(periodTransactions), [periodTransactions]);
  const dailyData = useMemo(() => getDailyCumulativeFlow(periodTransactions), [periodTransactions]);
  const categoryData = useMemo(
    () => getCategoryInsights(categories, periodTransactions),
    [categories, periodTransactions]
  );
  const accountData = useMemo(
    () => getAccountInsights(accounts, periodTransactions),
    [accounts, periodTransactions]
  );
  const budgetData = useMemo(() => getBudgetInsights(budgetSummary), [budgetSummary]);
  const forecastData = useMemo(
    () => getForecast(accounts, periodTransactions, billInstances, horizonDays),
    [accounts, periodTransactions, billInstances, horizonDays]
  );

  const kpis = useMemo(
    () => calculateKpis(accounts, periodTransactions, periodTransactions),
    [accounts, periodTransactions]
  );

  const exportCurrent = () => {
    const date = new Date().toISOString().slice(0, 10);
    if (activeTab === "categories") {
      exportCsv(
        `report-categories-${date}.csv`,
        ["Category", "Income", "Expense", "Net", "Share(%)", "TxCount"],
        categoryData.map((r) => [r.name, r.income, r.expenses, r.net, r.shareOfExpense.toFixed(2), r.txCount])
      );
      return;
    }

    if (activeTab === "accounts") {
      exportCsv(
        `report-accounts-${date}.csv`,
        ["Account", "Bank", "Income", "Expense", "Net", "Balance", "TxCount"],
        accountData.map((r) => [r.name, r.bankName, r.income, r.expenses, r.net, r.balance, r.txCount])
      );
      return;
    }

    if (activeTab === "budgets") {
      exportCsv(
        `report-budgets-${date}.csv`,
        ["Category", "Budget", "Spent", "Remaining", "Usage(%)", "Health"],
        budgetData.map((r) => [
          r.category_name,
          r.budget_amount,
          r.total_spent,
          r.remaining,
          r.percentage_used.toFixed(2),
          r.health,
        ])
      );
      return;
    }

    if (activeTab === "transactions") {
      exportCsv(
        `report-transactions-${date}.csv`,
        ["Date", "Type", "Category", "Account", "Amount", "Description"],
        periodTransactions.map((r) => [
          String(r.date),
          r.type || "expense",
          categoryLookup[r.category_id]?.name || "Unknown",
          accountLookup[r.account_id]?.name || "Unknown",
          r.amount,
          r.description || "",
        ])
      );
      return;
    }

    exportCsv(
      `report-monthly-${date}.csv`,
      ["Month", "Income", "Expenses", "Net"],
      monthlyData.map((r) => [r.month, r.income, r.expenses, r.net])
    );
  };

  const exportFullCsv = () => {
    const date = new Date().toISOString().slice(0, 10);
    exportCsv(
      `report-full-${date}.csv`,
      ["Section", "Name", "Value1", "Value2", "Value3", "Value4"],
      [
        ["kpi", "total_balance", kpis.totalBalance, "", "", ""],
        ["kpi", "income", kpis.totalIncome, "", "", ""],
        ["kpi", "expenses", kpis.totalExpenses, "", "", ""],
        ...monthlyData.map((m) => ["monthly", m.month, m.income, m.expenses, m.net, ""]),
        ...categoryData.map((c) => ["category", c.name, c.income, c.expenses, c.net, c.txCount]),
        ...accountData.map((a) => ["account", a.name, a.income, a.expenses, a.net, a.balance]),
        ...budgetData.map((b) => ["budget", b.category_name, b.budget_amount, b.total_spent, b.remaining, b.percentage_used]),
      ]
    );
  };

  const exportSnapshotJson = () => {
    const date = new Date().toISOString().slice(0, 10);
    exportJson(`report-snapshot-${date}.json`, {
      period,
      horizonDays,
      kpis,
      monthlyData,
      categoryData,
      accountData,
      budgetData,
      forecastData,
      billsCount: bills.length,
      billInstancesCount: billInstances.length,
    });
  };

  const tabs = [
    { value: "overview", label: "Overview" },
    { value: "cashflow", label: "Cash Flow" },
    { value: "budgets", label: "Budgets" },
    { value: "categories", label: "Categories" },
    { value: "accounts", label: "Accounts" },
    { value: "trends", label: "Trends" },
    { value: "transactions", label: "Transactions" },
  ];

  return (
    <div className="min-h-screen bg-background text-text-primary px-4 md:px-8 lg:px-12 py-6 md:py-8 relative overflow-hidden">
      <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle, var(--color-text-primary) 1px, transparent 1px)`,
          backgroundSize: "32px 32px",
        }}
      />

      <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="flex flex-col gap-6 relative z-10 max-w-[1280px] mx-auto w-full">
        <motion.div variants={fadeUp}>
          <ReportHeader
            title="Financial Reports"
            subtitle="Present awareness with future cash-flow insights"
            period={period}
            isRefreshing={isRefreshing}
            onPeriodChange={setPeriod}
            onRefresh={() => loadData(true)}
            onExportCurrent={exportCurrent}
            onExportFullCsv={exportFullCsv}
            onExportJson={exportSnapshotJson}
          />
        </motion.div>

        {isLoading ? (
          <Skeleton name="reports" loading={true} fixture={<ReportsFixture />}>
            <motion.div variants={fadeUp} className="w-full min-h-[400px]">
              <div className="h-[400px]" />
            </motion.div>
          </Skeleton>
        ) : reportTransactions.length === 0 ? (
          <motion.div
            variants={fadeUp}
            className="flex flex-col items-center justify-center min-h-[400px] bg-card border border-border rounded-xl p-8 max-w-lg mx-auto text-center shadow-sm"
          >
            <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-4">
              <PieChart className="h-10 w-10 text-text-secondary/50" />
            </div>
            <h2 className="text-xl font-bold mb-2 text-text-primary">No data to report yet</h2>
            <p className="text-text-secondary text-sm mb-6 max-w-xs">
              Add transactions to generate meaningful insights and forecasts.
            </p>
            <Button onClick={() => router.push("/dashboard")} className="rounded-full px-8">
              Go to Dashboard
            </Button>
          </motion.div>
        ) : (
          <>
            {/* SUMMARY CARDS */}
            <motion.div
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              <SummaryCards kpis={kpis} />
            </motion.div>

            {/* POWER CARDS */}
            <motion.div
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="w-full">
                <div className="overflow-x-auto pb-1">

                  <TabsList className="inline-flex items-center p-1 bg-muted/50 rounded-2xl border border-border mb-6 whitespace-nowrap min-w-full sm:min-w-0 w-fit">
                    {tabs.map((tab) => (
                      <TabsTrigger
                        key={tab.value}
                        value={tab.value}
                        className="px-4 sm:px-6 py-2.5 rounded-xl font-bold text-xs uppercase tracking-[0.08em]"
                      >
                        {tab.label}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </div>

                <TabsContent value="overview" className="mt-0 focus-visible:outline-none">
                  <OverviewTab
                    monthlyData={monthlyData}
                    categoryData={categoryData}
                    budgetData={budgetData}
                    forecastData={forecastData}
                  />
                </TabsContent>

                <TabsContent value="cashflow" className="mt-0 focus-visible:outline-none">
                  <CashFlowTab monthlyData={monthlyData} dailyData={dailyData} forecastData={forecastData} />
                </TabsContent>

                <TabsContent value="budgets" className="mt-0 focus-visible:outline-none">
                  <BudgetTab budgetData={budgetData} />
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
                  <TransactionsTab transactions={periodTransactions} accountMap={accountLookup} categoryMap={categoryLookup} />
                </TabsContent>
              </Tabs>
            </motion.div>
          </>
        )}
      </motion.div>
    </div>
  );
}

