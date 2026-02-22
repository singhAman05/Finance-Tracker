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
  ArrowRight,
  Landmark,
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

  const inputClasses =
    "bg-muted border border-border h-12 rounded-xl focus-visible:ring-1 focus-visible:ring-ring transition-all font-medium text-sm text-text-primary placeholder:text-text-secondary";

  return (
    <div className="w-full max-w-2xl relative mx-auto">
      <div className="rounded-[2.5rem] sm:rounded-3xl border border-border bg-card overflow-hidden shadow-2xl transition-all duration-300 relative">
        {/* Background pattern matching page.tsx */}
        <div
          className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(circle, var(--color-text-primary) 1px, transparent 1px)`,
            backgroundSize: "24px 24px",
          }}
        />

        {/* Minimalist progress bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-muted">
          <motion.div
            className="h-full bg-primary"
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ duration: 0.8, ease: "circOut" }}
          />
        </div>

        <div className="relative p-5 sm:p-8 md:p-10">
          {/* Close button */}
          <button
            className="absolute top-4 right-4 sm:top-6 sm:right-6 w-9 h-9 sm:w-10 sm:h-10 rounded-full border border-border flex items-center justify-center hover:bg-muted transition-colors z-20"
            onClick={onClose}
          >
            <X className="h-4 w-4 text-text-secondary" />
          </button>

          {/* Header */}
          <div className="mb-8 sm:mb-10 flex items-start gap-4 sm:gap-5">
            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-primary rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg shadow-primary/10 shrink-0">
              <Landmark className="h-5 w-5 sm:h-6 sm:w-6 text-primary-foreground" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tighter text-text-primary">
                Link New Account
              </h2>
              <p className="text-xs sm:text-sm text-text-secondary mt-1 max-w-sm leading-relaxed">
                Connect your financial institution to start tracking transparently.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Error Alert */}
            <AnimatePresence mode="wait">
              {errors.submit && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="flex items-center gap-3 p-4 text-sm border border-red-200 dark:border-red-900/30 rounded-2xl bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400"
                >
                  <AlertCircle className="h-5 w-5 shrink-0" />
                  <span>{errors.submit}</span>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Account Holder */}
              <div className="space-y-2.5">
                <Label className="text-xs font-semibold uppercase tracking-wider text-text-secondary ml-1">
                  Holder Name
                </Label>
                <Input
                  placeholder="e.g. Alex Smith"
                  value={form.account_holder_name}
                  onChange={(e) =>
                    update("account_holder_name", e.target.value)
                  }
                  className={cn(
                    inputClasses,
                    errors.account_holder_name &&
                      "border-red-500 focus-visible:ring-red-500"
                  )}
                />
                {errors.account_holder_name && (
                  <p className="text-xs text-red-500 ml-1">
                    {errors.account_holder_name}
                  </p>
                )}
              </div>

              {/* Bank Name */}
              <div className="space-y-2.5">
                <Label className="text-xs font-semibold uppercase tracking-wider text-text-secondary ml-1">
                  Bank Institution
                </Label>
                <Select
                  value={form.bank_name}
                  onValueChange={(v) => update("bank_name", v)}
                >
                  <SelectTrigger
                    className={cn(
                      inputClasses,
                      errors.bank_name &&
                        "border-red-500 focus-visible:ring-red-500"
                    )}
                  >
                    <SelectValue placeholder="Select Bank" />
                  </SelectTrigger>
                  <SelectContent
                    className="bg-card border border-border rounded-xl"
                  >
                    {bankOptions.map((b) => (
                      <SelectItem key={b} value={b} className="cursor-pointer">
                        {b}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {form.bank_name === "Other" && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <Input
                      className={cn(inputClasses, "mt-3")}
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
              <div className="space-y-2.5">
                <Label className="text-xs font-semibold uppercase tracking-wider text-text-secondary ml-1">
                  Account Number
                </Label>
                <div className="relative">
                  <Input
                    type={showAccountNumber ? "text" : "password"}
                    placeholder="0000 0000 0000"
                    value={form.full_account_number}
                    onChange={(e) =>
                      update("full_account_number", e.target.value)
                    }
                    className={cn(
                      inputClasses,
                      "pr-12 tracking-widest font-mono",
                      errors.full_account_number &&
                        "border-red-500 focus-visible:ring-red-500"
                    )}
                  />
                  <button
                    type="button"
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary transition-colors"
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
              <div className="space-y-2.5">
                <Label className="text-xs font-semibold uppercase tracking-wider text-text-secondary ml-1">
                  Category
                </Label>
                <Select
                  value={form.account_type}
                  onValueChange={(v) => update("account_type", v)}
                >
                  <SelectTrigger
                    className={cn(
                      inputClasses,
                      errors.account_type &&
                        "border-red-500 focus-visible:ring-red-500"
                    )}
                  >
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent
                    className="bg-card border border-border rounded-xl"
                  >
                    {accountTypes.map((t) => (
                      <SelectItem key={t.value} value={t.value} className="cursor-pointer">
                        {t.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Balance */}
              <div className="space-y-2.5">
                <Label className="text-xs font-semibold uppercase tracking-wider text-text-secondary ml-1">
                  Initial Balance
                </Label>
                <div className="relative">
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={form.balance}
                    onChange={(e) => update("balance", e.target.value)}
                    className={cn(
                      inputClasses,
                      "pl-14 text-lg font-bold tracking-tight",
                      errors.balance &&
                        "border-red-500 focus-visible:ring-red-500"
                    )}
                  />
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary font-bold text-sm border-r pr-3 border-border">
                    {form.currency}
                  </div>
                </div>
              </div>

              {/* Currency */}
              <div className="space-y-2.5">
                <Label className="text-xs font-semibold uppercase tracking-wider text-text-secondary ml-1">
                  Currency
                </Label>
                <Select
                  value={form.currency}
                  onValueChange={(v) => update("currency", v)}
                >
                  <SelectTrigger className={inputClasses}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent
                    className="bg-card border border-border rounded-xl"
                  >
                    <SelectItem value="INR">INR (₹)</SelectItem>
                    <SelectItem value="USD">USD ($)</SelectItem>
                    <SelectItem value="EUR">EUR (€)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Live Preview Card */}
            <div className="pt-2">
              <div className="p-6 rounded-2xl bg-muted border border-border relative overflow-hidden group">
                <div className="absolute top-4 right-4">
                  <div className="px-2 py-1 rounded bg-card border border-border text-[10px] font-bold uppercase tracking-wider text-text-secondary">
                    Preview
                  </div>
                </div>
                
                <div className="flex items-center gap-5 relative z-10">
                  <div className="w-16 h-16 rounded-2xl bg-card border border-border flex items-center justify-center p-2 shadow-sm">
                    {logoUrl ? (
                      <Image
                        src={logoUrl}
                        alt="bank"
                        width={40}
                        height={40}
                        className="object-contain"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-muted animate-pulse" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm text-text-secondary font-medium mb-1">
                      {finalBank || "Select Bank"}
                    </p>
                    <p className="text-xl font-bold tracking-tight text-text-primary">
                      {form.currency} {Number(form.balance || 0).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className={cn(
                "w-full h-14 rounded-full bg-primary text-primary-foreground font-semibold text-lg hover:scale-[1.01] active:scale-[0.99] transition-all shadow-xl shadow-primary/10 flex items-center justify-center gap-2",
                loading && "opacity-70 cursor-not-allowed hover:scale-100"
              )}
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight className="h-5 w-5" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}