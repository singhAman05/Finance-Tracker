"use client";

import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/app/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { createBill, CreateBillPayload } from "@/service/service_bills";
import { X } from "lucide-react";
import { toast } from "sonner";

interface AddBillFormProps {
  onClose: () => void;
}

export default function AddBillForm({ onClose }: AddBillFormProps) {
  const dispatch = useDispatch();
  const categories = useSelector((state: RootState) => state.categories.categories);
  const accounts = useSelector((state: RootState) => state.accounts.accounts);

  const [loading, setLoading] = useState(false);
  const [isRecurring, setIsRecurring] = useState(false);

  const [form, setForm] = useState({
    name: "",
    amount: "",
    system_category_id: "",
    account_id: "",
    start_date: "",
    end_date: "",
    recurrence_type: "" as CreateBillPayload["recurrence_type"],
    recurrence_interval: "1",
    reminder_days_before: "0",
    notes: "",
  });

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.name || !form.amount || !form.system_category_id || !form.start_date || !form.account_id) {
      toast.error("Please fill in all mandatory fields, including the account.");
      return;
    }

    const payload: CreateBillPayload = {
      name: form.name.trim(),
      amount: parseFloat(form.amount),
      system_category_id: form.system_category_id,
      account_id: form.account_id,
      start_date: form.start_date,
      is_recurring: isRecurring,
      recurrence_type: isRecurring ? form.recurrence_type : undefined,
      recurrence_interval: isRecurring ? parseInt(form.recurrence_interval) : undefined,
      end_date: isRecurring && form.end_date ? form.end_date : undefined,
      reminder_days_before: parseInt(form.reminder_days_before) || 0,
      notes: form.notes.trim() || undefined,
    };

    try {
      setLoading(true);
      const result = await createBill(payload);
      if (result) {
        toast.success("Bill created successfully!");
        onClose(); // parent's onClose calls loadData(true) to refresh
      }
    } catch (err) {
      console.error("Failed to create bill:", err);
      toast.error("Failed to create bill. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const expenseCategories = categories.filter((c: any) => c.type === "expense" || !c.type);

  return (
    <Card className="w-full max-w-2xl shadow-2xl border border-border bg-card overflow-hidden rounded-[2rem] sm:rounded-3xl relative">
      <div
        className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle, var(--color-text-primary) 1px, transparent 1px)`,
          backgroundSize: "24px 24px",
        }}
      />
      
      <CardHeader className="flex flex-row items-center justify-between p-5 pb-3 sm:p-6 sm:pb-4 border-b border-border/40 relative z-10">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/10 shrink-0">
             <X className="h-6 w-6 text-primary-foreground rotate-45" />
          </div>
          <div>
            <CardTitle className="text-lg sm:text-xl font-bold tracking-tight text-text-primary">Add New Bill</CardTitle>
            <p className="text-[10px] sm:text-xs text-text-secondary mt-0.5">Set up your recurring obligations</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-2 rounded-full text-text-secondary hover:bg-muted transition-colors"
        >
          <X className="h-5 w-5" />
        </button>
      </CardHeader>

      <CardContent className="p-5 sm:pt-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Name + Amount */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="bill-name" className="text-xs font-semibold uppercase tracking-wider text-text-secondary ml-1">Bill Name *</Label>
              <Input
                id="bill-name"
                placeholder="e.g. Netflix, Electricity"
                value={form.name}
                onChange={(e) => handleChange("name", e.target.value)}
                required
                className="bg-muted border border-border h-12 rounded-xl focus-visible:ring-1 focus-visible:ring-ring transition-all font-medium text-sm text-text-primary placeholder:text-text-secondary"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="bill-amount" className="text-xs font-semibold uppercase tracking-wider text-text-secondary ml-1">Amount (₹) *</Label>
              <Input
                id="bill-amount"
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                value={form.amount}
                onChange={(e) => handleChange("amount", e.target.value)}
                required
                className="bg-muted border border-border h-12 rounded-xl focus-visible:ring-1 focus-visible:ring-ring transition-all font-medium text-sm text-text-primary placeholder:text-text-secondary"
              />
            </div>
          </div>

          {/* Category + Account */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold uppercase tracking-wider text-text-secondary ml-1">Category *</Label>
              <Select
                onValueChange={(v) => handleChange("system_category_id", v)}
                value={form.system_category_id}
              >
                <SelectTrigger className="bg-muted border border-border h-12 rounded-xl focus-visible:ring-1 focus-visible:ring-ring transition-all font-medium text-sm text-text-primary">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent className="bg-card border border-border rounded-xl">
                  {expenseCategories.map((cat: any) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold uppercase tracking-wider text-text-secondary ml-1">Account *</Label>
              <Select
                onValueChange={(v) => handleChange("account_id", v)}
                value={form.account_id}
              >
                <SelectTrigger className="bg-muted border border-border h-12 rounded-xl focus-visible:ring-1 focus-visible:ring-ring transition-all font-medium text-sm text-text-primary">
                  <SelectValue placeholder="Select account" />
                </SelectTrigger>
                <SelectContent className="bg-card border border-border rounded-xl">
                  {accounts.map((acc: any) => (
                    <SelectItem key={acc.id} value={acc.id}>
                      {acc.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Start Date + Reminder */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="bill-start-date" className="text-xs font-semibold uppercase tracking-wider text-text-secondary ml-1">Start / Due Date *</Label>
              <Input
                id="bill-start-date"
                type="date"
                value={form.start_date}
                onChange={(e) => handleChange("start_date", e.target.value)}
                required
                className="bg-muted border border-border h-12 rounded-xl focus-visible:ring-1 focus-visible:ring-ring transition-all font-medium text-sm text-text-primary"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="bill-reminder" className="text-xs font-semibold uppercase tracking-wider text-text-secondary ml-1">Remind Before (days)</Label>
              <Input
                id="bill-reminder"
                type="number"
                min="0"
                placeholder="0"
                value={form.reminder_days_before}
                onChange={(e) => handleChange("reminder_days_before", e.target.value)}
                className="bg-muted border border-border h-12 rounded-xl focus-visible:ring-1 focus-visible:ring-ring transition-all font-medium text-sm text-text-primary placeholder:text-text-secondary"
              />
            </div>
          </div>

          {/* Recurring toggle */}
          <div className="flex items-center gap-3 p-4 rounded-xl bg-card border border-border transition-all">
            <Switch
              id="bill-recurring"
              checked={isRecurring}
              onCheckedChange={setIsRecurring}
            />
            <div>
              <Label htmlFor="bill-recurring" className="cursor-pointer font-semibold text-text-primary">
                Recurring Bill
              </Label>
              <p className="text-xs text-text-secondary mt-0.5">
                Automatically creates the next instance when paid
              </p>
            </div>
          </div>

          {/* Recurring fields */}
          {isRecurring && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-xl bg-primary/5 border border-primary/20 relative z-10">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold uppercase tracking-wider text-text-secondary ml-1">Frequency</Label>
                <Select
                  onValueChange={(v) =>
                    handleChange(
                      "recurrence_type",
                      v as CreateBillPayload["recurrence_type"] as string
                    )
                  }
                  value={form.recurrence_type ?? ""}
                >
                  <SelectTrigger className="bg-muted border border-border h-10 rounded-xl focus-visible:ring-1 focus-visible:ring-ring transition-all font-medium text-sm text-text-primary">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent className="bg-card border border-border rounded-xl">
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="quarterly">Quarterly</SelectItem>
                    <SelectItem value="yearly">Yearly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="bill-interval" className="text-xs font-semibold uppercase tracking-wider text-text-secondary ml-1">Interval</Label>
                <Input
                  id="bill-interval"
                  type="number"
                  min="1"
                  value={form.recurrence_interval}
                  onChange={(e) => handleChange("recurrence_interval", e.target.value)}
                  className="bg-muted border border-border h-10 rounded-xl focus-visible:ring-1 focus-visible:ring-ring transition-all font-medium text-sm text-text-primary"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="bill-end-date" className="text-xs font-semibold uppercase tracking-wider text-text-secondary ml-1">End Date (optional)</Label>
                <Input
                  id="bill-end-date"
                  type="date"
                  value={form.end_date}
                  onChange={(e) => handleChange("end_date", e.target.value)}
                  className="bg-muted border border-border h-10 rounded-xl focus-visible:ring-1 focus-visible:ring-ring transition-all font-medium text-sm text-text-primary"
                />
              </div>
            </div>
          )}

          {/* Notes */}
          <div className="space-y-1.5">
            <Label htmlFor="bill-notes" className="text-xs font-semibold uppercase tracking-wider text-text-secondary ml-1">Notes (optional)</Label>
            <Textarea
              id="bill-notes"
              placeholder="Additional information…"
              rows={2}
              value={form.notes}
              onChange={(e) => handleChange("notes", e.target.value)}
              className="resize-none bg-muted border border-border rounded-xl focus-visible:ring-1 focus-visible:ring-ring transition-all font-medium text-sm text-text-primary placeholder:text-text-secondary"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-4 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 rounded-full h-12 border-border text-text-primary hover:bg-muted font-semibold transition-all"
              disabled={loading}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="flex-1 rounded-full h-12 bg-primary text-primary-foreground hover:bg-primary/90 font-semibold shadow-lg shadow-primary/10 transition-all" 
              disabled={loading}
            >
              {loading ? "Adding…" : "Add Bill"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
