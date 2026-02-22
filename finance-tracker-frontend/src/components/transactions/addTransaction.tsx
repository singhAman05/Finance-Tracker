"use client";

import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { RootState } from "@/app/store";
import { cn } from "@/lib/utils";

// UI Components
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import {
  Plus,
  Minus,
  CalendarIcon,
  X,
  Wallet,
  Loader2,
  ChevronDown,
  CreditCard,
  Tag,
  AlignLeft,
} from "lucide-react";

// Redux & Services
import { setAccounts } from "../redux/slices/slice_accounts";
import { setCategories } from "../redux/slices/slice_categories";
import { addTransaction } from "../redux/slices/slice_transactions";
import {
  fetchCategories,
  filterCategoriesByType,
} from "@/service/service_categories";
import { fetchAccounts } from "@/service/service_accounts";
import { createTransaction } from "@/service/service_transactions";

interface AddTransactionProps {
  onClose?: () => void;
}

export default function AddTransaction({ onClose }: AddTransactionProps) {
  const dispatch = useDispatch();
  const accounts = useSelector((state: RootState) => state.accounts.accounts);
  const categories = useSelector(
    (state: RootState) => state.categories.categories
  );

  const [date, setDate] = useState<Date | undefined>(new Date());
  const [type, setType] = useState<"expense" | "income">("expense");
  const [category, setCategory] = useState("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [accountId, setAccountId] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const loadInitialData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [accountsRes, categoriesRes] = await Promise.all([
          fetchAccounts(),
          fetchCategories(),
        ]);

        const accountsList = Array.isArray(accountsRes?.data)
          ? accountsRes.data
          : [];

        const categoriesList = Array.isArray(categoriesRes?.data)
          ? categoriesRes.data
          : [];

        if (!isMounted) return;

        dispatch(setAccounts(accountsList));
        dispatch(setCategories(categoriesList));

        if (accountsList.length > 0) {
          setAccountId((prev) => prev || accountsList[0].id);
        }
      } catch (err) {
        if (isMounted) {
          setError("Failed to sync your financial data.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadInitialData();

    return () => {
      isMounted = false;
    };
  }, [dispatch]);

  const filteredCategories = filterCategoriesByType(categories, type);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accountId || !category || !amount) return;

    try {
      setSubmitting(true);
      const numericAmount = Math.abs(parseFloat(amount));
      const payload = {
        account_id: accountId,
        category_id: category,
        amount: numericAmount,
        type,
        date:
          date?.toISOString().split("T")[0] ??
          new Date().toISOString().split("T")[0],
        description: description.trim() || undefined,
        is_recurring: false,
      };

      const result = await createTransaction(payload);
      if (!result?.error) {
        dispatch(addTransaction(result.data));
        if (onClose) onClose();
      }
    } catch (err) {
      console.error("Submission error", err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-2xl relative mx-auto">
      <Card className="border border-border shadow-2xl bg-card transition-all duration-300 overflow-hidden rounded-[2rem] sm:rounded-3xl relative">
        <div
          className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(circle, var(--color-text-primary) 1px, transparent 1px)`,
            backgroundSize: "24px 24px",
          }}
        />
        {/* Header Section */}
        <div className="bg-muted/30 border-b border-border p-5 sm:p-8 relative z-10">
          <div className="flex justify-between items-start">
            <div className="flex gap-4">
              <div className="h-12 w-12 bg-primary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/10">
                <Wallet className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <CardTitle className="text-xl sm:text-2xl font-bold tracking-tight text-text-primary">
                  New Transaction
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm text-text-secondary">
                  Record your financial activity accurately.
                </CardDescription>
              </div>
            </div>
            {onClose && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="rounded-full hover:bg-muted text-text-secondary"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>

          {/* Enhanced Toggle */}
          <div className="mt-8 flex p-1 bg-muted rounded-xl relative border border-border">
            <motion.div
              layoutId="type-toggle"
              className={cn(
                "absolute inset-y-1 rounded-lg shadow-sm transition-all duration-300",
                type === "expense"
                  ? "left-1 right-1/2 bg-card border border-border"
                  : "left-1/2 right-1 bg-success"
              )}
            />
            <button
              type="button"
              onClick={() => setType("expense")}
              className={cn(
                "flex-1 flex items-center justify-center py-2 text-sm font-semibold z-10 transition-colors",
                type === "expense" ? "text-text-primary" : "text-text-secondary"
              )}
            >
              <Minus className="mr-2 h-4 w-4" /> Expense
            </button>
            <button
              type="button"
              onClick={() => setType("income")}
              className={cn(
                "flex-1 flex items-center justify-center py-2 text-sm font-semibold z-10 transition-colors",
                type === "income" ? "text-white" : "text-text-secondary"
              )}
            >
              <Plus className="mr-2 h-4 w-4" /> Income
            </button>
          </div>
        </div>

        <CardContent className="p-5 sm:p-8">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 gap-4">
              <Loader2 className="h-8 w-8 animate-spin text-text-secondary/20" />
              <p className="text-sm text-text-secondary">
                Fetching financial data...
              </p>
            </div>
          ) : accounts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="bg-muted p-4 rounded-full mb-4">
                <Plus className="h-8 w-8 text-text-secondary" />
              </div>
              <h3 className="text-lg font-semibold text-text-primary">
                No accounts found
              </h3>
              <p className="text-text-secondary text-sm max-w-[280px] mt-2">
                You need to add at least one account before recording a transaction.
              </p>
            </div>
          ) : (
            <form onSubmit={onSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                {/* Account Selection */}
                <div className="md:col-span-2 space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-wider text-text-secondary flex items-center gap-2 ml-1">
                    <CreditCard className="h-3 w-3" /> Source Account
                  </Label>
                  <Select value={accountId} onValueChange={setAccountId}>
                    <SelectTrigger className="h-12 bg-muted border border-border rounded-xl font-medium text-text-primary focus:ring-1 focus:ring-ring">
                      <SelectValue placeholder="Which account?" />
                    </SelectTrigger>
                    <SelectContent className="bg-card border border-border rounded-xl">
                      {accounts.map((a) => (
                        <SelectItem key={a.id} value={a.id} className="py-3">
                          <div className="flex justify-between w-full gap-2">
                            <span className="font-semibold text-text-primary">
                              {a.name}
                            </span>
                            <span className="text-text-secondary/60 text-xs">
                              •••• {a.lastDigits}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Date Picker */}
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-wider text-text-secondary flex items-center gap-2 ml-1">
                    <CalendarIcon className="h-3 w-3" /> Date
                  </Label>
                  <Popover modal>
                    <PopoverTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        className="h-12 w-full justify-start bg-muted border border-border rounded-xl font-medium text-text-primary hover:bg-muted/80 focus:ring-1 focus:ring-ring"
                      >
                        {date ? format(date, "PPP") : "Select date"}
                        <ChevronDown className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent
                      align="start"
                      className="w-auto p-0 border border-border shadow-xl rounded-2xl bg-card overflow-hidden"
                    >
                      <Calendar
                        mode="single"
                        selected={date}
                        onSelect={(d) => {
                          if (d) setDate(d);
                        }}
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Category */}
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-wider text-text-secondary flex items-center gap-2 ml-1">
                    <Tag className="h-3 w-3" /> Category
                  </Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger className="h-12 bg-muted border border-border rounded-xl font-medium text-text-primary focus:ring-1 focus:ring-ring">
                      <SelectValue placeholder="Choose category" />
                    </SelectTrigger>
                    <SelectContent className="bg-card border border-border rounded-xl">
                      {filteredCategories.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Amount */}
                <div className="md:col-span-2 space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-wider text-text-secondary ml-1">
                    Amount
                  </Label>
                  <div className="relative">
                    <div className="absolute left-0 inset-y-0 flex items-center px-4 pointer-events-none text-text-secondary font-bold text-sm border-r border-border mr-4">
                      {accounts.find((a) => a.id === accountId)?.currency || "INR"}
                    </div>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="h-14 pl-20 text-2xl font-bold tracking-tight bg-muted border border-border rounded-xl focus:ring-1 focus:ring-ring transition-all text-text-primary"
                    />
                  </div>
                </div>

                {/* Description */}
                <div className="md:col-span-2 space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-wider text-text-secondary flex items-center gap-2 ml-1">
                    <AlignLeft className="h-3 w-3" /> Description
                  </Label>
                  <Input
                    placeholder="Lunch at the cafe..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="h-12 bg-muted border border-border rounded-xl font-medium text-text-primary placeholder:text-text-secondary"
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={submitting || !amount || !category}
                className={cn(
                  "w-full h-14 rounded-2xl text-lg font-bold transition-all shadow-lg active:scale-[0.98] mt-2",
                  type === "expense"
                    ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-primary/20"
                    : "bg-success text-white hover:bg-success/90 shadow-success/20"
                )}
              >
                {submitting ? (
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                ) : (
                  `Confirm ${type === "expense" ? "Expense" : "Income"}`
                )}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
