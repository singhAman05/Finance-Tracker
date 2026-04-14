"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCurrency } from "@/hooks/useCurrency";
import type { MonthlyInsight } from "@/service/service_reports";
import { Area, AreaChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

interface TrendsTabProps {
  monthlyData: MonthlyInsight[];
}

export default function TrendsTab({ monthlyData }: TrendsTabProps) {
  const { formatCurrency, formatAxis } = useCurrency();
  const last12 = monthlyData.slice(-12);

  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <CardTitle className="text-base">12-Month Trend Analysis</CardTitle>
      </CardHeader>
      <CardContent className="h-[380px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={last12}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="month" tick={{ fontSize: 11 }} />
            <YAxis tickFormatter={formatAxis} tick={{ fontSize: 11 }} />
            <Tooltip formatter={(v: number) => formatCurrency(v)} />
            <Legend />
            <Area type="monotone" dataKey="income" stroke="#16a34a" fill="#16a34a22" />
            <Area type="monotone" dataKey="expenses" stroke="#dc2626" fill="#dc262622" />
            <Area type="monotone" dataKey="net" stroke="#2563eb" fill="#2563eb22" />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
