"use client";

import { useEffect, useState } from "react";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Target, TrendingUp, AlertCircle, LayoutGrid } from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] as const },
  },
};

function AnimatedCounter({
  target,
  prefix = "",
}: {
  target: number;
  prefix?: string;
}) {
  const count = useMotionValue(0);
  const rounded = useTransform(
    count,
    (v) =>
      `${prefix}${Math.floor(v).toLocaleString("en-IN", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      })}`
  );
  const [display, setDisplay] = useState("0");

  useEffect(() => {
    const controls = animate(count, target, { duration: 1.5 });
    const unsubscribe = rounded.on("change", (v) => setDisplay(v));
    return () => {
      controls.stop();
      unsubscribe();
    };
  }, [count, target, rounded]);

  return <span>{display}</span>;
}

interface BudgetsSummaryCardsProps {
  totalBudget: number;
  totalSpent: number;
  overallPercentage: number;
  healthyCount: number;
  warningCount: number;
  exceededCount: number;
}

export default function BudgetsSummaryCards({
  totalBudget,
  totalSpent,
  overallPercentage,
  healthyCount,
  warningCount,
  exceededCount,
}: BudgetsSummaryCardsProps) {
  return (
    <motion.div
      variants={fadeUp}
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
    >
      {/* Overall Utilization */}
      <Card className="bg-primary text-primary-foreground shadow-xl shadow-primary/20 border-none rounded-3xl overflow-hidden relative group transition-all duration-500 hover:scale-[1.02]">
        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform duration-500">
            <Target className="w-24 h-24" />
        </div>
        <CardContent className="p-8">
            <p className="text-[10px] font-black uppercase tracking-widest opacity-70 mb-2">Overall Utilization</p>
            <div className="flex items-baseline gap-2 mb-4">
                <h2 className="text-4xl font-black tracking-tighter">
                    <AnimatedCounter target={overallPercentage} />%
                </h2>
                <span className="text-xs font-bold opacity-60 uppercase">used</span>
            </div>
            <div className="w-full h-3 bg-white/20 rounded-full overflow-hidden mb-4">
                <motion.div 
                   initial={{ width: 0 }}
                   animate={{ width: `${Math.min(overallPercentage, 100)}%` }}
                   transition={{ duration: 1.2, ease: "easeOut" }}
                   className="h-full bg-white shadow-[0_0_15px_rgba(255,255,255,0.6)]"
                />
            </div>
            <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-wider opacity-80">
                 <span>Spent: ₹{totalSpent.toLocaleString()}</span>
                 <span>Limit: ₹{totalBudget.toLocaleString()}</span>
            </div>
        </CardContent>
      </Card>

      {/* Summary Status - Healthy */}
      <Card className="bg-emerald-500/5 border-emerald-500/20 shadow-sm hover:shadow-md transition-all duration-300 rounded-3xl">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-[10px] font-black uppercase tracking-widest text-emerald-500">
            Healthy
          </CardTitle>
          <div className="p-2 bg-emerald-500/10 rounded-full">
            <LayoutGrid className="h-4 w-4 text-emerald-500" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-black tracking-tighter text-text-primary">
            <AnimatedCounter target={healthyCount} />
          </div>
          <p className="text-xs text-text-secondary mt-2 font-medium">
             Budgets on track
          </p>
        </CardContent>
      </Card>

      {/* Summary Status - Warning */}
      <Card className="bg-amber-500/5 border-amber-500/20 shadow-sm hover:shadow-md transition-all duration-300 rounded-3xl">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-[10px] font-black uppercase tracking-widest text-amber-500">
            Warning
          </CardTitle>
          <div className="p-2 bg-amber-500/10 rounded-full">
            <AlertCircle className="h-4 w-4 text-amber-500" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-black tracking-tighter text-text-primary">
            <AnimatedCounter target={warningCount} />
          </div>
          <p className="text-xs text-text-secondary mt-2 font-medium">
             Approaching limit
          </p>
        </CardContent>
      </Card>

      {/* Summary Status - Exceeded */}
      <Card className="bg-destructive/5 border-destructive/20 shadow-sm hover:shadow-md transition-all duration-300 rounded-3xl">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-[10px] font-black uppercase tracking-widest text-destructive">
            Exceeded
          </CardTitle>
          <div className="p-2 bg-destructive/10 rounded-full">
            <AlertCircle className="h-4 w-4 text-destructive" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-black tracking-tighter text-text-primary">
            <AnimatedCounter target={exceededCount} />
          </div>
          <p className="text-xs text-text-secondary mt-2 font-medium">
             Above set limit
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
}
