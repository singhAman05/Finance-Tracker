"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCurrency } from "@/hooks/useCurrency";
import type { BudgetInsight, CategoryInsight, ForecastPoint, MonthlyInsight } from "@/service/service_reports";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface OverviewTabProps {
  monthlyData: MonthlyInsight[];
  categoryData: CategoryInsight[];
  budgetData: BudgetInsight[];
  forecastData: ForecastPoint[];
}

export default function OverviewTab({ monthlyData, categoryData, budgetData, forecastData }: OverviewTabProps) {
  const { formatCurrency, formatAxis } = useCurrency();
  const topCategories = categoryData.slice(0, 5);
  const activeBudgets = budgetData.filter((b) => b.is_active).slice(0, 5);
  const nextRisk = forecastData.find((f) => f.projectedBalance < 0);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-base">Income vs Expense</CardTitle>
          </CardHeader>
          <CardContent className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tickFormatter={formatAxis} tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v: number) => formatCurrency(v)} />
                <Legend />
                <Bar dataKey="income" name="Income" fill="#16a34a" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expenses" name="Expenses" fill="#dc2626" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-base">Expense Distribution</CardTitle>
          </CardHeader>
          <CardContent className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={topCategories} dataKey="expenses" nameKey="name" innerRadius={55} outerRadius={100}>
                  {topCategories.map((row) => (
                    <Cell key={row.id} fill={row.color || "#94a3b8"} />
                  ))}
                </Pie>
                <Tooltip formatter={(v: number) => formatCurrency(v)} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-base">Budget Health Snapshot</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {activeBudgets.length === 0 && <p className="text-sm text-text-secondary">No active budgets found.</p>}
            {activeBudgets.map((b) => (
              <div key={b.budget_id} className="flex items-center justify-between text-sm border border-border rounded-lg p-3">
                <div>
                  <p className="font-semibold">{b.category_name}</p>
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
                  {b.percentage_used.toFixed(0)}%
                </span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-base">Forecast Watch</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {nextRisk ? (
              <>
                <p className="text-sm text-danger font-semibold">Projected negative balance risk detected.</p>
                <p className="text-sm text-text-secondary">
                  Estimated date: <span className="font-medium text-text-primary">{nextRisk.date}</span>
                </p>
                <p className="text-sm text-text-secondary">
                  Projected balance:{" "}
                  <span className="font-medium text-danger">{formatCurrency(nextRisk.projectedBalance)}</span>
                </p>
              </>
            ) : (
              <p className="text-sm text-success font-semibold">No negative-balance risk in selected forecast horizon.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
