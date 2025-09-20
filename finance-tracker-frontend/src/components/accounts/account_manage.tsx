// app/accounts/page.tsx
"use client";

import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/app/store";
import { setAccounts } from "@/components/redux/slices/slice_accounts";
import { AddAccount } from "./addAccount";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
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
import { Plus, Trash2, Pencil, Search, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useEffect, useState, useCallback } from "react";
import { fetchAccounts, getBankLogoUrl } from "@/service/service_accounts";

export default function AccountsPage() {
  const dispatch = useDispatch();
  const accounts = useSelector((state: RootState) => state.accounts.accounts);
  const [showAddAccountModal, setShowAddAccountModal] = useState(false);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadAccounts = useCallback(async () => {
    if (accounts.length > 0) {
      setLoading(false); // Already loaded, no need to fetch
      return;
    }

    try {
      setLoading(true);
      const data = await fetchAccounts();
      dispatch(setAccounts(data));
      setError(null);
    } catch (err) {
      console.error(err);
      setError("Failed to load accounts.");
    } finally {
      setLoading(false);
    }
  }, [accounts, dispatch]);

  // Run once on mount, won't loop because loadAccounts is stable
  useEffect(() => {
    loadAccounts();
  }, [loadAccounts]);

  // Format currency for INR
  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
    }).format(value);

  // Compute totals from fetched accounts
  const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);
  const debtTotal = accounts
    .filter((acc) => acc.balance < 0)
    .reduce((sum, acc) => sum + acc.balance, 0);
  // You can replace this with real API data later
  const netWorthImpact = 2350.75;

  return (
    <div className="w-full">
      <div className="flex flex-col gap-6 relative">
        {/* Modal overlay */}
        {showAddAccountModal && (
          <AddAccount
            onClose={() => {
              setShowAddAccountModal(false);
              loadAccounts();
            }}
          />
        )}
        {/* Main content */}
        <div
          className={
            showAddAccountModal ? "opacity-50 pointer-events-none" : ""
          }
        >
          {/* Header Section */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold">Accounts</h1>
              <p className="text-muted-foreground">
                Manage all your financial accounts in one place
              </p>
            </div>
            <Button
              className="gap-2"
              onClick={() => setShowAddAccountModal(true)}
            >
              <Plus className="h-4 w-4" />
              Add Account
            </Button>
          </div>

          {/* Accounts Table */}
          <div className="mt-6">
            <Card className="overflow-hidden">
              <CardHeader className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                <CardTitle className="text-lg">Your Accounts</CardTitle>
                <div className="relative w-full md:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Search accounts..." className="pl-10" />
                </div>
              </CardHeader>

              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  {/* New: Loader / Error / Empty / Table */}
                  {loading ? (
                    <div className="flex justify-center items-center h-40">
                      <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-gray-400" />
                    </div>
                  ) : error ? (
                    <div className="text-center text-destructive py-6">
                      {error}
                    </div>
                  ) : accounts.length === 0 ? (
                    <div className="text-center text-muted-foreground py-6">
                      No accounts found.
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="min-w-[200px]">
                            Account
                          </TableHead>
                          <TableHead className="min-w-[100px]">Type</TableHead>
                          <TableHead className="min-w-[120px]">
                            Last Digits
                          </TableHead>
                          <TableHead className="min-w-[120px] text-right">
                            Balance
                          </TableHead>
                          <TableHead className="min-w-[100px]">
                            Status
                          </TableHead>
                          <TableHead className="min-w-[100px] text-right">
                            Actions
                          </TableHead>
                        </TableRow>
                      </TableHeader>

                      <TableBody>
                        {accounts.map((account) => (
                          <TableRow key={account.id}>
                            <TableCell className="font-medium">
                              <div className="flex items-center gap-3">
                                <img
                                  src={getBankLogoUrl(account.bank)}
                                  alt={account.bank}
                                  className="h-5 w-5 object-contain"
                                />
                                <div className="min-w-0">
                                  <div className="truncate">{account.name}</div>
                                  <div className="text-sm text-muted-foreground truncate">
                                    {account.bank}
                                  </div>
                                </div>
                              </div>
                            </TableCell>

                            <TableCell>
                              <Badge
                                variant="secondary"
                                className="capitalize truncate"
                              >
                                {account.type}
                              </Badge>
                            </TableCell>

                            <TableCell>**** {account.lastDigits}</TableCell>

                            <TableCell
                              className={`text-right font-medium ${
                                account.balance < 0 ? "text-destructive" : ""
                              }`}
                            >
                              {formatCurrency(account.balance)}
                            </TableCell>

                            <TableCell>
                              <Badge
                                variant="outline"
                                className={`truncate ${
                                  account.status === "active"
                                    ? "text-green-600 border-green-200 bg-green-50"
                                    : "text-gray-600 border-gray-200 bg-gray-50"
                                }`}
                              >
                                {account.status === "active"
                                  ? "Active"
                                  : "Inactive"}
                              </Badge>
                            </TableCell>

                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button
                                  variant="outline"
                                  size="icon"
                                  className="flex-shrink-0"
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="icon"
                                  className="flex-shrink-0 hover:bg-destructive/10 hover:text-destructive"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Account Insights */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="text-lg">Total Balance</CardTitle>
                <CardDescription>Sum of all account balances</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl md:text-3xl font-bold">
                  {formatCurrency(totalBalance)}
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  Includes both assets and liabilities
                </p>
              </CardContent>
            </Card>

            <Card className="h-full">
              <CardHeader>
                <CardTitle className="text-lg">Debt Summary</CardTitle>
                <CardDescription>Total outstanding liabilities</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl md:text-3xl font-bold text-destructive">
                  {formatCurrency(debtTotal)}
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  Credit cards, loans, and other debts
                </p>
              </CardContent>
            </Card>

            <Card className="h-full">
              <CardHeader>
                <CardTitle className="text-lg">Net Worth Impact</CardTitle>
                <CardDescription>30-day change in net worth</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl md:text-3xl font-bold text-green-500">
                  +{formatCurrency(netWorthImpact)}
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  Positive trend in your overall financial health
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
