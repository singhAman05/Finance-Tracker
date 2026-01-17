"use client";

import { useCallback, useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { getTransactionStats } from "@/service/service_transactions";
import { RootState } from "@/app/store";
import { cn } from "@/lib/utils";

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
import AddTransaction from "./addTransaction";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
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

// Icons
import {
  Search,
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
  RefreshCw,
} from "lucide-react";
import { useRouter } from "next/navigation";

// --- Animation Variants (Matching AccountsPage) ---
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const itemVariants = {
  hidden: { y: 10, opacity: 0, filter: "blur(4px)" },
  visible: { y: 0, opacity: 1, filter: "blur(0px)" },
};

// --- Interfaces ---
interface Account {
  id: string;
  name: string;
  bank: string;
  balance?: number;
}

interface Category {
  id: string;
  name: string;
  color?: string;
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
  const [search, setSearch] = useState("");
  const [accountFilter, setAccountFilter] = useState<"all" | string>("all");
  const [categoryFilter, setCategoryFilter] = useState<"all" | string>("all");

  // For Delete Dialog
  const [deleteData, setDeleteData] = useState<{
    id: string;
    description: string;
  } | null>(null);

  // --- Mappers ---
  const accountMap = useMemo(
    () =>
      accounts.reduce((map, acc) => {
        map[acc.id] = acc;
        return map;
      }, {} as Record<string, Account>),
    [accounts]
  );

  const categoryMap = useMemo(
    () =>
      categories.reduce((map, cat) => {
        map[cat.id] = cat;
        return map;
      }, {} as Record<string, Category>),
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
          transactions.length === 0 || isRefresh
            ? fetchTransactions()
            : Promise.resolve({ data: transactions }),
          categories.length === 0 || isRefresh
            ? fetchCategories()
            : Promise.resolve({ data: categories }),
        ]);

        if (accounts.length === 0 || isRefresh)
          dispatch(setAccounts(accRes.data));
        if (transactions.length === 0 || isRefresh)
          console.log("Fetched Transactions:", txRes);
        dispatch(setTransactions(txRes.data));
        if (categories.length === 0 || isRefresh)
          dispatch(setCategories(catRes.data));
      } catch (err) {
        console.error("Failed to load data:", err);
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [
      dispatch,
      accounts.length,
      transactions.length,
      categories.length,
      accounts,
      transactions,
      categories,
    ]
  );

  useEffect(() => {
    loadData();
  }, []); // Run once on mount

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

  // --- Handlers ---
  const confirmDelete = async () => {
    if (!deleteData) return;
    try {
      dispatch(removeTransaction(deleteData.id)); // Optimistic update
      const res = await deleteTransaction(deleteData.id);
      if (res.error) throw new Error(res.error);
    } catch (err) {
      console.error(err);
      loadData(true); // Revert
    } finally {
      setDeleteData(null);
    }
  };

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(val);

  // --- Skeleton Component ---
  const LoadingSkeleton = () => (
    <div className="space-y-4">
      <div className="flex gap-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-28 w-full rounded-xl" />
        ))}
      </div>
      <Skeleton className="h-[500px] w-full rounded-xl" />
    </div>
  );

  // --- Render ---
  if (isLoading && transactions.length === 0) {
    return (
      <div className="p-6 space-y-8 max-w-7xl mx-auto">
        <LoadingSkeleton />
      </div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="w-full space-y-6 p-2 md:p-6 mx-auto"
    >
      {/* Delete Dialog */}
      <AlertDialog
        open={!!deleteData}
        onOpenChange={(open: boolean) => !open && setDeleteData(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Transaction?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove{" "}
              <span className="font-semibold text-foreground">
                {deleteData?.description}
              </span>{" "}
              from your history. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive hover:bg-destructive/90 text-white"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Transactions
          </h1>
          <p className="text-muted-foreground mt-1">
            Track your cash flow and spending habits.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => loadData(true)}
            className={cn("rounded-full", isRefreshing && "animate-spin")}
            disabled={isRefreshing}
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            className="rounded-full shadow-sm"
            onClick={() => router.push("/dashboard/reports")}
          >
            <ChartPie className="mr-2 h-4 w-4" /> Analytics
          </Button>
          <AddTransaction />
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          {
            label: "Total Income",
            value: stats.income,
            icon: ArrowDownLeft,
            color: "text-emerald-500",
            bg: "bg-emerald-500/10",
            showTrend: false,
          },
          {
            label: "Total Expenses",
            value: stats.expense,
            icon: ArrowUpRight,
            color: "text-rose-500",
            bg: "bg-rose-500/10",
            showTrend: false,
          },
          {
            label: "Net Flow",
            value: stats.net,
            icon: Wallet,
            color: stats.net >= 0 ? "text-blue-500" : "text-amber-500",
            bg: stats.net >= 0 ? "bg-blue-500/10" : "bg-amber-500/10",
            showTrend: true,
          },
        ].map((stat, idx) => (
          <motion.div key={idx} variants={itemVariants} whileHover={{ y: -4 }}>
            <Card className="border-none shadow-sm bg-card hover:bg-accent/5 transition-colors">
              <CardContent className="p-6">
                <div className="flex items-center justify-between pb-2">
                  <p className="text-sm font-medium text-muted-foreground">
                    {stat.label}
                  </p>
                  <div className={cn("p-2 rounded-full", stat.bg)}>
                    <stat.icon className={cn("h-4 w-4", stat.color)} />
                  </div>
                </div>

                <div className="text-2xl font-bold tracking-tight">
                  {formatCurrency(stat.value)}
                </div>

                {/* Growth Indicator (only for Net Flow) */}
                {stat.showTrend && stats.growthPercent !== null && (
                  <div
                    className={cn(
                      "mt-1 text-xs flex items-center gap-1",
                      stats.trend === "up"
                        ? "text-emerald-500"
                        : stats.trend === "down"
                        ? "text-rose-500"
                        : "text-muted-foreground"
                    )}
                  >
                    {stats.trend === "up" && <TrendingUp className="h-3 w-3" />}
                    {stats.trend === "down" && (
                      <TrendingDown className="h-3 w-3" />
                    )}
                    {Math.abs(stats.growthPercent)}%
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Main Content */}
      <motion.div variants={itemVariants}>
        <Card className="overflow-hidden border-slate-200 dark:border-slate-800 shadow-md">
          <CardHeader className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 border-b bg-slate-50/40 dark:bg-slate-900/40 px-6 py-4">
            <div className="flex items-center gap-2">
              <CardTitle className="text-lg font-semibold">History</CardTitle>
              <Badge variant="outline" className="ml-2 font-normal">
                {filteredTransactions.length} items
              </Badge>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3 w-full xl:w-auto">
              <div className="relative flex-1 sm:min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search description..."
                  className="pl-10 bg-background rounded-full"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              <Select
                value={accountFilter}
                onValueChange={(v) => setAccountFilter(v)}
              >
                <SelectTrigger className="w-full sm:w-[160px] rounded-full bg-background">
                  <SelectValue placeholder="Account" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Accounts</SelectItem>
                  {accounts.map((acc) => (
                    <SelectItem key={acc.id} value={acc.id}>
                      {acc.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={categoryFilter}
                onValueChange={(v) => setCategoryFilter(v)}
              >
                <SelectTrigger className="w-full sm:w-[160px] rounded-full bg-background">
                  <div className="flex items-center gap-2">
                    <Filter className="h-3.5 w-3.5 opacity-70" />
                    <SelectValue placeholder="Category" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
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
                <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-full mb-4">
                  {/* Switch icon based on whether the user is searching or if the list is just empty */}
                  {search ||
                  accountFilter !== "all" ||
                  categoryFilter !== "all" ? (
                    <Search className="h-8 w-8 text-muted-foreground" />
                  ) : (
                    <ArrowRightLeft className="h-8 w-8 text-muted-foreground" />
                  )}
                </div>

                <h3 className="text-lg font-semibold">
                  {search || accountFilter !== "all" || categoryFilter !== "all"
                    ? "No results found"
                    : "No transactions yet"}
                </h3>

                <p className="text-muted-foreground text-sm max-w-xs mt-2 px-4">
                  {search || accountFilter !== "all" || categoryFilter !== "all"
                    ? `We couldn't find any transactions matching your current filters.`
                    : "Start tracking your expenses and income by adding your first transaction."}
                </p>
                {/* Show "Clear Filters" or "Add Transaction" button based on state */}
                <div className="mt-6">
                  {search ||
                  accountFilter !== "all" ||
                  categoryFilter !== "all" ? (
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSearch("");
                        setAccountFilter("all");
                        setCategoryFilter("all");
                      }}
                      className="rounded-full"
                    >
                      Clear all filters
                    </Button>
                  ) : (
                    <div className="scale-110">
                      <AddTransaction />
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50/50 dark:bg-slate-900/50 hover:bg-transparent">
                      <TableHead className="w-[150px] pl-6">Date</TableHead>
                      <TableHead className="w-[30%]">Description</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Account</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <AnimatePresence mode="popLayout">
                      {filteredTransactions.map((tx) => {
                        const account = accountMap[tx.account_id];
                        const category = categoryMap[tx.category_id];
                        // Logic: Amount > 0 is Expense (Red), < 0 is Income (Green)
                        const isExpense = tx.type === "expense" ? true : false;
                        console.log(
                          "Transaction Type:",
                          tx.type,
                          "isExpense:",
                          isExpense
                        );
                        const displayAmount = Math.abs(tx.amount);

                        return (
                          <motion.tr
                            key={tx.id}
                            layout
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="group hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors border-b last:border-0"
                          >
                            <TableCell className="pl-6 py-4">
                              <div className="flex items-center text-sm text-muted-foreground">
                                <Calendar className="mr-2 h-3.5 w-3.5 opacity-70" />
                                {format(new Date(tx.date), "MMM dd, yyyy")}
                              </div>
                            </TableCell>

                            <TableCell>
                              <span className="font-medium text-sm">
                                {tx.description ||
                                  `${category?.name} side income/expense`}
                              </span>
                            </TableCell>

                            <TableCell>
                              <Badge
                                variant="secondary"
                                className="font-normal text-xs bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 hover:bg-slate-200"
                              >
                                {category?.name || "Uncategorized"}
                              </Badge>
                            </TableCell>

                            <TableCell>
                              <div className="flex items-center gap-2">
                                <div className="h-6 w-6 rounded-md bg-white border p-0.5 flex items-center justify-center shadow-sm">
                                  <img
                                    src={getBankLogoUrl(account?.bank)}
                                    alt="Bank"
                                    className="h-full w-full object-contain"
                                    // onError={(e) =>
                                    //   (e.currentTarget.src =
                                    //     "/placeholder-bank.png")
                                    // }
                                  />
                                </div>
                                <span className="text-sm text-muted-foreground truncate max-w-[120px]">
                                  {account?.name || "account not found"}
                                </span>
                              </div>
                            </TableCell>

                            <TableCell className="text-right">
                              <span
                                className={cn(
                                  "font-mono font-medium tracking-tight",
                                  isExpense
                                    ? "text-rose-600 dark:text-rose-400"
                                    : "text-emerald-600 dark:text-emerald-400"
                                )}
                              >
                                {isExpense ? "-" : "+"}
                                {formatCurrency(displayAmount)}
                              </span>
                            </TableCell>

                            <TableCell className="pr-6">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                onClick={() =>
                                  setDeleteData({
                                    id: tx.id,
                                    description: tx.description,
                                  })
                                }
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </TableCell>
                          </motion.tr>
                        );
                      })}
                    </AnimatePresence>
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
