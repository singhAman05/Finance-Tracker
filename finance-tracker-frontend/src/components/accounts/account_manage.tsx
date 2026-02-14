"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { openModal } from "@/components/redux/slices/slice_modal";
import { useRouter } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import { RootState } from "@/app/store";
import {
  setAccounts,
  removeAccount,
} from "@/components/redux/slices/slice_accounts";
import { AddAccount } from "./addAccount";
import {
  fetchAccounts,
  getBankLogoUrl,
  deleteAccount,
} from "@/service/service_accounts";

// UI Components
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
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
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// Icons
import {
  Plus,
  Trash2,
  Pencil,
  Search,
  Landmark,
  TrendingUp,
  CreditCard,
  AlertCircle,
  RefreshCw,
  Wallet,
} from "lucide-react";

// Animation Variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const itemVariants = {
  hidden: { y: 10, opacity: 0, filter: "blur(4px)" },
  visible: { y: 0, opacity: 1, filter: "blur(0px)" },
};

export default function AccountsPage() {
  const dispatch = useDispatch();
  const router = useRouter();
  const accounts = useSelector((state: RootState) => state.accounts.accounts);

  const [showAddAccountModal, setShowAddAccountModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [deleteAccountData, setDeleteAccountData] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // --- Logic ---

  const loadAccounts = useCallback(
    async (isRefresh = false) => {
      try {
        if (isRefresh) setIsRefreshing(true);
        else setLoading(true);

        const data = await fetchAccounts();
        dispatch(setAccounts(data.data));
      } catch (err) {
        console.error("Error fetching accounts:", err);
      } finally {
        setLoading(false);
        setIsRefreshing(false);
      }
    },
    [dispatch]
  );

  useEffect(() => {
    // Initial load only if Redux is empty to save bandwidth
    if (accounts.length === 0) {
      loadAccounts();
    } else {
      setLoading(false);
    }
  }, [loadAccounts, accounts.length]);

  const handleDeleteClick = (accountId: string) => {
    dispatch(
      openModal({
        type: "CONFIRM_DELETE",
        payload: {
          title: "Delete Account",
          description:
            "This action will permanently remove this account and all associated transactions.",
          confirmText: "Delete",
          cancelText: "Cancel",
          onConfirm: () => {
            dispatch(deleteAccount(accountId));
          },
        },
      })
    );
  };

  const confirmDelete = async () => {
    if (!deleteAccountData) return;
    const { id } = deleteAccountData;

    try {
      const res = await deleteAccount(id);
      dispatch(removeAccount(id));
      if (res.error) throw new Error(res.error.message);
    } catch (err) {
      console.error("Delete error:", err);
      loadAccounts(true); // Revert on failure
    } finally {
      setDeleteAccountData(null);
    }
  };

  const filteredAccounts = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return accounts.filter((acc) => {
      return (
        (acc.name ?? "").toLowerCase().includes(q) ||
        (acc.bank ?? "").toLowerCase().includes(q)
      );
    });
  }, [accounts, searchQuery]);

  const stats = useMemo(
    () => ({
      total: accounts.reduce((sum, acc) => sum + acc.balance, 0),
      debt: accounts
        .filter((acc) => acc.balance < 0)
        .reduce((sum, acc) => sum + acc.balance, 0),
      count: accounts.length,
    }),
    [accounts]
  );

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(value);

  // --- Sub Components ---

  const LoadingSkeleton = () => (
    <div className="space-y-4">
      <div className="flex gap-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-32 w-full rounded-xl" />
        ))}
      </div>
      <Skeleton className="h-[400px] w-full rounded-xl" />
    </div>
  );

  // --- Render ---

  if (loading && accounts.length === 0) {
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
      <AnimatePresence>
        {showAddAccountModal && (
          <AddAccount
            onClose={() => {
              setShowAddAccountModal(false);
              loadAccounts(true);
            }}
          />
        )}
      </AnimatePresence>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!deleteAccountData}
        onOpenChange={(open: any) => !open && setDeleteAccountData(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the account
              <span className="font-bold text-foreground">
                {" "}
                {deleteAccountData?.name}{" "}
              </span>
              and remove all associated transaction history.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive hover:bg-destructive/90 text-white"
            >
              Delete Account
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Financial Assets
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage your bank accounts, credit cards, and cash flow.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => loadAccounts(true)}
            className={cn("rounded-full", isRefreshing && "animate-spin")}
            disabled={isRefreshing}
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button
            onClick={() => setShowAddAccountModal(true)}
            className="shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all rounded-full px-6"
          >
            <Plus className="mr-2 h-4 w-4" /> Add Account
          </Button>
        </div>
      </div>

      {/* Insights Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          {
            label: "Net Worth",
            val: stats.total,
            icon: Wallet,
            color: "text-blue-500",
            bg: "bg-blue-500/10",
          },
          {
            label: "Total Liabilities",
            val: stats.debt,
            icon: CreditCard,
            color: "text-rose-500",
            bg: "bg-rose-500/10",
          },
          {
            label: "Active Accounts",
            val: stats.count, // Just showing count here
            isCount: true,
            icon: Landmark,
            color: "text-emerald-500",
            bg: "bg-emerald-500/10",
          },
        ].map((item) => (
          <motion.div
            key={item.label}
            variants={itemVariants}
            whileHover={{ y: -4 }}
          >
            <Card className="border-none shadow-sm bg-card hover:bg-accent/5 transition-colors duration-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between space-y-0 pb-2">
                  <p className="text-sm font-medium text-muted-foreground">
                    {item.label}
                  </p>
                  <div className={cn("p-2 rounded-full", item.bg)}>
                    <item.icon className={cn("h-4 w-4", item.color)} />
                  </div>
                </div>
                <div className="flex items-baseline gap-2 mt-2">
                  <span className="text-2xl font-bold tracking-tight">
                    {item.isCount
                      ? item.val
                      : formatCurrency(item.val as number)}
                  </span>
                  {item.label === "Net Worth" && (
                    <span className="text-xs text-emerald-500 flex items-center">
                      <TrendingUp className="h-3 w-3 mr-1" /> +2.4%
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Main Table Card */}
      <motion.div variants={itemVariants}>
        <Card className="overflow-hidden border-slate-200 dark:border-slate-800 shadow-md">
          <CardHeader className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b bg-slate-50/40 dark:bg-slate-900/40 px-6 py-4">
            <div className="space-y-1">
              <CardTitle className="text-lg font-semibold">
                My Accounts
              </CardTitle>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Badge variant="outline" className="text-xs font-normal">
                  {filteredAccounts.length} Total
                </Badge>
              </div>
            </div>
            <div className="relative w-full md:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search banks..."
                className="pl-10 bg-background rounded-full border-slate-200 focus-visible:ring-1"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </CardHeader>

          <CardContent className="p-0">
            {filteredAccounts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-full mb-4">
                  {searchQuery ? (
                    <Search className="h-8 w-8 text-muted-foreground" />
                  ) : (
                    <Landmark className="h-8 w-8 text-muted-foreground" />
                  )}
                </div>
                <h3 className="text-lg font-medium">
                  {searchQuery ? "No results found" : "No accounts yet"}
                </h3>
                <p className="text-muted-foreground max-w-xs mt-2 text-sm">
                  {searchQuery
                    ? `We couldn't find anything matching "${searchQuery}"`
                    : "Add your first bank account to start tracking your wealth."}
                </p>
                {!searchQuery && (
                  <Button
                    onClick={() => setShowAddAccountModal(true)}
                    variant="link"
                    className="mt-2 text-primary"
                  >
                    Create an account
                  </Button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="w-[300px] pl-6">Details</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead className="text-right">Balance</TableHead>
                      <TableHead className="text-center">Status</TableHead>
                      <TableHead className="text-right pr-6">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <AnimatePresence mode="popLayout">
                      {filteredAccounts.map((account) => (
                        <motion.tr
                          key={account.id}
                          layout
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0, x: -20 }}
                          transition={{ duration: 0.2 }}
                          className="group hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors border-b last:border-0"
                        >
                          <TableCell className="pl-6 py-4">
                            <div className="flex items-center gap-4">
                              <div className="h-10 w-10 rounded-xl bg-white p-1.5 border shadow-sm shrink-0 flex items-center justify-center">
                                <img
                                  src={getBankLogoUrl(account.bank)}
                                  alt={account.bank}
                                  className="h-full w-full object-contain"
                                  // onError={(e) =>
                                  //   (e.currentTarget.src =
                                  //     "/placeholder-bank.png")
                                  // } // Fallback
                                />
                              </div>
                              <div className="flex flex-col min-w-0">
                                <span className="font-semibold text-sm truncate">
                                  {account.name}
                                </span>
                                <span className="text-xs text-muted-foreground flex items-center gap-1">
                                  {account.bank}{" "}
                                  <span className="text-[10px]">•</span> ****
                                  {account.lastDigits}
                                </span>
                              </div>
                            </div>
                          </TableCell>

                          <TableCell>
                            <Badge
                              variant="secondary"
                              className="font-medium capitalize text-xs"
                            >
                              {account.type}
                            </Badge>
                          </TableCell>

                          <TableCell className="text-right">
                            <span
                              className={cn(
                                "font-mono font-medium tracking-tight",
                                account.balance < 0
                                  ? "text-destructive"
                                  : "text-emerald-600 dark:text-emerald-400"
                              )}
                            >
                              {formatCurrency(account.balance)}
                            </span>
                          </TableCell>

                          <TableCell className="text-center">
                            <div
                              className={cn(
                                "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
                                account.status === "active"
                                  ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400"
                                  : "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-400"
                              )}
                            >
                              {account.status}
                            </div>
                          </TableCell>

                          <TableCell className="text-right pr-6">
                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-slate-500 hover:text-blue-600 hover:bg-blue-50"
                              >
                                <Pencil className="h-3.5 w-3.5" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-slate-500 hover:text-destructive hover:bg-destructive/10"
                                onClick={() =>
                                  setDeleteAccountData({
                                    id: account.id,
                                    name: account.name,
                                  })
                                }
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </TableCell>
                        </motion.tr>
                      ))}
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
