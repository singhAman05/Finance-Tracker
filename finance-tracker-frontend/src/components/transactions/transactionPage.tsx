"use client";

import { useCallback, useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion, AnimatePresence, useMotionValue, useTransform, animate } from "framer-motion";
import { format } from "date-fns";
import { getTransactionStats, getFinancialHealth } from "@/service/service_transactions";
import { RootState } from "@/app/store";
import { cn, getLocaleForCurrency } from "@/lib/utils";
import { useCurrency } from "@/hooks/useCurrency";
import { useDateFormat } from "@/hooks/useDateFormat";

// Redux Actions
import { setAccounts } from "../redux/slices/slice_accounts";
import {
  setTransactions,
  removeTransaction,
} from "../redux/slices/slice_transactions";
import { setCategories } from "../redux/slices/slice_categories";

// Service Calls
import {
  fetchTransactions,
  deleteTransaction,
} from "@/service/service_transactions";
import { fetchCategories } from "@/service/service_categories";
import { fetchAccounts, getBankLogoUrl } from "@/service/service_accounts";

// UI Components
import { openModal } from "@/components/redux/slices/slice_modal";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "boneyard-js/react";
import { TransactionsFixture } from "@/bones/fixtures";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";

// Icons
import {
  Search,
  Plus,
  Trash2,
  ChartPie,
  ArrowUpRight,
  ArrowRightLeft,
  ArrowDownLeft,
  TrendingUp,
  TrendingDown,
  Filter,
  Wallet,
  Calendar,
  ArrowLeft,
  RefreshCw,
  Info,
} from "lucide-react";
import { useRouter } from "next/navigation";

// --- Animation Variants (Matching AccountsPage) ---
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

function AnimatedCounter({ target, duration = 2, locale = "en-IN" }: { target: number; duration?: number; locale?: string }) {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (v) => Math.floor(v).toLocaleString(locale));
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

// --- Local type aliases (mapped shape from service_accounts, different from DB-level interfaces) ---
type MappedAccount = {
  id: string;
  name: string;
  bank: string;
  balance?: number;
  currency?: string;
}

type MappedCategory = {
  id: string;
  name: string;
  color?: string;
}

/** Format an amount using the account's own currency, falling back to a default currency. */
function formatForAccount(amount: number, accountCurrency?: string, fallbackCurrency = "INR") {
  const currency = accountCurrency || fallbackCurrency;
  const localeMap: Record<string, string> = {
    INR: "en-IN", USD: "en-US", EUR: "de-DE", GBP: "en-GB",
  };
  return new Intl.NumberFormat(localeMap[currency] || "en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function TransactionPage() {
  const dispatch = useDispatch();
  const router = useRouter();

  // Redux State
  const accounts = useSelector((state: RootState) => state.accounts.accounts);
  const transactions = useSelector(
    (state: RootState) => state.transactions.transactions
  );
  const categories = useSelector(
    (state: RootState) => state.categories.categories
  );

  // Local State
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const { type: modalType } = useSelector((state: RootState) => state.modal);
  const [search, setSearch] = useState("");
  const [accountFilter, setAccountFilter] = useState<"all" | string>("all");
  const [categoryFilter, setCategoryFilter] = useState<"all" | string>("all");

  // For Delete Dialog
  const [deleteData, setDeleteData] = useState<{
    id: string;
    description: string;
  } | null>(null);

  const PAGE_SIZE = 20;

  // --- Mappers ---
  const accountMap = useMemo(
    () =>
      accounts.reduce((map, acc) => {
        map[acc.id] = acc;
        return map;
      }, {} as Record<string, MappedAccount>),
    [accounts]
  );

  const categoryMap = useMemo(
    () =>
      categories.reduce((map, cat) => {
        map[cat.id] = cat;
        return map;
      }, {} as Record<string, MappedCategory>),
    [categories]
  );

  // --- Data Loading ---
  const loadData = useCallback(
    async (isRefresh = false) => {
      try {
        if (isRefresh) setIsRefreshing(true);
        else setIsLoading(true);

        const [accRes, txRes, catRes] = await Promise.all([
          accounts.length === 0 || isRefresh
            ? fetchAccounts()
            : Promise.resolve({ data: accounts }),
          fetchTransactions(1, PAGE_SIZE),
          categories.length === 0 || isRefresh
            ? fetchCategories()
            : Promise.resolve({ data: categories }),
        ]);

        if (accounts.length === 0 || isRefresh)
          dispatch(setAccounts(accRes?.data ?? []));
        dispatch(setTransactions(txRes?.data ?? []));
        if (categories.length === 0 || isRefresh)
          dispatch(setCategories(catRes?.data ?? []));

        setCurrentPage(1);
        const pagination = txRes?.pagination;
        setHasMore(pagination ? pagination.page < pagination.pages : false);
      } catch (err) {
        // Error surfaced via notifications
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [dispatch, accounts, categories]
  );

  const loadMore = useCallback(async () => {
    if (isLoadingMore || !hasMore) return;
    setIsLoadingMore(true);
    try {
      const nextPage = currentPage + 1;
      const txRes = await fetchTransactions(nextPage, PAGE_SIZE);
      if (txRes?.data?.length) {
        dispatch(setTransactions([...transactions, ...txRes.data]));
        setCurrentPage(nextPage);
        const pagination = txRes.pagination;
        setHasMore(pagination ? pagination.page < pagination.pages : false);
      } else {
        setHasMore(false);
      }
    } catch {
      // Error surfaced via notifications
    } finally {
      setIsLoadingMore(false);
    }
  }, [isLoadingMore, hasMore, currentPage, transactions, dispatch]);

  // --- Refresh on Modal Close ---
  const [prevModalType, setPrevModalType] = useState<string | null>(null);
  useEffect(() => {
    if (prevModalType === "ADD_TRANSACTION" && modalType === null) {
      loadData(true);
    }
    setPrevModalType(modalType);
  }, [modalType, prevModalType, loadData]);

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --- Filtering & Stats ---
  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      const account = accountMap[tx.account_id];
      const category = categoryMap[tx.category_id];

      const searchLower = search.toLowerCase();
      const matchText =
        (tx.description || "").toLowerCase().includes(searchLower) ||
        (category?.name || "").toLowerCase().includes(searchLower) ||
        (account?.name || "").toLowerCase().includes(searchLower);

      const matchAccount =
        accountFilter === "all" || tx.account_id === accountFilter;
      const matchCategory =
        categoryFilter === "all" || tx.category_id === categoryFilter;

      return matchText && matchAccount && matchCategory;
    }).sort((a, b) => {
      const dateDiff = new Date(b.date).getTime() - new Date(a.date).getTime();
      if (dateDiff !== 0) return dateDiff;
      // Secondary sort: higher ID (newer insert) first
      return b.id.localeCompare(a.id);
    });
  }, [
    transactions,
    accountMap,
    categoryMap,
    search,
    accountFilter,
    categoryFilter,
  ]);

  const stats = useMemo(
    () => getTransactionStats(filteredTransactions, accounts),
    [filteredTransactions, accounts]
  );

  const financialHealth = useMemo(
    () => getFinancialHealth(filteredTransactions, accounts),
    [filteredTransactions, accounts]
  );

  // --- Handlers ---
  const confirmDelete = async () => {
    if (!deleteData) return;
    try {
      dispatch(removeTransaction(deleteData.id)); // Optimistic update
      await deleteTransaction(deleteData.id);
      // Re-fetch accounts to update balances/net worth after deletion
      const accRes = await fetchAccounts();
      if (accRes?.data) dispatch(setAccounts(accRes.data));
    } catch (err) {
      loadData(true); // Revert on error
    } finally {
      setDeleteData(null);
    }
  };

  const { formatCurrency, symbol, currency } = useCurrency();
  const { formatDate } = useDateFormat();

  // --- Render ---
  return (
    <Skeleton name="transactions" loading={isLoading && transactions.length === 0} fixture={<TransactionsFixture />}>
    <div className="min-h-screen bg-background text-text-primary relative overflow-hidden">
      {/* Background Pattern matched from page.tsx */}
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
        className="relative w-full space-y-6 px-4 md:px-8 lg:px-12 py-6 md:py-8 max-w-[1280px] mx-auto"
      >
      {/* Delete Dialog */}
      <AlertDialog
        open={!!deleteData}
        onOpenChange={(open: boolean) => !open && setDeleteData(null)}
      >
        <AlertDialogContent className="bg-card border border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-text-primary tracking-tight">
              Are you absolutely sure?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-text-secondary">
              This will permanently delete the transaction
              <span className="font-bold text-text-primary">
                {" "}
                {deleteData?.description}{" "}
              </span>
              and remove it from your history. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-full border border-border bg-card text-text-primary hover:bg-muted transition-colors">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="rounded-full bg-danger hover:bg-danger/90 text-white font-medium shadow-sm transition-colors"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <motion.div variants={fadeUp} className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-end">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => router.push("/dashboard")}
            className="rounded-full border border-border bg-card text-text-primary hover:bg-muted h-10 px-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-text-primary">
            Transactions
          </h1>
          <p className="text-text-secondary mt-1">
            Track your cash flow and spending habits.
          </p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="outline"
            size="icon"
            onClick={() => loadData(true)}
            className={cn(
              "rounded-full border border-border bg-card text-text-primary hover:bg-muted",
              isRefreshing && "animate-spin"
            )}
            disabled={isRefreshing}
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            className="rounded-full border border-border bg-card text-text-primary hover:bg-muted shadow-sm"
            onClick={() => router.push("/dashboard/reports")}
          >
            <ChartPie className="mr-2 h-4 w-4" /> Analytics
          </Button>
          <Button
            onClick={() => dispatch(openModal({ type: "ADD_TRANSACTION" }))}
            className="group bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-6 shadow-md transition-all hover:shadow-xl active:scale-95 flex items-center gap-2 h-10"
          >
            <Plus className="h-4 w-4 transition-transform group-hover:rotate-90" />
            Add Transaction
          </Button>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          {
            label: "Total Income",
            value: stats.income,
            icon: ArrowDownLeft,
            trend: financialHealth.incomeGrowth,
            trendLabel: "vs last month",
            tooltip: "Total money received this month across all accounts. Compared with last month to show growth.",
          },
          {
            label: "Total Expenses",
            value: stats.expense,
            icon: ArrowUpRight,
            trend: financialHealth.expenseGrowth,
            trendLabel: "vs last month",
            tooltip: "Total money spent this month across all accounts. A decrease in expenses is shown in green.",
          },
          {
            label: "Net Flow",
            value: stats.net,
            icon: Wallet,
            trend: null, 
            trendLabel: "",
            tooltip: "Income minus expenses for this month. Positive means you saved money, negative means you overspent.",
          },
        ].map((stat, idx) => (
          <motion.div
            key={idx}
            variants={fadeUp}
            whileHover={{ y: -4 }}
            className="cursor-default"
          >
            <div className="p-6 rounded-2xl bg-card border border-border hover:border-ring transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-1.5">
                  <p className="text-xs font-medium uppercase tracking-widest text-text-secondary">
                    {stat.label}
                  </p>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-3.5 w-3.5 text-text-secondary/40 cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent side="top" className="max-w-[220px]">
                      {stat.tooltip}
                    </TooltipContent>
                  </Tooltip>
                </div>
                <div className="w-8 h-8 rounded-full bg-card border border-border flex items-center justify-center">
                  <stat.icon className="h-4 w-4 text-text-primary" />
                </div>
              </div>

              <div className="text-2xl sm:text-3xl font-bold tracking-tighter text-text-primary mb-2">
                {symbol}<AnimatedCounter target={Math.abs(stat.value)} locale={getLocaleForCurrency(currency)} />
              </div>

              {stat.trend !== null && (
                 <div className="flex items-center text-xs">
                 <span
                   className={cn(
                     "font-medium mr-1",
                     stat.trend > 0
                       ? stat.label === "Total Expenses" ? "text-red-500" : "text-emerald-500"
                       : stat.label === "Total Expenses" ? "text-emerald-500" : "text-red-500"
                   )}
                 >
                   {stat.trend > 0 ? "+" : ""}
                   {stat.trend}%
                 </span>
                 <span className="text-text-secondary">{stat.trendLabel}</span>
               </div>
              )}
              {stat.trend === null && stat.trendLabel && (
                <div className="flex items-center text-xs">
                  <span className="text-text-secondary">No data for prev. month</span>
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Main Content */}
      <motion.div variants={fadeUp}>
        <Card className="overflow-hidden border border-border shadow-none bg-card">
          <CardHeader className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 border-b border-border bg-card px-6 py-4">
            <div className="flex items-center gap-2">
              <CardTitle className="text-lg font-semibold text-text-primary">History</CardTitle>
              <Badge variant="outline" className="ml-2 font-normal border-border text-text-secondary">
                {filteredTransactions.length} items
              </Badge>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3 w-full xl:w-auto">
              <div className="relative flex-1 sm:min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary" />
                <Input
                  placeholder="Search description..."
                  className="pl-10 bg-background border-border rounded-full focus-visible:ring-1 focus-visible:ring-ring transition-all font-medium placeholder:text-text-secondary"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              <Select
                value={accountFilter}
                onValueChange={(v) => setAccountFilter(v)}
              >
                <SelectTrigger className="w-full sm:w-[160px] rounded-full bg-background border-border text-text-primary">
                  <SelectValue placeholder="Account" />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  <SelectItem value="all" className="text-text-primary">All Accounts</SelectItem>
                  {accounts.map((acc) => (
                    <SelectItem key={acc.id} value={acc.id} className="text-text-primary">
                      {acc.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={categoryFilter}
                onValueChange={(v) => setCategoryFilter(v)}
              >
                <SelectTrigger className="w-full sm:w-[160px] rounded-full bg-background border-border text-text-primary">
                  <div className="flex items-center gap-2">
                    <Filter className="h-3.5 w-3.5 text-text-secondary" />
                    <SelectValue placeholder="Category" />
                  </div>
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  <SelectItem value="all" className="text-text-primary">All Categories</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id} className="text-text-primary">
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            {filteredTransactions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <div className="bg-muted p-4 rounded-full mb-4">
                  {search || accountFilter !== "all" || categoryFilter !== "all" ? (
                    <Search className="h-8 w-8 text-text-secondary" />
                  ) : (
                    <ArrowRightLeft className="h-8 w-8 text-text-secondary" />
                  )}
                </div>
                <h3 className="text-lg font-semibold text-text-primary">
                  {search || accountFilter !== "all" || categoryFilter !== "all" ? "No results found" : "No transactions yet"}
                </h3>
                <p className="text-text-secondary text-sm max-w-xs mt-2 px-4">
                  {search || accountFilter !== "all" || categoryFilter !== "all"
                    ? `We couldn't find any transactions matching your current filters.`
                    : "Start tracking your expenses and income by adding your first transaction."}
                </p>
                <div className="mt-6">
                  {search || accountFilter !== "all" || categoryFilter !== "all" ? (
                    <Button
                      variant="outline"
                      onClick={() => { setSearch(""); setAccountFilter("all"); setCategoryFilter("all"); }}
                      className="rounded-full border-border bg-card text-text-primary hover:bg-muted"
                    >
                      Clear all filters
                    </Button>
                  ) : (
                    <Button
                      onClick={() => dispatch(openModal({ type: "ADD_TRANSACTION" }))}
                      className="group bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-6 shadow-md transition-all hover:shadow-xl active:scale-95 flex items-center gap-2"
                    >
                      <Plus className="h-4 w-4 transition-transform group-hover:rotate-90" />
                      Add Transaction
                    </Button>
                  )}
                </div>
              </div>
            ) : (
              <>
                {/* Mobile card list (< md) */}
                <div className="md:hidden divide-y divide-border">
                  <AnimatePresence mode="popLayout">
                    {filteredTransactions.map((tx) => {
                      const account = accountMap[tx.account_id];
                      const category = categoryMap[tx.category_id];
                      const isExpense = tx.type === "expense";
                      const displayAmount = Math.abs(tx.amount);
                      const txAmount = formatForAccount(displayAmount, account?.currency, currency);
                      return (
                        <motion.div
                          key={tx.id}
                          layout
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0, x: -20 }}
                          className="flex items-center gap-3 px-4 py-3.5"
                        >
                          <div className={cn(
                            "w-9 h-9 rounded-xl flex items-center justify-center shrink-0",
                            isExpense ? "bg-danger/10" : "bg-success/10"
                          )}>
                            {isExpense
                              ? <ArrowUpRight className="h-4 w-4 text-danger" />
                              : <ArrowDownLeft className="h-4 w-4 text-success" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-sm text-text-primary truncate">
                              {tx.description || category?.name || "Transaction"}
                            </p>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className="text-[11px] text-text-secondary">{formatDate(tx.date)}</span>
                              <span className="text-text-secondary/40">·</span>
                              <span className="text-[11px] text-text-secondary truncate">{category?.name || "Uncategorized"}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0 ml-2">
                            <span className={cn("font-mono font-bold text-xs sm:text-sm whitespace-nowrap", isExpense ? "text-danger" : "text-success")}>
                              {isExpense ? "-" : "+"}{txAmount}
                            </span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 rounded-full text-text-secondary hover:text-danger hover:bg-danger/5"
                              onClick={() => setDeleteData({ id: tx.id, description: tx?.description || category?.name })}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>

                {/* Load More (mobile) */}
                {hasMore && (
                  <div className="md:hidden flex justify-center py-4">
                    <Button
                      variant="outline"
                      onClick={loadMore}
                      disabled={isLoadingMore}
                      className="min-w-[140px]"
                    >
                      {isLoadingMore ? (
                        <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                      ) : null}
                      {isLoadingMore ? "Loading..." : "Load More"}
                    </Button>
                  </div>
                )}

                {/* Desktop table (>= md) */}
                <div className="hidden md:block overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="hover:bg-transparent border-b border-border bg-transparent">
                        <TableHead className="w-[150px] pl-8 py-5 text-xs font-semibold uppercase tracking-wider text-text-secondary">Date</TableHead>
                        <TableHead className="text-xs font-semibold uppercase tracking-wider text-text-secondary">Description</TableHead>
                        <TableHead className="text-left text-xs font-semibold uppercase tracking-wider text-text-secondary">Category</TableHead>
                        <TableHead className="text-left text-xs font-semibold uppercase tracking-wider text-text-secondary">Account</TableHead>
                        <TableHead className="text-right pr-8 text-xs font-semibold uppercase tracking-wider text-text-secondary">Amount</TableHead>
                        <TableHead className="text-right pr-8 text-xs font-semibold uppercase tracking-wider text-text-secondary">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <AnimatePresence mode="popLayout">
                        {filteredTransactions.map((tx) => {
                          const account = accountMap[tx.account_id];
                          const category = categoryMap[tx.category_id];
                          const isExpense = tx.type === "expense";
                          const displayAmount = Math.abs(tx.amount);
                          const txAmount = formatForAccount(displayAmount, account?.currency, currency);
                          return (
                            <motion.tr
                              key={tx.id}
                              layout
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0, x: -20 }}
                              className="group hover:bg-muted transition-colors border-b border-border last:border-0"
                            >
                              <TableCell className="pl-6 py-4">
                                <div className="flex items-center text-sm text-text-secondary">
                                  <Calendar className="mr-2 h-3.5 w-3.5 text-text-secondary" />
                                  {formatDate(tx.date)}
                                </div>
                              </TableCell>
                              <TableCell>
                                <span className="font-medium text-sm text-text-primary">{tx.description || `${category?.name} ${tx.type}`}</span>
                              </TableCell>
                              <TableCell>
                                <Badge variant="secondary" className="font-normal text-xs bg-muted text-text-secondary hover:bg-muted/80 border-0">
                                  {category?.name || "Uncategorized"}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <div className="h-6 w-6 rounded-md bg-card border border-border p-0.5 flex items-center justify-center shadow-sm">
                                    <img src={getBankLogoUrl(account?.bank)} alt="Bank" className="h-full w-full object-contain" />
                                  </div>
                                  <span className="text-sm text-text-secondary truncate max-w-[120px]">{account?.name || "account not found"}</span>
                                </div>
                              </TableCell>
                              <TableCell className="text-right pr-8">
                                <span className={cn("font-mono font-medium tracking-tight whitespace-nowrap", isExpense ? "text-danger" : "text-success")}>
                                  {isExpense ? "-" : "+"}{txAmount}
                                </span>
                              </TableCell>
                              <TableCell className="text-right pr-8">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-9 w-9 rounded-full text-text-secondary hover:text-danger hover:bg-card hover:shadow-sm transition-all border border-transparent hover:border-danger/20"
                                  onClick={() => setDeleteData({ id: tx.id, description: tx?.description || category?.name })}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </TableCell>
                            </motion.tr>
                          );
                        })}
                      </AnimatePresence>
                    </TableBody>
                  </Table>
                </div>
                {hasMore && (
                  <div className="flex justify-center py-4">
                    <Button
                      variant="outline"
                      onClick={loadMore}
                      disabled={isLoadingMore}
                      className="min-w-[140px]"
                    >
                      {isLoadingMore ? (
                        <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                      ) : null}
                      {isLoadingMore ? "Loading..." : "Load More"}
                    </Button>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </motion.div>
      </motion.div>
    </div>
    </Skeleton>
  );
}
