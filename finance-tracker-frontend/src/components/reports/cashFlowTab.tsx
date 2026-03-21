import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { LineChart, Sparkles } from "lucide-react";
import { MonthlyData, Transaction } from "@/types/interfaces";

import { getDailyCumulativeFlow, getCashFlowForecast } from "@/service/service_reports";
import { cn } from "@/lib/utils";
import { useCurrency } from "@/hooks/useCurrency";



// Custom tooltip for charts
const GlassTooltip = ({ active, payload, label, formatCurrency, symbol }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card/80 backdrop-blur-md border border-border p-4 rounded-2xl shadow-xl">
        <p className="font-bold text-sm mb-3 text-text-primary px-1">{label}</p>
        <div className="space-y-2">
          {payload.map((item: any, idx: number) => (
            <div key={idx} className="flex items-center justify-between gap-8 min-w-[140px] px-1">
              <div className="flex items-center gap-2">
                <div 
                  className="w-2 h-2 rounded-full" 
                  style={{ backgroundColor: item.fill || item.color || item.stroke }} 
                />
                <span className="text-[11px] font-bold text-text-secondary uppercase tracking-wider">
                  {item.name}:
                </span>
              </div>
              <span className={cn(
                "text-xs font-black",
                item.name === "Net Flow" || item.name === "Cumulative" 
                  ? (item.value >= 0 ? "text-success" : "text-danger")
                  : "text-text-primary"
              )}>
                {item.value >= 0 && (item.name === "Net Flow" || item.name === "Cumulative") ? "+" : ""}
                {formatCurrency(item.value)}
              </span>
            </div>
          ))}
          {/* Show Net for Bar Charts (Forecast) */}
          {payload.some((p: any) => p.name === "Projected Income") && payload.length >= 2 && (
            <div className="flex items-center justify-between gap-8 min-w-[140px] px-1 pt-2 border-t border-border mt-2">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-text-primary" />
                <span className="text-[11px] font-bold text-text-secondary uppercase tracking-wider">
                  Net:
                </span>
              </div>
              <span className={cn(
                "text-xs font-black",
                payload[0].value - payload[1].value >= 0 ? "text-success" : "text-danger"
              )}>
                {(payload[0].value - payload[1].value) >= 0 ? "+" : ""}
                {formatCurrency(payload[0].value - payload[1].value)}
              </span>
            </div>
          )}
        </div>
      </div>
    );
  }
  return null;
};

interface CashFlowTabProps {
  transactions: Transaction[];
  monthlyData: MonthlyData[];
}

export default function CashFlowTab({ transactions, monthlyData }: CashFlowTabProps) {
  const { formatCurrency, formatAxis, symbol } = useCurrency();
  // Get daily cumulative data for the current month
  const dailyFlowData = getDailyCumulativeFlow(transactions);
  
  // Get forecast data (combining historical + future)
  const forecastData = getCashFlowForecast(monthlyData);
  
  const currentMonthName = new Date().toLocaleString("default", { month: "long", year: "numeric" });

  return (
    <div className="space-y-6">
      <Card className="rounded-3xl border border-border bg-card shadow-sm group hover:border-primary/20 transition-all duration-300">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary/10 group-hover:scale-110 transition-transform">
              <LineChart className="h-5 w-5 text-primary" />
            </div>
            <div>
              <span className="block font-bold text-text-primary">Daily Cumulative Flow</span>
              <span className="block text-[10px] text-text-secondary font-medium uppercase tracking-widest mt-0.5">Running balance for {currentMonthName}</span>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dailyFlowData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorCumulative" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.5} />
                <XAxis 
                  dataKey="date" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 11, fontWeight: 700, fill: "var(--text-secondary)" }} 
                  minTickGap={20}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 11, fontWeight: 700, fill: "var(--text-secondary)" }}
                  tickFormatter={formatAxis}
                />
                <Tooltip content={<GlassTooltip formatCurrency={formatCurrency} symbol={symbol} />} cursor={{ stroke: 'var(--muted)', strokeWidth: 1, strokeDasharray: '3 3' }} />
                <Legend 
                  verticalAlign="top" 
                  align="right"
                  height={36} 
                  iconType="circle"
                  formatter={(value) => <span className="text-[11px] font-bold text-text-secondary uppercase tracking-widest ml-1">{value}</span>}
                />
                <Area 
                  type="monotone" 
                  dataKey="cumulative" 
                  stroke="var(--primary)" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorCumulative)" 
                  name="Cumulative" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-3xl border border-border bg-card shadow-sm group hover:border-primary/20 transition-all duration-300">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-indigo-500/10 group-hover:scale-110 transition-transform">
              <Sparkles className="h-5 w-5 text-indigo-500" />
            </div>
            <div>
              <span className="block font-bold text-text-primary">Cash Flow Forecast</span>
              <span className="block text-[10px] text-text-secondary font-medium uppercase tracking-widest mt-0.5">3-Month Projection</span>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={forecastData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <pattern id="pattern-income" width="4" height="4" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                    <rect width="2" height="4" transform="translate(0,0)" fill="var(--success)" opacity="0.3"></rect>
                  </pattern>
                  <pattern id="pattern-expense" width="4" height="4" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                    <rect width="2" height="4" transform="translate(0,0)" fill="var(--danger)" opacity="0.3"></rect>
                  </pattern>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.5} />
                <XAxis 
                  dataKey="month" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 11, fontWeight: 700, fill: "var(--text-secondary)" }} 
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 11, fontWeight: 700, fill: "var(--text-secondary)" }}
                  tickFormatter={formatAxis}
                />
                <Tooltip content={<GlassTooltip formatCurrency={formatCurrency} symbol={symbol} />} cursor={{ fill: 'var(--muted)', opacity: 0.4 }} />
                <Legend 
                  verticalAlign="top" 
                  align="right"
                  height={36} 
                  iconType="circle"
                  formatter={(value) => <span className="text-[11px] font-bold text-text-secondary uppercase tracking-widest ml-1">{value}</span>}
                />
                <Bar dataKey="income" fill="url(#pattern-income)" stroke="var(--success)" strokeWidth={1} name="Projected Income" radius={[4, 4, 0, 0]} barSize={32} />
                <Bar dataKey="expenses" fill="url(#pattern-expense)" stroke="var(--danger)" strokeWidth={1} name="Projected Expenses" radius={[4, 4, 0, 0]} barSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
