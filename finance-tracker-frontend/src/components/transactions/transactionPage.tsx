// src/components/transactionPage.tsx
"use client";

import { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setAccounts } from "../redux/slices/slice_accounts";
import { setTransactions } from "../redux/slices/slice_transactions";
import { setCategories } from "../redux/slices/slice_categories";
import { RootState } from "@/app/store";
import AddTransaction from "./addTransaction";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Trash2 } from "lucide-react";
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
import { format } from "date-fns";
import { MoreHorizontal } from "lucide-react";
import { fetchTransactions } from "@/service/service_transactions";
import { fetchCategories } from "@/service/service_categories";
import { fetchAccounts } from "@/service/service_accounts";
import { getBankLogoUrl } from "@/service/service_accounts";
import Loader from "@/utils/loader";

interface Account {
  id: string;
  name: string;
  bankName: string;
  balance?: number;
}

interface Category {
  id: string;
  name: string;
  color?: string;
}

interface Transaction {
  id: string;
  date: Date;
  description: string | null;
  account_id: string;
  category_id: string;
  amount: number;
}

export default function TransactionPage() {
  const dispatch = useDispatch();
  const accounts = useSelector((state: RootState) => state.accounts.accounts);
  const transactions = useSelector(
    (state: RootState) => state.transactions.transactions
  );
  const categories = useSelector(
    (state: RootState) => state.categories.categories
  );
  const [pendingLoads, setPendingLoads] = useState(0);
  const [search, setSearch] = useState("");
  const [accountFilter, setAccountFilter] = useState<"all" | string>("all");

  const accountMap = accounts.reduce((map, acc) => {
    map[acc.id] = acc;
    return map;
  }, {} as Record<string, Account>);

  const categoryMap = categories.reduce((map, cat) => {
    map[cat.id] = cat;
    return map;
  }, {} as Record<string, Category>);

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

  const filteredTransactions = transactions.filter((tx) => {
    const account = accountMap[tx.account_id];
    const category = categoryMap[tx.category_id];

    const searchLower = search.toLowerCase();
    const matchText =
      tx.description?.toLowerCase().includes(searchLower) ||
      category?.name?.toLowerCase().includes(searchLower) ||
      account?.name?.toLowerCase().includes(searchLower);

    const matchAccount =
      accountFilter === "all" || tx.account_id === accountFilter;

    return matchText && matchAccount;
  });

  // Calculate summary values
  const calculateSummary = () => {
    const totalBalance = accounts.reduce(
      (sum, acc) => sum + (acc.balance || 0),
      0
    );
    const netWorthChange = transactions.reduce(
      (sum, tx) => sum + (tx.amount > 0 ? -tx.amount : Math.abs(tx.amount)),
      0
    );

    return { totalBalance, netWorthChange };
  };

  const { totalBalance, netWorthChange } = calculateSummary();

  return (
    <div className="w-full">
      <div className="flex flex-col gap-6 relative">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold">Transactions</h1>
            <p className="text-muted-foreground mt-1">
              Track your income and expenses
            </p>
          </div>
          <AddTransaction />
        </div>

        {pendingLoads > 0 ? (
          <div className="w-full flex items-center justify-center min-h-[400px]">
            <Loader size="md" text="Fetching Your transactions..." />
          </div>
        ) : (
          <>
            {/* Summary Cards */}
            <div className="flex flex-col md:flex-row gap-6">
              {/* Left Card */}
              <Card className="flex-1">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Total Balance</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">
                    ${totalBalance.toFixed(2)}
                  </p>
                  <p className="text-muted-foreground text-sm mt-2">
                    Across all accounts
                  </p>
                </CardContent>
              </Card>

              {/* Right Card */}
              <Card className="flex-1">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Net Worth Impact</CardTitle>
                </CardHeader>
                <CardContent>
                  <p
                    className={`text-3xl font-bold ${
                      netWorthChange >= 0 ? "text-green-500" : "text-red-500"
                    }`}
                  >
                    {netWorthChange >= 0 ? "+" : "-"}$
                    {Math.abs(netWorthChange).toFixed(2)}
                  </p>
                  <p className="text-muted-foreground text-sm mt-2">
                    {netWorthChange >= 0 ? "Positive" : "Negative"} trend in
                    financial health
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Transaction Table */}
            <div className="mt-2">
              <Card className="overflow-hidden">
                <CardHeader className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 px-6 py-4">
                  <CardTitle className="text-lg">History</CardTitle>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full md:w-auto">
                    <div className="relative w-full sm:w-56">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search transactions..."
                        className="pl-10 w-full"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                      />
                    </div>
                    <Select
                      value={accountFilter}
                      onValueChange={(v) =>
                        setAccountFilter(v as "all" | string)
                      }
                    >
                      <SelectTrigger className="w-full sm:w-40">
                        <SelectValue placeholder="All Accounts" />
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
                  </div>
                </CardHeader>

                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader className="bg-gray-50">
                        <TableRow>
                          <TableHead className="min-w-[120px] py-3">
                            Date
                          </TableHead>
                          <TableHead className="min-w-[180px] py-3">
                            Description
                          </TableHead>
                          <TableHead className="min-w-[150px] py-3">
                            Account
                          </TableHead>
                          <TableHead className="min-w-[140px] py-3">
                            Category
                          </TableHead>
                          <TableHead className="min-w-[120px] text-right py-3">
                            Amount
                          </TableHead>
                          <TableHead className="min-w-[100px] text-right py-3 w-[100px]">
                            Actions
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredTransactions.length > 0 ? (
                          filteredTransactions.map((tx) => {
                            const account = accountMap[tx.account_id];
                            const category = categoryMap[tx.category_id];
                            const isExpense = tx.amount > 0;

                            // Handle null/empty descriptions
                            const description =
                              tx.description ||
                              (category
                                ? `ON ${category.name}`
                                : "Transaction");

                            return (
                              <TableRow
                                key={tx.id}
                                className="hover:bg-gray-50"
                              >
                                <TableCell className="py-3">
                                  {format(tx.date, "MMM dd, yyyy")}
                                </TableCell>
                                <TableCell className="py-3">
                                  <div className="font-medium">
                                    {description}
                                  </div>
                                </TableCell>
                                <TableCell className="py-3">
                                  <div className="flex items-center">
                                    <img
                                      src={getBankLogoUrl(account?.bank)}
                                      alt="Bank Logo"
                                      className="w-6 h-6 mr-2 rounded-full"
                                    />
                                    <span className="truncate max-w-[120px]">
                                      {account?.name || "Unknown Account"}
                                    </span>
                                  </div>
                                </TableCell>
                                <TableCell className="py-3">
                                  <span
                                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                      isExpense
                                        ? "bg-red-100 text-red-800"
                                        : "bg-green-100 text-green-800"
                                    }`}
                                  >
                                    {category?.name || "Uncategorized"}
                                  </span>
                                </TableCell>
                                <TableCell
                                  className={`text-right font-medium py-3 ${
                                    isExpense
                                      ? "text-red-500"
                                      : "text-green-500"
                                  }`}
                                >
                                  {isExpense ? "-" : "+"}$
                                  {Math.abs(tx.amount).toFixed(2)}
                                </TableCell>
                                <TableCell className="py-3">
                                  <div className="flex justify-end min-w-[112px]">
                                    <div className="relative group">
                                      {/* Static Trash Icon (visible only when not hovering) */}
                                      <Trash2 className="h-4 w-4 text-red-600 absolute right-2 top-1/2 -translate-y-1/2 group-hover:opacity-0 transition-opacity duration-300 pointer-events-none" />

                                      {/* Expanding Button on Hover */}
                                      <Button
                                        variant="ghost"
                                        className="w-8 px-0 hover:px-3 hover:w-28 hover:bg-red-600 hover:text-white cursor-pointer transition-all duration-300 overflow-hidden"
                                      >
                                        <Trash2 className="h-4 w-4 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                        <span className="ml-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                          Delete
                                        </span>
                                      </Button>
                                    </div>
                                  </div>
                                </TableCell>
                              </TableRow>
                            );
                          })
                        ) : (
                          <TableRow>
                            <TableCell colSpan={6} className="text-center py-8">
                              <div className="flex flex-col items-center justify-center">
                                <div className="text-gray-400 mb-2">
                                  No transactions found
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  Try changing your search or filter criteria
                                </div>
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
