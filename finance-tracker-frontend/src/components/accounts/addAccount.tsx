"use client";

import { useState } from "react";
import { useDispatch } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import { addAccount } from "../redux/slices/slice_accounts";
import { createAccount, getBankLogoUrl } from "@/service/service_accounts";
import Image from "next/image";

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
  X,
  Eye,
  EyeOff,
  Loader2,
  ShieldCheck,
  Wallet,
  AlertCircle,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface AddAccountProps {
  onClose: () => void;
}

const bankOptions = [
  "State Bank of India",
  "HDFC Bank",
  "ICICI Bank",
  "Axis Bank",
  "Kotak Mahindra Bank",
  "Paytm Payments Bank",
  "Bank of Baroda",
  "Other",
];
const accountTypes = [
  { value: "savings", label: "Savings Account" },
  { value: "current", label: "Current Account" },
  { value: "credit_card", label: "Credit Card" },
  { value: "investment", label: "Investment" },
  { value: "digital_wallet", label: "Digital Wallet" },
];

export function AddAccount({ onClose }: AddAccountProps) {
  const dispatch = useDispatch();
  const [form, setForm] = useState({
    account_holder_name: "",
    bank_name: "",
    custom_bank_name: "",
    account_type: "",
    full_account_number: "",
    balance: "",
    currency: "INR",
  });

  const [showAccountNumber, setShowAccountNumber] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const update = (field: keyof typeof form, value: string) => {
    setForm((f) => ({ ...f, [field]: value }));
    if (errors[field])
      setErrors((prev) => {
        const { [field]: _, ...rest } = prev;
        return rest;
      });
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!form.account_holder_name.trim())
      newErrors.account_holder_name = "Name is required";
    if (
      !form.bank_name ||
      (form.bank_name === "Other" && !form.custom_bank_name)
    )
      newErrors.bank_name = "Bank selection required";
    if (!form.account_type) newErrors.account_type = "Select an account type";
    if (form.full_account_number.length < 4)
      newErrors.full_account_number = "Minimum 4 digits required";
    if (!form.balance || isNaN(parseFloat(form.balance)))
      newErrors.balance = "Valid balance required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);

    try {
      const bankName =
        form.bank_name === "Other" ? form.custom_bank_name : form.bank_name;
      const res = await createAccount({
        ...form,
        bank_name: bankName,
        balance: parseFloat(form.balance),
        account_number_last4: form.full_account_number.slice(-4),
      });
      if (res?.data) dispatch(addAccount(res.data));
      onClose();
    } catch (err) {
      setErrors({ submit: "Failed to create account. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  const finalBank =
    form.bank_name === "Other" ? form.custom_bank_name : form.bank_name;
  const logoUrl = finalBank ? getBankLogoUrl(finalBank) : null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-slate-950/40 backdrop-blur-md flex items-center justify-center p-4 z-50"
    >
      <motion.div
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="w-full max-w-2xl"
      >
        <Card className="border-none shadow-2xl bg-white dark:bg-slate-900 overflow-hidden">
          {/* Top Progress/Status Bar */}
          <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800">
            <motion.div
              className="h-full bg-slate-800"
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{ duration: 0.8 }}
            />
          </div>

          <div className="relative p-6 sm:p-8">
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-6 right-6 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
              onClick={onClose}
            >
              <X className="h-5 w-5 text-slate-500" />
            </Button>

            <CardHeader className="p-0 mb-8">
              <div className="flex items-center gap-4 mb-2">
                <div className="p-3 bg-slate-900 rounded-2xl shadow-lg shadow-blue-500/20">
                  <Wallet className="h-6 w-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-2xl font-bold tracking-tight">
                    Add New Account
                  </CardTitle>
                  <CardDescription>
                    Setup your financial profile to track expenses
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            <form onSubmit={handleSubmit} className="space-y-6">
              <CardContent className="p-0">
                <AnimatePresence mode="wait">
                  {errors.submit && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      className="flex items-center gap-2 p-3 mb-6 text-sm text-red-600 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-100 dark:border-red-800"
                    >
                      <AlertCircle className="h-4 w-4" /> {errors.submit}
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Account Holder */}
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Holder Name
                    </Label>
                    <Input
                      placeholder="e.g. John Doe"
                      value={form.account_holder_name}
                      onChange={(e) =>
                        update("account_holder_name", e.target.value)
                      }
                      className={cn(
                        "bg-slate-50 border-slate-200 dark:bg-slate-800/50 dark:border-slate-700 h-11 focus:ring-2 focus:ring-blue-500/20 transition-all",
                        errors.account_holder_name &&
                          "border-red-500 ring-red-500/20"
                      )}
                    />
                  </div>

                  {/* Bank Name */}
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Bank Institution
                    </Label>
                    <Select
                      value={form.bank_name}
                      onValueChange={(v) => update("bank_name", v)}
                    >
                      <SelectTrigger
                        className={cn(
                          "bg-slate-50 dark:bg-slate-800/50 h-11",
                          errors.bank_name && "border-red-500"
                        )}
                      >
                        <SelectValue placeholder="Select institution" />
                      </SelectTrigger>
                      <SelectContent>
                        {bankOptions.map((b) => (
                          <SelectItem key={b} value={b}>
                            {b}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {form.bank_name === "Other" && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                      >
                        <Input
                          className="mt-2 h-11"
                          placeholder="Enter custom bank name"
                          value={form.custom_bank_name}
                          onChange={(e) =>
                            update("custom_bank_name", e.target.value)
                          }
                        />
                      </motion.div>
                    )}
                  </div>

                  {/* Account Number */}
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Account Number
                    </Label>
                    <div className="relative">
                      <Input
                        type={showAccountNumber ? "text" : "password"}
                        placeholder="Full account number"
                        value={form.full_account_number}
                        onChange={(e) =>
                          update("full_account_number", e.target.value)
                        }
                        className={cn(
                          "bg-slate-50 dark:bg-slate-800/50 h-11 pr-12",
                          errors.full_account_number && "border-red-500"
                        )}
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600 transition-colors"
                        onClick={() => setShowAccountNumber(!showAccountNumber)}
                      >
                        {showAccountNumber ? (
                          <EyeOff size={18} />
                        ) : (
                          <Eye size={18} />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Account Type */}
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Account Category
                    </Label>
                    <Select
                      value={form.account_type}
                      onValueChange={(v) => update("account_type", v)}
                    >
                      <SelectTrigger
                        className={cn(
                          "bg-slate-50 dark:bg-slate-800/50 h-11",
                          errors.account_type && "border-red-500"
                        )}
                      >
                        <SelectValue placeholder="Type of account" />
                      </SelectTrigger>
                      <SelectContent>
                        {accountTypes.map((t) => (
                          <SelectItem key={t.value} value={t.value}>
                            {t.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Balance */}
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Starting Balance
                    </Label>
                    <div className="relative">
                      <Input
                        type="number"
                        placeholder="0.00"
                        value={form.balance}
                        onChange={(e) => update("balance", e.target.value)}
                        className={cn(
                          "bg-slate-50 dark:bg-slate-800/50 h-11 pl-12",
                          errors.balance && "border-red-500"
                        )}
                      />
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-medium text-sm border-r pr-2 border-slate-200 dark:border-slate-700">
                        {form.currency}
                      </div>
                    </div>
                  </div>

                  {/* Currency */}
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Currency
                    </Label>
                    <Select
                      value={form.currency}
                      onValueChange={(v) => update("currency", v)}
                    >
                      <SelectTrigger className="bg-slate-50 dark:bg-slate-800/50 h-11">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="INR">INR (₹)</SelectItem>
                        <SelectItem value="USD">USD ($)</SelectItem>
                        <SelectItem value="EUR">EUR (€)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Live Preview Card */}
                <div className="mt-8 p-5 bg-gradient-to-br from-slate-50 to-blue-50/30 dark:from-slate-800/50 dark:to-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                      Account Preview
                    </span>
                    <ShieldCheck className="h-4 w-4 text-emerald-500" />
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-xl bg-white dark:bg-slate-800 flex items-center justify-center border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden">
                      {logoUrl ? (
                        <Image
                          src={logoUrl}
                          alt="bank"
                          width={32}
                          height={32}
                          className="object-contain"
                        />
                      ) : (
                        <div className="h-6 w-6 bg-slate-200 dark:bg-slate-700 animate-pulse rounded-full" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-slate-900 dark:text-white truncate">
                        {form.account_holder_name || "New Account Holder"}
                      </p>
                      <p className="text-xs text-slate-500">
                        {finalBank || "Financial Institution"} ••••{" "}
                        {form.full_account_number.slice(-4) || "0000"}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-mono font-bold text-slate-900 dark:text-blue-400">
                        {form.currency}{" "}
                        {Number(form.balance || 0).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>

              <CardFooter className="p-0 pt-4">
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 bg-slate-900 hover:bg-slate-800 dark:bg-blue-600 dark:hover:bg-blue-700 text-white font-bold rounded-xl transition-all shadow-lg active:scale-[0.98]"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Securing Data...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      Create Account <ChevronRight className="h-4 w-4" />
                    </span>
                  )}
                </Button>
              </CardFooter>
            </form>
          </div>
        </Card>
      </motion.div>
    </motion.div>
  );
}
