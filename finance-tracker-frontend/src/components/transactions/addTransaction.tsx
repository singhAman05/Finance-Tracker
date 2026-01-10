"use client";

import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import { RootState } from "@/app/store";
import { format } from "date-fns";
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

// UI Components
import { Dialog, DialogTrigger, DialogContent } from "@/components/ui/dialog";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils"; // Shadcn utility

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

export default function AddTransaction() {
  const dispatch = useDispatch();
  const accounts = useSelector((state: RootState) => state.accounts.accounts);
  const categories = useSelector(
    (state: RootState) => state.categories.categories
  );

  const [open, setOpen] = useState(false);
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
    const loadInitialData = async () => {
      try {
        setLoading(true);
        const [accountsData, categoriesData] = await Promise.all([
          accounts.length === 0 ? fetchAccounts() : Promise.resolve(accounts),
          categories.length === 0
            ? fetchCategories()
            : Promise.resolve(categories),
        ]);

        if (accounts.length === 0) dispatch(setAccounts(accountsData));
        if (categories.length === 0) dispatch(setCategories(categoriesData));
        console.log("Loaded accounts:", accounts);
        if (accountsData.length > 0 && !accountId)
          setAccountId(accountsData[0].id);
        setError(null);
      } catch {
        setError("Failed to sync your financial data.");
      } finally {
        setLoading(false);
      }
    };

    if (open) loadInitialData();
  }, [open, accounts, categories, dispatch, accountId]);

  useEffect(() => {
    if (open) {
      setDate(new Date());
      setAmount("");
      setCategory("");
      setDescription("");
    }
  }, [open]);

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
        setOpen(false);
      }
    } catch (err) {
      console.error("Submission error", err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="group bg-slate-900 hover:bg-slate-800 text-white rounded-full px-6 shadow-md transition-all hover:shadow-xl active:scale-95">
          <Plus className="mr-2 h-4 w-4 transition-transform group-hover:rotate-90" />
          Add Transaction
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-2xl p-0 border-none bg-transparent overflow-visible [&>button]:hidden">
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative"
            >
              <Card className="border shadow-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl overflow-hidden">
                {/* Header Section */}
                <div className="bg-slate-50/50 dark:bg-slate-800/50 border-b p-6 sm:p-8">
                  <div className="flex justify-between items-start">
                    <div className="flex gap-4">
                      <div className="h-12 w-12 bg-slate-900 dark:bg-slate-100 rounded-2xl flex items-center justify-center shadow-inner">
                        <Wallet className="h-6 w-6 text-white dark:text-slate-900" />
                      </div>
                      <div>
                        <CardTitle className="text-2xl font-bold tracking-tight">
                          New Transaction
                        </CardTitle>
                        <CardDescription className="text-slate-500">
                          Record your financial activity accurately.
                        </CardDescription>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setOpen(false)}
                      className="rounded-full hover:bg-slate-200/50"
                    >
                      <X className="h-5 w-5" />
                    </Button>
                  </div>

                  {/* Enhanced Toggle */}
                  <div className="mt-8 flex p-1 bg-slate-200/50 dark:bg-slate-800 rounded-xl relative">
                    <motion.div
                      className={cn(
                        "absolute inset-y-1 rounded-lg shadow-sm transition-all duration-300",
                        type === "expense"
                          ? "left-1 right-1/2 bg-white dark:bg-slate-700"
                          : "left-1/2 right-1 bg-emerald-500"
                      )}
                    />
                    <button
                      type="button"
                      onClick={() => setType("expense")}
                      className={cn(
                        "flex-1 flex items-center justify-center py-2 text-sm font-semibold z-10 transition-colors",
                        type === "expense"
                          ? "text-slate-900 dark:text-white"
                          : "text-slate-500"
                      )}
                    >
                      <Minus className="mr-2 h-4 w-4" /> Expense
                    </button>
                    <button
                      type="button"
                      onClick={() => setType("income")}
                      className={cn(
                        "flex-1 flex items-center justify-center py-2 text-sm font-semibold z-10 transition-colors",
                        type === "income" ? "text-white" : "text-slate-500"
                      )}
                    >
                      <Plus className="mr-2 h-4 w-4" /> Income
                    </button>
                  </div>
                </div>

                <CardContent className="p-6 sm:p-8">
                  {loading ? (
                    <div className="flex flex-col items-center justify-center py-12 gap-4">
                      <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
                      <p className="text-sm text-slate-500">
                        Fetching accounts...
                      </p>
                    </div>
                  ) : (
                    <form onSubmit={onSubmit} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                        {/* Account Selection */}
                        <div className="md:col-span-2 space-y-2">
                          <Label className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                            <CreditCard className="h-3 w-3" /> Source Account
                          </Label>
                          <Select
                            value={accountId}
                            onValueChange={setAccountId}
                          >
                            <SelectTrigger className="h-12 bg-slate-50/50 border-slate-200">
                              <SelectValue placeholder="Which account?" />
                            </SelectTrigger>
                            <SelectContent>
                              {accounts.map((a) => (
                                <SelectItem
                                  key={a.id}
                                  value={a.id}
                                  className="py-3"
                                >
                                  <div className="flex justify-between w-full gap-2">
                                    <span className="font-medium">
                                      {a.name}
                                    </span>
                                    <span className="text-slate-400">
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
                          <Label className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                            <CalendarIcon className="h-3 w-3" /> Date
                          </Label>
                          <Popover modal>
                            <PopoverTrigger asChild>
                              <Button
                                type="button"
                                variant="outline"
                                className="h-12 w-full justify-start bg-slate-50/50 border-slate-200 font-normal"
                              >
                                {date ? format(date, "PPP") : "Select date"}
                                <ChevronDown className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </PopoverTrigger>

                            <PopoverContent
                              align="start"
                              className="w-auto p-0 pointer-events-auto"
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
                          <Label className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                            <Tag className="h-3 w-3" /> Category
                          </Label>
                          <Select value={category} onValueChange={setCategory}>
                            <SelectTrigger className="h-12 bg-slate-50/50 border-slate-200">
                              <SelectValue placeholder="Choose category" />
                            </SelectTrigger>
                            <SelectContent>
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
                          <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                            Amount
                          </Label>

                          <div className="relative">
                            {/* Currency Prefix */}
                            <div className="absolute left-0 inset-y-0 flex items-center px-4 pointer-events-none text-slate-400 font-semibold">
                              {
                                accounts.find((a) => a.id === accountId)
                                  ?.currency
                              }
                            </div>

                            <Input
                              type="number"
                              min="0"
                              step="0.01"
                              placeholder="0.00"
                              value={amount}
                              onChange={(e) => setAmount(e.target.value)}
                              className="h-14 pl-20 text-xl font-semibold bg-slate-50/50 border-slate-200 focus:ring-2 focus:ring-slate-900 transition-all"
                            />
                          </div>
                        </div>

                        {/* Description */}
                        <div className="md:col-span-2 space-y-2">
                          <Label className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                            <AlignLeft className="h-3 w-3" /> Description
                            (Optional)
                          </Label>
                          <Input
                            placeholder="Lunch at the cafe..."
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="h-12 bg-slate-50/50 border-slate-200"
                          />
                        </div>
                      </div>

                      <Button
                        type="submit"
                        disabled={submitting || !amount || !category}
                        className={cn(
                          "w-full h-14 rounded-2xl text-lg font-bold transition-all shadow-lg active:scale-[0.98]",
                          type === "expense"
                            ? "bg-slate-900 hover:bg-slate-800"
                            : "bg-emerald-600 hover:bg-emerald-700"
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
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
