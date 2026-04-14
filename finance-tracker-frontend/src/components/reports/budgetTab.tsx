"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useCurrency } from "@/hooks/useCurrency";
import type { BudgetInsight } from "@/service/service_reports";

interface BudgetTabProps {
  budgetData: BudgetInsight[];
}

export default function BudgetTab({ budgetData }: BudgetTabProps) {
  const { formatCurrency } = useCurrency();
  const active = budgetData.filter((b) => b.is_active);

  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <CardTitle className="text-base">Budget Health</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {active.length === 0 && <p className="text-sm text-text-secondary">No active budgets available.</p>}

        {active.map((b) => (
          <div key={b.budget_id} className="border border-border rounded-xl p-3">
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="font-semibold text-sm text-text-primary">{b.category_name}</p>
                <p className="text-xs text-text-secondary">
                  {formatCurrency(b.total_spent)} / {formatCurrency(b.budget_amount)}
                </p>
              </div>
              <span
                className={`text-xs font-semibold px-2 py-1 rounded-full ${
                  b.health === "exceeded"
                    ? "bg-danger/10 text-danger"
                    : b.health === "warning"
                    ? "bg-warning/10 text-warning"
                    : "bg-success/10 text-success"
                }`}
              >
                {b.percentage_used.toFixed(1)}%
              </span>
            </div>
            <Progress value={Math.min(100, b.percentage_used)} className="h-2" />
            <p className="text-xs text-text-secondary mt-2">
              Remaining: {formatCurrency(b.remaining)}
            </p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

