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
  RefreshCw,
  Wallet,
  ArrowUpRight,
} from "lucide-react";

// Animation Variants (Matched to page.tsx)
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
    if (accounts.length === 0) {
      loadAccounts();
    } else {
      setLoading(false);
    }
  }, [loadAccounts, accounts.length]);

  const confirmDelete = async () => {
    if (!deleteAccountData) return;
    const { id } = deleteAccountData;

    try {
      const res = await deleteAccount(id);
      dispatch(removeAccount(id));
      if (res.error) throw new Error(res.error.message);
    } catch (err) {
      console.error("Delete error:", err);
      loadAccounts(true);
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
          <Skeleton
            key={i}
            className="h-32 w-full rounded-2xl bg-muted"
          />
        ))}
      </div>
      <Skeleton className="h-[400px] w-full rounded-2xl bg-muted" />
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
    <div className="min-h-screen bg-background text-textPrimary relative overflow-hidden">
      {/* Background Pattern matched from page.tsx */}
      <div
        className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle, currentColor 1px, transparent 1px)`,
          backgroundSize: "32px 32px",
        }}
      />

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="relative w-full space-y-6 p-2 md:p-6 mx-auto"
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
          <AlertDialogContent className="bg-card border border-border">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-textPrimary tracking-tight">
                Are you absolutely sure?
              </AlertDialogTitle>
              <AlertDialogDescription className="text-textSecondary">
                This will permanently delete the account
                <span className="font-bold text-textPrimary">
                  {" "}
                  {deleteAccountData?.name}{" "}
                </span>
                and remove all associated transaction history.
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
                Delete Account
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Header Section */}
        <motion.div
          variants={fadeUp}
          className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6"
        >
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-textPrimary">
              Financial Assets
            </h1>
            <p className="text-textSecondary mt-1">
              Manage your bank accounts, credit cards, and cash flow in one
              place.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="icon"
              onClick={() => loadAccounts(true)}
              className={cn(
                "rounded-full border border-border bg-card text-textPrimary hover:bg-muted w-12 h-12",
                isRefreshing && "animate-spin"
              )}
              disabled={isRefreshing}
            >
              <RefreshCw className="h-5 w-5" />
            </Button>
            <Button
              onClick={() => setShowAddAccountModal(true)}
              className="rounded-full px-8 py-6 bg-primary text-white dark:text-black hover:opacity-90 transition-all font-medium text-base shadow-none dark:shadow-none"
            >
              <Plus className="mr-2 h-5 w-5" /> Add Account
            </Button>
          </div>
        </motion.div>

        {/* Insights Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              label: "Net Worth",
              val: stats.total,
              icon: Wallet,
              trend: "+2.4%",
            },
            {
              label: "Total Liabilities",
              val: stats.debt,
              icon: CreditCard,
            },
            {
              label: "Active Accounts",
              val: stats.count,
              isCount: true,
              icon: Landmark,
            },
          ].map((item) => (
            <motion.div
              key={item.label}
              variants={fadeUp}
              whileHover={{ y: -4 }}
              className="cursor-default"
            >
              {/* Stats card */}
              <div className="p-6 rounded-2xl bg-card border border-border hover:border-ring transition-all duration-300">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-xs font-medium uppercase tracking-widest text-textSecondary">
                    {item.label}
                  </p>
                  <div className="w-8 h-8 rounded-full bg-card border border-border flex items-center justify-center">
                    <item.icon className="h-4 w-4 text-textPrimary" />
                  </div>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold tracking-tighter text-textPrimary">
                    {item.isCount
                      ? item.val
                      : formatCurrency(item.val as number)}
                  </span>
                  {item.trend && (
                    <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-muted">
                      <ArrowUpRight className="h-3 w-3 text-textPrimary" />
                      <span className="text-[10px] font-bold text-textPrimary">
                        {item.trend}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Main Table Card */}
        <motion.div variants={fadeUp}>
          <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-sm">
            {/* Table Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-8 py-6 border-b border-border">
              <div className="space-y-1">
                <h2 className="text-xl font-bold tracking-tight text-textPrimary">
                  Accounts Overview
                </h2>
                <div className="flex items-center gap-2">
                  <Badge
                    variant="outline"
                    className="rounded-full px-2.5 font-medium border-border text-textSecondary"
                  >
                    {filteredAccounts.length} Connected
                  </Badge>
                </div>
              </div>
              <div className="relative w-full md:w-80">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-textSecondary" />
                <Input
                  placeholder="Search by bank or name..."
                  className="pl-11 h-12 bg-background border-border rounded-full focus-visible:ring-1 focus-visible:ring-ring transition-all font-medium placeholder:text-textSecondary"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            {/* Table Body */}
            <div>
              {filteredAccounts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-6">
                    {searchQuery ? (
                      <Search className="h-6 w-6 text-textSecondary" />
                    ) : (
                      <Wallet className="h-6 w-6 text-textSecondary" />
                    )}
                  </div>
                  <h3 className="text-lg font-bold tracking-tight text-textPrimary">
                    {searchQuery ? "No matching accounts" : "No accounts linked"}
                  </h3>
                  <p className="text-textSecondary max-w-xs mt-2 text-sm leading-relaxed">
                    {searchQuery
                      ? "Try adjusting your search terms to find what you're looking for."
                      : "Start tracking your wealth by adding your first bank account."}
                  </p>
                  {!searchQuery && (
                    <Button
                      onClick={() => setShowAddAccountModal(true)}
                      variant="link"
                      className="mt-4 text-textPrimary font-semibold underline-offset-4"
                    >
                      + Add new account
                    </Button>
                  )}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="hover:bg-transparent border-b border-border bg-transparent">
                        <TableHead className="w-[350px] pl-8 py-5 text-xs font-semibold uppercase tracking-wider text-textSecondary">
                          Account Details
                        </TableHead>
                        <TableHead className="text-xs font-semibold uppercase tracking-wider text-textSecondary">
                          Type
                        </TableHead>
                        <TableHead className="text-right text-xs font-semibold uppercase tracking-wider text-textSecondary">
                          Balance
                        </TableHead>
                        <TableHead className="text-center text-xs font-semibold uppercase tracking-wider text-textSecondary">
                          Status
                        </TableHead>
                        <TableHead className="text-right pr-8 text-xs font-semibold uppercase tracking-wider text-textSecondary">
                          Actions
                        </TableHead>
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
                            className="group hover:bg-muted transition-colors border-b border-border last:border-0"
                          >
                            <TableCell className="pl-8 py-5">
                              <div className="flex items-center gap-4">
                                <div className="h-12 w-12 rounded-xl bg-card p-2 border border-border flex items-center justify-center shrink-0">
                                  <img
                                    src={getBankLogoUrl(account.bank)}
                                    alt={account.bank}
                                    className="h-full w-full object-contain"
                                  />
                                </div>
                                <div className="flex flex-col min-w-0">
                                  <span className="font-bold text-sm tracking-tight text-textPrimary truncate">
                                    {account.name}
                                  </span>
                                  <span className="text-xs text-textSecondary flex items-center gap-1.5 mt-0.5">
                                    {account.bank}
                                    <span className="w-1 h-1 rounded-full bg-muted" />
                                    <span className="font-mono text-[10px]">
                                      •••• {account.lastDigits}
                                    </span>
                                  </span>
                                </div>
                              </div>
                            </TableCell>

                            <TableCell>
                              <Badge
                                variant="secondary"
                                className="rounded-full font-medium capitalize text-[10px] tracking-wide bg-muted text-textSecondary border border-border hover:bg-muted/80"
                              >
                                {account.type}
                              </Badge>
                            </TableCell>

                            <TableCell className="text-right">
                              <span
                                className={cn(
                                  "font-mono font-bold tracking-tight text-base",
                                  account.balance < 0
                                    ? "text-textPrimary"
                                    : "text-textPrimary"
                                )}
                              >
                                {formatCurrency(account.balance)}
                              </span>
                            </TableCell>

                            <TableCell className="text-center">
                              <div className="inline-flex items-center justify-center">
                                {account.status === "active" ? (
                                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-border bg-card text-[10px] font-medium text-textPrimary">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                    Active
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-border bg-muted text-[10px] font-medium text-textSecondary">
                                    <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground" />
                                    Inactive
                                  </span>
                                )}
                              </div>
                            </TableCell>

                            <TableCell className="text-right pr-8">
                              <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-9 w-9 rounded-full text-textSecondary hover:text-textPrimary hover:bg-card hover:shadow-sm transition-all border border-transparent hover:border-border"
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-9 w-9 rounded-full text-textSecondary hover:text-red-600 dark:hover:text-red-400 hover:bg-card hover:shadow-sm transition-all border border-transparent hover:border-red-100 dark:hover:border-red-900/30"
                                  onClick={() =>
                                    setDeleteAccountData({
                                      id: account.id,
                                      name: account.name,
                                    })
                                  }
                                >
                                  <Trash2 className="h-4 w-4" />
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
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}