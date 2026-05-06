"use client";

import { useState } from "react";
import { useDispatch } from "react-redux";
import { motion } from "framer-motion";
import { updateAccountInStore } from "../redux/slices/slice_accounts";
import { updateAccount } from "@/service/service_accounts";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Loader2, Shield, ShieldOff } from "lucide-react";

interface EditAccountProps {
  open: boolean;
  onClose: () => void;
  account: {
    id: string;
    name: string;
    type: string;
    balance: number;
    lastDigits: string;
    bank: string;
    bankName: string;
    currency: string;
    status: string;
  };
  onUpdated?: () => void;
}

const accountTypes = [
  { value: "savings", label: "Savings Account" },
  { value: "current", label: "Current Account" },
  { value: "credit_card", label: "Credit Card" },
  { value: "investment", label: "Investment" },
  { value: "digital_wallet", label: "Digital Wallet" },
  { value: "loan", label: "Loan" },
  { value: "cash", label: "Cash" },
];

export function EditAccountModal({ open, onClose, account, onUpdated }: EditAccountProps) {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);

  // Derive holder name from the account name (remove " Account" suffix)
  const derivedName = account.name.replace(/ Account$/, "");

  const [form, setForm] = useState({
    account_holder_name: derivedName,
    account_type: account.type,
    status: account.status as "active" | "inactive",
  });

  const isActive = form.status === "active";

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await updateAccount(account.id, form);
      // Update redux store with mapped fields
      dispatch(updateAccountInStore({
        id: account.id,
        name: `${form.account_holder_name} Account`,
        type: form.account_type,
        status: form.status,
      }));
      onUpdated?.();
      onClose();
    } catch (err) {
      // Error notification handled by service
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="bg-card border border-border sm:max-w-[480px] p-0 overflow-hidden">
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-border">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold tracking-tight text-text-primary">
              Edit Account
            </DialogTitle>
            <DialogDescription className="text-text-secondary text-sm">
              Update your account details and manage active status.
            </DialogDescription>
          </DialogHeader>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-5 max-h-[60vh] overflow-y-auto">
          {/* Status Toggle - Prominent */}
          <div className="flex items-center justify-between p-4 rounded-xl border border-border bg-background">
            <div className="flex items-center gap-3">
              {isActive ? (
                <div className="w-9 h-9 rounded-full bg-emerald-500/10 flex items-center justify-center">
                  <Shield className="h-4 w-4 text-emerald-500" />
                </div>
              ) : (
                <div className="w-9 h-9 rounded-full bg-red-500/10 flex items-center justify-center">
                  <ShieldOff className="h-4 w-4 text-red-500" />
                </div>
              )}
              <div>
                <p className="text-sm font-semibold text-text-primary">
                  Account Status
                </p>
                <p className="text-xs text-text-secondary">
                  {isActive
                    ? "Active — transactions and bills enabled"
                    : "Inactive — all operations blocked"}
                </p>
              </div>
            </div>
            <Switch
              checked={isActive}
              onCheckedChange={(checked) =>
                setForm({ ...form, status: checked ? "active" : "inactive" })
              }
            />
          </div>

          {!isActive && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="p-3 rounded-lg bg-red-500/5 border border-red-500/20"
            >
              <p className="text-xs text-red-400">
                When inactive, no transactions can be made, bills cannot be paid from this account, and it won&apos;t appear in dropdowns.
              </p>
            </motion.div>
          )}

          {/* Account Holder Name */}
          <div className="space-y-2">
            <Label className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
              Account Holder Name
            </Label>
            <Input
              value={form.account_holder_name}
              onChange={(e) => setForm({ ...form, account_holder_name: e.target.value })}
              className="h-11 bg-background border-border rounded-xl focus-visible:ring-1 focus-visible:ring-ring"
              placeholder="John Doe"
            />
          </div>

          {/* Account Type */}
          <div className="space-y-2">
            <Label className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
              Account Type
            </Label>
            <Select value={form.account_type} onValueChange={(v) => setForm({ ...form, account_type: v })}>
              <SelectTrigger className="h-11 bg-background border-border rounded-xl">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent className="bg-card border-border">
                {accountTypes.map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Read-only info */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 rounded-xl bg-background border border-border">
              <p className="text-[10px] uppercase tracking-wider text-text-secondary mb-1">Bank</p>
              <p className="text-sm font-medium text-text-primary truncate">{account.bank}</p>
            </div>
            <div className="p-3 rounded-xl bg-background border border-border">
              <p className="text-[10px] uppercase tracking-wider text-text-secondary mb-1">Last 4</p>
              <p className="text-sm font-mono font-medium text-text-primary">{account.lastDigits}</p>
            </div>
            <div className="p-3 rounded-xl bg-background border border-border">
              <p className="text-[10px] uppercase tracking-wider text-text-secondary mb-1">Currency</p>
              <p className="text-sm font-medium text-text-primary">{account.currency}</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border flex items-center justify-end gap-3">
          <Button
            variant="outline"
            onClick={onClose}
            className="rounded-full border-border bg-card text-text-primary hover:bg-muted px-6"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={loading || !form.account_holder_name.trim()}
            className="rounded-full px-6 bg-primary text-primary-foreground hover:opacity-90 transition-all font-medium"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Save Changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
