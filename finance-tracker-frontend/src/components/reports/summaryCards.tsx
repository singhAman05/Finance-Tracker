"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCurrency } from "@/hooks/useCurrency";
import type { KpiSummary } from "@/service/service_reports";
import { Activity, ArrowDownUp, PiggyBank, Wallet } from "lucide-react";

interface SummaryCardsProps {
  kpis: KpiSummary;
}

const pct = (val: number | null) => (val === null ? "N/A" : `${val > 0 ? "+" : ""}${val}%`);

export default function SummaryCards({ kpis }: SummaryCardsProps) {
  const { formatCurrency } = useCurrency();
  console.log(kpis);
  const cards = [
    {
      title: "Net Position",
      value: formatCurrency(kpis.totalBalance),
      sub: `MoM Net Trend: ${pct(kpis.netTrendPercent)}`,
      icon: Wallet,
    },
    {
      title: "Period Cash Flow",
      value: `${kpis.netCashFlow >= 0 ? "+" : "-"}${formatCurrency(Math.abs(kpis.netCashFlow))}`,
      sub: `${formatCurrency(kpis.totalIncome)} in / ${formatCurrency(kpis.totalExpenses)} out`,
      icon: ArrowDownUp,
    },
    {
      title: "Savings Rate",
      value: kpis.savingsRate === null ? "N/A" : `${kpis.savingsRate}%`,
      sub: `Burn Rate: ${formatCurrency(kpis.burnRateWeekly)}/week`,
      icon: PiggyBank,
    },
    {
      title: "Runway",
      value: kpis.runwayDays === null ? "N/A" : `${kpis.runwayDays} days`,
      sub: "Based on last 30-day spending",
      icon: Activity,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
      {cards.map((card) => (
        <Card key={card.title} className="border-border bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs uppercase tracking-wider text-text-secondary flex items-center justify-between">
              <span>{card.title}</span>
              <card.icon className="h-4 w-4 text-primary" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tracking-tight text-text-primary">{card.value}</div>
            <p className="text-xs text-text-secondary mt-1">{card.sub}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
