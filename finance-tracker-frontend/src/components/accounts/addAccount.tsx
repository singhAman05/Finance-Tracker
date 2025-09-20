// src/components/accounts/AddAccount.tsx
"use client";

import { useState } from "react";
import { useDispatch } from "react-redux";
import { addAccount } from "../redux/slices/slice_accounts";
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
import { X, Eye, EyeOff } from "lucide-react";
import { createAccount } from "@/service/service_accounts";
import Image from "next/image";
import { getBankLogoUrl } from "@/service/service_accounts";

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
  { value: "digital_wallet", label: "Digital Wallet" },
  { value: "loan", label: "Loan Account" },
  { value: "credit_card", label: "Credit Card" },
  { value: "cash", label: "Cash" },
  { value: "investment", label: "Investment Account" },
];

const currencyOptions = [
  { value: "INR", label: "Indian Rupee (₹)" },
  { value: "USD", label: "US Dollar ($)" },
  { value: "EUR", label: "Euro (€)" },
  { value: "GBP", label: "British Pound (£)" },
  { value: "JPY", label: "Japanese Yen (¥)" },
];

export function AddAccount({ onClose }: AddAccountProps) {
  const dispatch = useDispatch();
  const [form, setForm] = useState({
    account_holder_name: "",
    bank_name: "",
    custom_bank_name: "",
    account_type: "" as string,
    full_account_number: "",
    balance: "",
    currency: "INR" as string,
  });

  const [showAccountNumber, setShowAccountNumber] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const update = (field: keyof typeof form, value: string) => {
    setForm((f) => ({ ...f, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!form.account_holder_name) newErrors.account_holder_name = "Required";
    if (!form.bank_name && !form.custom_bank_name)
      newErrors.bank_name = "Required";
    if (!form.account_type) newErrors.account_type = "Required";
    if (!form.full_account_number) newErrors.full_account_number = "Required";
    else if (form.full_account_number.length < 4)
      newErrors.full_account_number = "Min 4 digits";
    if (!form.balance) newErrors.balance = "Required";
    else if (isNaN(parseFloat(form.balance))) newErrors.balance = "Invalid";
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
      const account_number_last4 = form.full_account_number.slice(-4);
      const res = await createAccount({
        bank_name: bankName,
        account_type: form.account_type,
        balance: parseFloat(form.balance),
        currency: form.currency,
        account_holder_name: form.account_holder_name,
        account_number_last4,
      });
      if (res?.data) {
        dispatch(addAccount(res.data));
      }

      onClose(); // triggers parent effect to reload
    } catch (err) {
      console.error(err);
      setErrors({ submit: "Error creating account" });
    } finally {
      setLoading(false);
    }
  };

  const finalBank =
    form.bank_name === "Other" ? form.custom_bank_name : form.bank_name;
  const logoUrl = finalBank ? getBankLogoUrl(finalBank) : null;
  const accountTypeLabel = accountTypes.find(
    (t) => t.value === form.account_type
  )?.label;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
      <Card className="w-full max-w-2xl bg-white dark:bg-gray-900 rounded-xl shadow-xl mx-2">
        <div className="relative p-6">
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            onClick={onClose}
          >
            <X className="h-5 w-5" />
          </Button>

          <CardHeader className="mb-4 p-0">
            <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
              Add New Account
            </CardTitle>
            <CardDescription className="text-gray-500 dark:text-gray-400 mt-1">
              Securely connect your financial accounts
            </CardDescription>
          </CardHeader>

          <form onSubmit={handleSubmit} className="space-y-6 mt-4">
            <CardContent className="p-0 space-y-6">
              {errors.submit && (
                <div className="text-red-600 text-sm p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                  {errors.submit}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                {/* Account Holder */}
                <div className="space-y-2">
                  <Label htmlFor="account_holder_name" className="font-medium">
                    Account Holder Name
                  </Label>
                  <Input
                    id="account_holder_name"
                    placeholder="John Doe"
                    value={form.account_holder_name}
                    onChange={(e) =>
                      update("account_holder_name", e.target.value)
                    }
                    className="mt-1"
                  />
                  {errors.account_holder_name && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.account_holder_name}
                    </p>
                  )}
                </div>

                {/* Bank Name */}
                <div className="space-y-2">
                  <Label className="font-medium">Bank Name</Label>
                  <Select
                    value={form.bank_name}
                    onValueChange={(v) => update("bank_name", v)}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select your bank" />
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
                    <Input
                      className="mt-2"
                      placeholder="Enter bank name"
                      value={form.custom_bank_name}
                      onChange={(e) =>
                        update("custom_bank_name", e.target.value)
                      }
                    />
                  )}
                  {errors.bank_name && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.bank_name}
                    </p>
                  )}
                </div>

                {/* Account Number */}
                <div className="space-y-2">
                  <Label htmlFor="full_account_number" className="font-medium">
                    Account Number
                  </Label>
                  <div className="relative mt-1">
                    <Input
                      id="full_account_number"
                      type={showAccountNumber ? "text" : "password"}
                      placeholder="Enter full account number"
                      value={form.full_account_number}
                      onChange={(e) =>
                        update("full_account_number", e.target.value)
                      }
                      className="pr-10"
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                      onClick={() => setShowAccountNumber(!showAccountNumber)}
                    >
                      {showAccountNumber ? (
                        <EyeOff size={18} />
                      ) : (
                        <Eye size={18} />
                      )}
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    We only store the last 4 digits for security
                  </p>
                  {errors.full_account_number && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.full_account_number}
                    </p>
                  )}
                </div>

                {/* Account Type */}
                <div className="space-y-2">
                  <Label className="font-medium">Account Type</Label>
                  <Select
                    value={form.account_type}
                    onValueChange={(v) => update("account_type", v)}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select account type" />
                    </SelectTrigger>
                    <SelectContent>
                      {accountTypes.map((t) => (
                        <SelectItem key={t.value} value={t.value}>
                          {t.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.account_type && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.account_type}
                    </p>
                  )}
                </div>

                {/* Initial Balance */}
                <div className="space-y-2">
                  <Label htmlFor="balance" className="font-medium">
                    Initial Balance
                  </Label>
                  <Input
                    id="balance"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={form.balance}
                    onChange={(e) => update("balance", e.target.value)}
                  />
                  {errors.balance && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.balance}
                    </p>
                  )}
                </div>

                {/* Currency */}
                <div className="space-y-2">
                  <Label className="font-medium">Currency</Label>
                  <Select
                    value={form.currency}
                    onValueChange={(v) => update("currency", v)}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select currency" />
                    </SelectTrigger>
                    <SelectContent>
                      {currencyOptions.map((c) => (
                        <SelectItem key={c.value} value={c.value}>
                          {c.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Security Notice */}
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-100 dark:border-blue-800/50">
                <div className="flex items-start">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-blue-500 dark:text-blue-400 mt-0.5 mr-2 flex-shrink-0"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <div>
                    <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-1">
                      Security Notice
                    </h4>
                    <p className="text-blue-700 dark:text-blue-300 text-xs">
                      Your full account number is never stored. We only keep the
                      last 4 digits for identification purposes.
                    </p>
                  </div>
                </div>
              </div>

              {/* Account Preview */}
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
                  Account Preview
                </h4>
                <div className="flex items-start gap-4">
                  {logoUrl ? (
                    <div className="bg-white p-2 rounded-lg border border-gray-200">
                      <Image
                        src={logoUrl}
                        alt={finalBank}
                        width={40}
                        height={40}
                        className="object-contain"
                      />
                    </div>
                  ) : (
                    <div className="bg-gray-200 dark:bg-gray-700 w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0">
                      <div className="bg-gray-300 dark:bg-gray-600 rounded-full w-8 h-8" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-gray-900 dark:text-white font-medium text-lg truncate">
                      {form.account_holder_name || "Account Holder"}
                    </p>
                    <div className="flex flex-wrap items-center gap-2 mt-1">
                      <span className="text-gray-600 dark:text-gray-400 text-sm truncate">
                        {finalBank || "Your bank"} ••••{" "}
                        {form.full_account_number.slice(-4) || "XXXX"}
                      </span>
                      <span className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs px-2 py-1 rounded-full whitespace-nowrap">
                        {accountTypeLabel}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>

            <CardFooter className="p-0">
              <Button
                type="submit"
                className="w-full bg-gray-900 hover:bg-gray-800 text-white font-medium py-3 px-4 rounded-lg transition-all"
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Creating Account...
                  </span>
                ) : (
                  "Add Account"
                )}
              </Button>
            </CardFooter>
          </form>
        </div>
      </Card>
    </div>
  );
}
