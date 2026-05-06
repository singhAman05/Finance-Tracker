"use client";

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useCurrency } from "@/hooks/useCurrency";
import type { MonthlyInsight } from "@/service/service_reports";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface TrendsTabProps {
  monthlyData: MonthlyInsight[];
}

export default function TrendsTab({ monthlyData }: TrendsTabProps) {
  const { formatCurrency, formatAxis } = useCurrency();

  // Compute month-over-month growth rates & savings rate
  const trendData = useMemo(() => {
    return monthlyData.map((m, i) => {
      const prev = i > 0 ? monthlyData[i - 1] : null;
      const incomeGrowth = prev && prev.income > 0
        ? ((m.income - prev.income) / prev.income) * 100
        : 0;
      const expenseGrowth = prev && prev.expenses > 0
        ? ((m.expenses - prev.expenses) / prev.expenses) * 100
        : 0;
      const savingsRate = m.income > 0
        ? ((m.income - m.expenses) / m.income) * 100
        : 0;

      return {
        month: m.month,
        incomeGrowth: Number(incomeGrowth.toFixed(1)),
        expenseGrowth: Number(expenseGrowth.toFixed(1)),
        savingsRate: Number(savingsRate.toFixed(1)),
        income: m.income,
        expenses: m.expenses,
        net: m.net,
      };
    });
  }, [monthlyData]);

  // Summary stats
  const summary = useMemo(() => {
    if (trendData.length < 2) return null;
    const recent = trendData[trendData.length - 1];
    const prev = trendData[trendData.length - 2];
    const avgSavings = trendData.reduce((s, d) => s + d.savingsRate, 0) / trendData.length;
    const avgExpenseGrowth = trendData.slice(1).reduce((s, d) => s + d.expenseGrowth, 0) / (trendData.length - 1);
    return {
      currentSavingsRate: recent.savingsRate,
      prevSavingsRate: prev.savingsRate,
      avgSavingsRate: Number(avgSavings.toFixed(1)),
      avgExpenseGrowth: Number(avgExpenseGrowth.toFixed(1)),
      latestExpenseGrowth: recent.expenseGrowth,
    };
  }, [trendData]);

  return (
    <div className="space-y-4">
      {/* Summary Stat Cards */}
      {summary && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="border-border bg-card">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-text-secondary uppercase tracking-wide">Savings Rate</p>
                  <p className={`text-2xl font-bold mt-1 ${summary.currentSavingsRate >= 0 ? "text-success" : "text-danger"}`}>
                    {summary.currentSavingsRate}%
                  </p>
                  <p className="text-xs text-text-secondary mt-1">Avg: {summary.avgSavingsRate}%</p>
                </div>
                {summary.currentSavingsRate > summary.prevSavingsRate ? (
                  <TrendingUp className="h-5 w-5 text-success" />
                ) : summary.currentSavingsRate < summary.prevSavingsRate ? (
                  <TrendingDown className="h-5 w-5 text-danger" />
                ) : (
                  <Minus className="h-5 w-5 text-text-secondary" />
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="border-border bg-card">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-text-secondary uppercase tracking-wide">Expense Growth</p>
                  <p className={`text-2xl font-bold mt-1 ${summary.latestExpenseGrowth <= 0 ? "text-success" : "text-danger"}`}>
                    {summary.latestExpenseGrowth > 0 ? "+" : ""}{summary.latestExpenseGrowth}%
                  </p>
                  <p className="text-xs text-text-secondary mt-1">Avg: {summary.avgExpenseGrowth > 0 ? "+" : ""}{summary.avgExpenseGrowth}%</p>
                </div>
                {summary.latestExpenseGrowth <= 0 ? (
                  <TrendingDown className="h-5 w-5 text-success" />
                ) : (
                  <TrendingUp className="h-5 w-5 text-danger" />
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="border-border bg-card">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-text-secondary uppercase tracking-wide">Months Tracked</p>
                  <p className="text-2xl font-bold mt-1 text-text-primary">{trendData.length}</p>
                  <p className="text-xs text-text-secondary mt-1">
                    {trendData.filter(d => d.savingsRate > 0).length} positive months
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Savings Rate Trend Line */}
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="text-base">Savings Rate Over Time</CardTitle>
          <CardDescription>Percentage of income saved each month</CardDescription>
        </CardHeader>
        <CardContent className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tickFormatter={(v) => `${v}%`} tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v: number) => `${v}%`} />
              <Line
                type="monotone"
                dataKey="savingsRate"
                stroke="#6366f1"
                strokeWidth={2}
                dot={{ r: 3 }}
                name="Savings Rate"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Month-over-Month Growth Bars */}
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="text-base">Month-over-Month Changes</CardTitle>
          <CardDescription>Income and expense growth rates compared to previous month</CardDescription>
        </CardHeader>
        <CardContent className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={trendData.slice(1)}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tickFormatter={(v) => `${v}%`} tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v: number) => `${v}%`} />
              <Legend />
              <Bar dataKey="incomeGrowth" name="Income Growth" radius={[4, 4, 0, 0]}>
                {trendData.slice(1).map((entry, idx) => (
                  <Cell key={idx} fill={entry.incomeGrowth >= 0 ? "#10b981" : "#f43f5e"} />
                ))}
              </Bar>
              <Bar dataKey="expenseGrowth" name="Expense Growth" radius={[4, 4, 0, 0]}>
                {trendData.slice(1).map((entry, idx) => (
                  <Cell key={idx} fill={entry.expenseGrowth <= 0 ? "#10b981" : "#f97316"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
