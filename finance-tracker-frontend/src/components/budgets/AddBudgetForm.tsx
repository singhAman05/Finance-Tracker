"use client";

import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/app/store";
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCurrency } from "@/hooks/useCurrency";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { X, Target } from "lucide-react";
import { createBudget, CreateBudgetPayload } from "@/service/service_budgets";

interface AddBudgetFormProps {
  onClose: () => void;
}

export default function AddBudgetForm({ onClose }: AddBudgetFormProps) {
  const dispatch = useDispatch();
  const categories = useSelector((state: RootState) => state.categories.categories);
  const { symbol } = useCurrency();
  
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    amount: "",
    category_id: "",
    period_type: "monthly" as CreateBudgetPayload["period_type"],
    start_date: new Date().toISOString().split("T")[0],
    end_date: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString().split("T")[0],
    notes: "",
  });

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.category_id || !form.amount || !form.start_date || !form.end_date) return;

    try {
      setLoading(true);
      const payload: CreateBudgetPayload = {
        category_id: form.category_id,
        name: form.name.trim() || undefined,
        amount: parseFloat(form.amount),
        period_type: form.period_type,
        start_date: form.start_date,
        end_date: form.end_date,
        notes: form.notes.trim() || undefined,
      };

      const result = await createBudget(payload);
      if (result) {
        onClose();
      }
    } catch (error) {
      // Error surfaced via notifications
    } finally {
      setLoading(false);
    }
  };

  const expenseCategories = categories.filter((c: any) => c.type === "expense" || !c.type);

  return (
    <Card className="w-full max-w-2xl shadow-2xl border border-border bg-card overflow-hidden rounded-xl relative">
      <div
        className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle, var(--color-text-primary) 1px, transparent 1px)`,
          backgroundSize: "24px 24px",
        }}
      />
      
      <div className="bg-muted/30 border-b border-border p-5 sm:p-8 relative z-10">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/10 shrink-0">
              <Target className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <CardTitle className="text-xl sm:text-2xl font-bold tracking-tight text-text-primary">Create Budget</CardTitle>
              <CardDescription className="text-xs sm:text-sm text-text-secondary mt-1">Define your spending limits</CardDescription>
            </div>
          </div>
          <button
            onClick={onClose}
            type="button"
            aria-label="Close"
            className="h-10 w-10 rounded-full hover:bg-muted text-text-secondary transition-colors flex items-center justify-center cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      <CardContent className="p-5 sm:p-8 relative z-10">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="budget-name" className="text-xs font-semibold uppercase tracking-wider text-text-secondary ml-1">Budget Name (Optional)</Label>
              <Input
                id="budget-name"
                placeholder="e.g. Monthly Grocery"
                value={form.name}
                onChange={(e) => handleChange("name", e.target.value)}
                className="bg-muted border border-border h-12 rounded-xl focus-visible:ring-1 focus-visible:ring-ring transition-all font-medium text-sm text-text-primary"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="budget-amount" className="text-xs font-semibold uppercase tracking-wider text-text-secondary ml-1">Limit Amount ({symbol}) *</Label>
              <Input
                id="budget-amount"
                type="number"
                min="0"
                max="9999999999"
                step="0.01"
                placeholder="0.00"
                value={form.amount}
                onChange={(e) => handleChange("amount", e.target.value)}
                required
                className="bg-muted border border-border h-12 rounded-xl focus-visible:ring-1 focus-visible:ring-ring transition-all font-medium text-sm text-text-primary"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold uppercase tracking-wider text-text-secondary ml-1">Category *</Label>
              <Select
                onValueChange={(v) => handleChange("category_id", v)}
                value={form.category_id}
              >
                <SelectTrigger className="bg-muted border border-border h-12 rounded-xl transition-all font-medium text-sm text-text-primary">
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
              <Label className="text-xs font-semibold uppercase tracking-wider text-text-secondary ml-1">Period Type *</Label>
              <Select
                onValueChange={(v) => handleChange("period_type", v)}
                value={form.period_type}
              >
                <SelectTrigger className="bg-muted border border-border h-12 rounded-xl transition-all font-medium text-sm text-text-primary">
                  <SelectValue placeholder="Select period" />
                </SelectTrigger>
                <SelectContent className="bg-card border border-border rounded-xl">
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="quarterly">Quarterly</SelectItem>
                  <SelectItem value="yearly">Yearly</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="start-date" className="text-xs font-semibold uppercase tracking-wider text-text-secondary ml-1">Start Date *</Label>
              <Input
                id="start-date"
                type="date"
                value={form.start_date}
                onChange={(e) => handleChange("start_date", e.target.value)}
                required
                className="bg-muted border border-border h-12 rounded-xl transition-all font-medium text-sm text-text-primary"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="end-date" className="text-xs font-semibold uppercase tracking-wider text-text-secondary ml-1">End Date *</Label>
              <Input
                id="end-date"
                type="date"
                value={form.end_date}
                onChange={(e) => handleChange("end_date", e.target.value)}
                required
                className="bg-muted border border-border h-12 rounded-xl transition-all font-medium text-sm text-text-primary"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="budget-notes" className="text-xs font-semibold uppercase tracking-wider text-text-secondary ml-1">Notes (Optional)</Label>
            <Textarea
              id="budget-notes"
              placeholder="Budget context..."
              rows={2}
              value={form.notes}
              onChange={(e) => handleChange("notes", e.target.value)}
              className="resize-none bg-muted border border-border rounded-xl transition-all font-medium text-sm text-text-primary placeholder:text-text-secondary"
            />
          </div>

          <div className="flex gap-4 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 rounded-full h-12 border-border text-text-primary hover:bg-muted font-semibold transition-all cursor-pointer"
              disabled={loading}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="flex-1 rounded-full h-12 bg-primary text-primary-foreground hover:bg-primary/90 font-semibold shadow-lg shadow-primary/10 transition-all font-medium cursor-pointer" 
              disabled={loading}
            >
              {loading ? "Creating..." : "Create Budget"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

