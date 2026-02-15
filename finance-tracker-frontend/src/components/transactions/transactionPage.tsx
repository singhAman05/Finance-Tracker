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
          <Skeleton key={i} className="h-28 w-full rounded-xl bg-muted" />
        ))}
      </div>
      <Skeleton className="h-[500px] w-full rounded-xl bg-muted" />
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
        <AlertDialogContent className="bg-card border border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-textPrimary tracking-tight">
              Are you absolutely sure?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-textSecondary">
              This will permanently delete the transaction
              <span className="font-bold text-textPrimary">
                {" "}
                {deleteData?.description}{" "}
              </span>
              and remove it from your history. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-full border border-border bg-card text-textPrimary hover:bg-muted transition-colors">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="rounded-full bg-red-600 hover:bg-red-700 text-white font-medium shadow-sm transition-colors"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-textPrimary">
            Transactions
          </h1>
          <p className="text-textSecondary mt-1">
            Track your cash flow and spending habits.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => loadData(true)}
            className={cn(
              "rounded-full border border-border bg-card text-textPrimary hover:bg-muted",
              isRefreshing && "animate-spin"
            )}
            disabled={isRefreshing}
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            className="rounded-full border border-border bg-card text-textPrimary hover:bg-muted shadow-sm"
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
          },
          {
            label: "Total Expenses",
            value: stats.expense,
            icon: ArrowUpRight,
          },
          {
            label: "Net Flow",
            value: stats.net,
            icon: Wallet,
          },
        ].map((stat, idx) => (
          <motion.div key={idx} variants={itemVariants} whileHover={{ y: -4 }}>
            <Card className="border border-border shadow-none bg-card transition-colors hover:border-ring">
              <CardContent className="p-6">
                <div className="flex items-center justify-between pb-2">
                  <p className="text-sm font-medium text-textSecondary">
                    {stat.label}
                  </p>
                  <div className="p-2 rounded-full bg-muted border border-border">
                    <stat.icon className="h-4 w-4 text-textPrimary" />
                  </div>
                </div>

                <div className="text-2xl font-bold tracking-tight text-textPrimary">
                  {formatCurrency(stat.value)}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Main Content */}
      <motion.div variants={itemVariants}>
        <Card className="overflow-hidden border border-border shadow-none bg-card">
          <CardHeader className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 border-b border-border bg-card px-6 py-4">
            <div className="flex items-center gap-2">
              <CardTitle className="text-lg font-semibold text-textPrimary">History</CardTitle>
              <Badge variant="outline" className="ml-2 font-normal border-border text-textSecondary">
                {filteredTransactions.length} items
              </Badge>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3 w-full xl:w-auto">
              <div className="relative flex-1 sm:min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-textSecondary" />
                <Input
                  placeholder="Search description..."
                  className="pl-10 bg-background border-border rounded-full focus-visible:ring-1 focus-visible:ring-ring transition-all font-medium placeholder:text-textSecondary"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              <Select
                value={accountFilter}
                onValueChange={(v) => setAccountFilter(v)}
              >
                <SelectTrigger className="w-full sm:w-[160px] rounded-full bg-background border-border text-textPrimary">
                  <SelectValue placeholder="Account" />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  <SelectItem value="all" className="text-textPrimary">All Accounts</SelectItem>
                  {accounts.map((acc) => (
                    <SelectItem key={acc.id} value={acc.id} className="text-textPrimary">
                      {acc.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={categoryFilter}
                onValueChange={(v) => setCategoryFilter(v)}
              >
                <SelectTrigger className="w-full sm:w-[160px] rounded-full bg-background border-border text-textPrimary">
                  <div className="flex items-center gap-2">
                    <Filter className="h-3.5 w-3.5 text-textSecondary" />
                    <SelectValue placeholder="Category" />
                  </div>
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  <SelectItem value="all" className="text-textPrimary">All Categories</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id} className="text-textPrimary">
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
                  {search ||
                  accountFilter !== "all" ||
                  categoryFilter !== "all" ? (
                    <Search className="h-8 w-8 text-textSecondary" />
                  ) : (
                    <ArrowRightLeft className="h-8 w-8 text-textSecondary" />
                  )}
                </div>

                <h3 className="text-lg font-semibold text-textPrimary">
                  {search || accountFilter !== "all" || categoryFilter !== "all"
                    ? "No results found"
                    : "No transactions yet"}
                </h3>

                <p className="text-textSecondary text-sm max-w-xs mt-2 px-4">
                  {search || accountFilter !== "all" || categoryFilter !== "all"
                    ? `We couldn't find any transactions matching your current filters.`
                    : "Start tracking your expenses and income by adding your first transaction."}
                </p>
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
                      className="rounded-full border-border bg-card text-textPrimary hover:bg-muted"
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
                    <TableRow className="hover:bg-transparent border-b border-border bg-transparent">
                      <TableHead className="w-[150px] pl-8 py-5 text-xs font-semibold uppercase tracking-wider text-textSecondary">Date</TableHead>
                      <TableHead className="text-xs font-semibold uppercase tracking-wider text-textSecondary">Description</TableHead>
                      <TableHead className="text-left text-xs font-semibold uppercase tracking-wider text-textSecondary">Category</TableHead>
                      <TableHead className="text-left text-xs font-semibold uppercase tracking-wider text-textSecondary">Account</TableHead>
                      <TableHead className="text-right pr-8 text-xs font-semibold uppercase tracking-wider text-textSecondary">Amount</TableHead>
                      <TableHead className="text-right pr-8 text-xs font-semibold uppercase tracking-wider text-textSecondary">
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <AnimatePresence mode="popLayout">
                      {filteredTransactions.map((tx) => {
                        const account = accountMap[tx.account_id];
                        const category = categoryMap[tx.category_id];
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
                            className="group hover:bg-muted transition-colors border-b border-border last:border-0"
                          >
                            <TableCell className="pl-6 py-4">
                              <div className="flex items-center text-sm text-textSecondary">
                                <Calendar className="mr-2 h-3.5 w-3.5 text-textSecondary" />
                                {format(new Date(tx.date), "MMM dd, yyyy")}
                              </div>
                            </TableCell>

                            <TableCell>
                              <span className="font-medium text-sm text-textPrimary">
                                {tx.description ||
                                  `${category?.name} side income/expense`}
                              </span>
                            </TableCell>

                            <TableCell>
                              <Badge
                                variant="secondary"
                                className="font-normal text-xs bg-muted text-textSecondary hover:bg-muted/80 border-0"
                              >
                                {category?.name || "Uncategorized"}
                              </Badge>
                            </TableCell>

                            <TableCell>
                              <div className="flex items-center gap-2">
                                <div className="h-6 w-6 rounded-md bg-card border border-border p-0.5 flex items-center justify-center shadow-sm">
                                  <img
                                    src={getBankLogoUrl(account?.bank)}
                                    alt="Bank"
                                    className="h-full w-full object-contain"
                                  />
                                </div>
                                <span className="text-sm text-textSecondary truncate max-w-[120px]">
                                  {account?.name || "account not found"}
                                </span>
                              </div>
                            </TableCell>

                            <TableCell className="text-right pr-8">
                              <span
                                className={cn(
                                  "font-mono font-medium tracking-tight",
                                  "text-textPrimary"
                                )}
                              >
                                {isExpense ? "-" : "+"}
                                {formatCurrency(displayAmount)}
                              </span>
                            </TableCell>

                            <TableCell className="text-right pr-8">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-9 w-9 rounded-full text-textSecondary hover:text-red-600 dark:hover:text-red-400 hover:bg-card hover:shadow-sm transition-all border border-transparent hover:border-red-100 dark:hover:border-red-900/30"
                                onClick={() =>
                                  setDeleteData({
                                    id: tx.id,
                                    description: tx?.description || category?.name,
                                  })
                                }
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
            )}
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}