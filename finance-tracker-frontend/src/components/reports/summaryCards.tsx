import { useEffect, useState } from "react";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Wallet, ArrowDownLeft, ArrowUpRight, ArrowRightLeft, TrendingUp, TrendingDown, Target } from "lucide-react";
import { cn } from "@/lib/utils";

function AnimatedCounter({ target, duration = 1.5 }: { target: number; duration?: number }) {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (v) => Math.floor(v).toLocaleString("en-IN"));
  const [display, setDisplay] = useState("0");

  useEffect(() => {
    const controls = animate(count, target, { duration });
    const unsubscribe = rounded.on("change", (v) => setDisplay(v));
    return () => {
      controls.stop();
      unsubscribe();
    };
  }, [count, target, duration, rounded]);

  return <span>{display}</span>;
}

interface SummaryCardsProps {
  totalBalance: number;
  totalIncome: number;
  totalExpenses: number;
  netWorthChange: number;
}

export default function SummaryCards({
  totalBalance,
  totalIncome,
  totalExpenses,
  netWorthChange,
}: SummaryCardsProps) {
  const stats = [
    {
      label: "Total Balance",
      value: totalBalance,
      icon: Wallet,
      pattern: Target,
      color: "text-white",
      bgColor: "bg-primary shadow-xl shadow-primary/20",
      description: "Across all accounts",
      isHero: true
    },
    {
      label: "Total Income",
      value: totalIncome,
      icon: ArrowDownLeft,
      color: "text-emerald-500",
      bgColor: "bg-emerald-500/5 border-emerald-500/20",
      description: "This period"
    },
    {
      label: "Total Expenses",
      value: totalExpenses,
      icon: ArrowUpRight,
      color: "text-amber-500",
      bgColor: "bg-amber-500/5 border-amber-500/20",
      description: "This period"
    },
    {
      label: "Net Cash Flow",
      value: netWorthChange,
      icon: netWorthChange >= 0 ? TrendingUp : TrendingDown,
      color: netWorthChange >= 0 ? "text-success" : "text-danger",
      bgColor: netWorthChange >= 0 ? "bg-success/5 border-success/20" : "bg-danger/5 border-danger/20",
      description: netWorthChange >= 0 ? "Positive cash flow" : "Negative cash flow"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, idx) => (
        <Card 
          key={idx} 
          className={cn(
            "rounded-3xl border transition-all duration-300 overflow-hidden relative group",
            stat.bgColor,
            !stat.isHero && "hover:border-primary/20 shadow-sm"
          )}
        >
          {stat.isHero && stat.pattern && (
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform duration-500">
                <stat.pattern className="w-24 h-24" />
            </div>
          )}
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 relative z-10">
            <CardTitle className={cn(
              "text-[10px] font-black uppercase tracking-widest",
              stat.isHero ? "text-white/70" : "text-text-secondary",
              stat.label === "Total Income" && "text-emerald-500",
              stat.label === "Total Expenses" && "text-amber-500"
            )}>
              {stat.label}
            </CardTitle>
            <div className={cn(
              "p-2 rounded-xl", 
              stat.isHero ? "bg-white/10" : "bg-card border border-border"
            )}>
              <stat.icon className={cn("h-4 w-4", stat.isHero ? "text-white" : stat.color)} />
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className={cn(
              "text-2xl sm:text-3xl font-black tracking-tighter",
              stat.isHero ? "text-white" : "text-text-primary"
            )}>
              {stat.label === "Net Cash Flow" && (stat.value >= 0 ? "+" : "-")}
              ₹<AnimatedCounter target={Math.abs(stat.value)} />
            </div>
            <p className={cn(
              "text-xs mt-2 font-medium",
              stat.isHero ? "text-white/60" : "text-text-secondary"
            )}>
              {stat.description}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
