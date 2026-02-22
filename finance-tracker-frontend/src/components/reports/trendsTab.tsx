import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { MonthlyData } from "@/types/interfaces";

import { TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

const formatCurrency = (val: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(val);

// Custom tooltip for charts
const GlassTooltip = ({ active, payload, label }: any) => {
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
                  style={{ backgroundColor: item.fill || item.color }} 
                />
                <span className="text-[11px] font-bold text-text-secondary uppercase tracking-wider">
                  {item.name}:
                </span>
              </div>
              <span className="text-xs font-black text-text-primary">
                {formatCurrency(item.value)}
              </span>
            </div>
          ))}
          {payload.length >= 2 && (
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

interface TrendsTabProps {
  monthlyData: MonthlyData[];
}

export default function TrendsTab({ monthlyData }: TrendsTabProps) {
  return (
    <Card className="rounded-3xl border border-border bg-card shadow-sm group hover:border-primary/20 transition-all duration-300">
      <CardHeader>
        <CardTitle className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-primary/10 group-hover:scale-110 transition-transform">
            <TrendingUp className="h-5 w-5 text-primary" />
          </div>
          <div>
            <span className="block font-bold text-text-primary">Monthly Trends</span>
            <span className="block text-[10px] text-text-secondary font-medium uppercase tracking-widest mt-0.5">Yearly growth analysis</span>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-96 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
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
                tickFormatter={(val) => `₹${val / 1000}k`}
              />
              <Tooltip content={<GlassTooltip />} cursor={{ fill: 'var(--muted)', opacity: 0.4 }} />
              <Legend 
                verticalAlign="top" 
                align="right"
                height={36} 
                iconType="circle"
                formatter={(value) => <span className="text-[11px] font-bold text-text-secondary uppercase tracking-widest ml-1">{value}</span>}
              />
              <Bar dataKey="income" fill="var(--success)" name="Income" radius={[4, 4, 0, 0]} barSize={32} />
              <Bar dataKey="expenses" fill="var(--danger)" name="Expenses" radius={[4, 4, 0, 0]} barSize={32} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
