import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { TrendingUp, PieChart as PieChartIcon, LayoutGrid } from "lucide-react";
import { CategoryAnalysis, MonthlyData } from "@/types/interfaces";
import { convertToChartData } from "@/service/service_reports";
import { cn } from "@/lib/utils";

interface OverviewTabProps {
  monthlyData: MonthlyData[];
  categoryData: CategoryAnalysis[];
  totalExpenses: number;
}

const COLORS = [
  "var(--primary)",
  "var(--success)",
  "var(--warning)",
  "var(--danger)",
  "#8884D8",
  "#82ca9d",
];

const formatCurrency = (val: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(val);

// Custom tooltip for charts
const GlassTooltip = ({ active, payload, label, type = "bar" }: any) => {
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
          {type === "bar" && payload.length >= 2 && (
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

export default function OverviewTab({
  monthlyData,
  categoryData,
  totalExpenses,
}: OverviewTabProps) {
  const chartData = convertToChartData(categoryData);
  const topSpendingCategories = categoryData
    .filter((c) => c.expenses > 0)
    .toSorted((a, b) => b.expenses - a.expenses)
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="rounded-3xl border border-border bg-card shadow-sm group hover:border-primary/20 transition-all duration-300">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-primary/10 group-hover:scale-110 transition-transform">
                <TrendingUp className="h-5 w-5 text-primary" />
              </div>
              <div>
                <span className="block font-bold text-text-primary">Income vs Expenses</span>
                <span className="block text-[10px] text-text-secondary font-medium uppercase tracking-widest mt-0.5">Monthly cash flow</span>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80 w-full pt-4">
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
                  <Bar dataKey="income" fill="var(--success)" name="Income" radius={[4, 4, 0, 0]} barSize={20} />
                  <Bar dataKey="expenses" fill="var(--danger)" name="Expenses" radius={[4, 4, 0, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border border-border bg-card shadow-sm group hover:border-primary/20 transition-all duration-300">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-primary/10 group-hover:scale-110 transition-transform">
                <PieChartIcon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <span className="block font-bold text-text-primary">Expenses by Category</span>
                <span className="block text-[10px] text-text-secondary font-medium uppercase tracking-widest mt-0.5">Total distribution</span>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="45%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                    nameKey="name"
                  >
                    {chartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.color || COLORS[index % COLORS.length]}
                        stroke="transparent"
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<GlassTooltip type="pie" />} />
                  <Legend 
                    verticalAlign="bottom" 
                    height={36} 
                    iconType="circle"
                    formatter={(value) => <span className="text-[11px] font-bold text-text-secondary uppercase tracking-widest ml-1">{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-3xl border border-border bg-card shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary/10">
              <LayoutGrid className="h-5 w-5 text-primary" />
            </div>
            <div>
              <span className="block font-bold text-text-primary">Top Spending Categories</span>
              <span className="block text-[10px] text-text-secondary font-medium uppercase tracking-widest mt-0.5">Highest expenditure</span>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="px-0">
          <Table>
            <TableHeader>
            <TableRow className="hover:bg-transparent border-b border-border bg-transparent">
                <TableHead className="pl-6 sm:pl-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-text-secondary">Category</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-[0.2em] text-text-secondary text-right">Amount</TableHead>
                <TableHead className="hidden sm:table-cell text-[10px] font-black uppercase tracking-[0.2em] text-text-secondary text-center">Percentage</TableHead>
                <TableHead className="pr-6 sm:pr-8 text-[10px] font-black uppercase tracking-[0.2em] text-text-secondary text-right">Transactions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {topSpendingCategories.map((category) => (
                <TableRow key={category.id} className="group hover:bg-muted transition-colors border-b border-border last:border-0">
                  <TableCell className="pl-6 sm:pl-8 py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: category.color || "var(--primary)" }} />
                      <span className="font-bold text-sm tracking-tight text-text-primary truncate max-w-[80px] sm:max-w-none">{category.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <span className="font-mono font-bold text-danger text-xs sm:text-sm">
                      {formatCurrency(category.expenses)}
                    </span>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell text-center">
                    <div className="flex items-center justify-center gap-3">
                      <div className="w-24 h-1.5 bg-muted rounded-full overflow-hidden flex-shrink-0">
                        <div 
                          className="h-full bg-primary" 
                          style={{ width: `${Math.min((category.expenses / totalExpenses) * 100, 100)}%` }} 
                        />
                      </div>
                      <span className="text-xs font-bold text-text-secondary min-w-[32px]">
                        {((category.expenses / totalExpenses) * 100).toFixed(0)}%
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right pr-6 sm:pr-8">
                    <span className="text-xs font-bold text-text-secondary">
                      {category.count} <span className="font-normal opacity-60 ml-0.5 text-[10px] uppercase tracking-wider">txns</span>
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
