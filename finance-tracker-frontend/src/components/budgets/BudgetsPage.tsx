"use client";

import { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import { RootState } from "@/app/store";
import { setBudgets, setSummary, setLoading } from "@/components/redux/slices/slice_budgets";
import { fetchBudgets, fetchBudgetSummary } from "@/service/service_budgets";
import { openModal } from "@/components/redux/slices/slice_modal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { Plus, RefreshCw, LayoutGrid, Target, PieChart, Info } from "lucide-react";
import BudgetCard from "./BudgetCard";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export default function BudgetsPage() {
  const dispatch = useDispatch();
  const { budgets, summary, loading } = useSelector((state: RootState) => state.budgets);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadData = async (refresh = false) => {
    try {
      if (refresh) setIsRefreshing(true);
      else dispatch(setLoading(true));

      const [budgetsRes, summaryRes] = await Promise.all([
        fetchBudgets(),
        fetchBudgetSummary(),
      ]);

      if (budgetsRes?.data) dispatch(setBudgets(budgetsRes.data));
      if (summaryRes?.data) dispatch(setSummary(summaryRes.data));
    } catch (err) {
      console.error("Failed to fetch budget data:", err);
    } finally {
      dispatch(setLoading(false));
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [dispatch]);

  // Refresh data when the modal is closed (e.g., after adding a new budget)
  const { type: modalType } = useSelector((state: RootState) => state.modal);
  const [prevModalType, setPrevModalType] = useState<string | null>(null);

  useEffect(() => {
    if (prevModalType === "ADD_BUDGET" && modalType === null) {
      loadData(true);
    }
    setPrevModalType(modalType);
  }, [modalType, prevModalType]);

  const totalBudget = Array.isArray(summary) ? summary.reduce((acc, curr) => acc + curr.budget_amount, 0) : 0;
  const totalSpent = Array.isArray(summary) ? summary.reduce((acc, curr) => acc + curr.spent_amount, 0) : 0;
  const overallPercentage = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

  const chartData = useMemo(() => {
    if (!Array.isArray(summary)) return [];
    return summary.map((s) => ({
      name: s.category_name,
      spent: s.spent_amount,
      budget: s.budget_amount,
      percentage: s.percentage_used,
    })).sort((a, b) => b.percentage - a.percentage);
  }, [summary]);

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(val);

  if (loading && budgets.length === 0) {
    return (
      <div className="p-6 space-y-8 max-w-7xl mx-auto">
        <div className="flex justify-between items-end">
          <Skeleton className="h-12 w-48 rounded-xl bg-muted" />
          <Skeleton className="h-10 w-32 rounded-full bg-muted" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="h-48 rounded-3xl bg-muted col-span-1 md:col-span-2" />
          <Skeleton className="h-48 rounded-3xl bg-muted" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-64 rounded-3xl bg-muted" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-text-primary px-4 md:px-6 py-6 md:py-8 relative overflow-hidden">
      {/* Background Pattern */}
      <div
        className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle, var(--color-text-primary) 1px, transparent 1px)`,
          backgroundSize: "32px 32px",
        }}
      />

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="relative w-full space-y-8 p-4 md:p-8 mx-auto max-w-7xl"
      >
        {/* Header */}
        <motion.div variants={fadeUp} className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-text-primary">Budgets</h1>
            <p className="text-text-secondary mt-2 flex items-center gap-2">
              <Info className="w-4 h-4 text-primary" />
              Manage your spending limits and financial goals.
            </p>
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto">
            <Button
              variant="outline"
              size="icon"
              onClick={() => loadData(true)}
              className={cn(
                "rounded-full border border-border bg-card text-text-primary hover:bg-muted h-12 w-12",
                isRefreshing && "animate-spin"
              )}
              disabled={isRefreshing}
            >
              <RefreshCw className="h-5 w-5" />
            </Button>
            <Button
              onClick={() => dispatch(openModal({ type: "ADD_BUDGET" }))}
              className="flex-1 md:flex-none group bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-8 h-12 shadow-lg shadow-primary/20 transition-all active:scale-95 font-bold"
            >
              <Plus className="mr-2 h-5 w-5 transition-transform group-hover:rotate-90" />
              Create Budget
            </Button>
          </div>
        </motion.div>

        {/* Global Summary & Overview Chart */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Chart */}
          <motion.div 
            variants={fadeUp}
            className="lg:col-span-2 p-6 rounded-3xl bg-card border border-border/50 shadow-sm relative overflow-hidden"
          >
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-primary/10">
                  <PieChart className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-text-primary">Budget Utilization</h3>
                  <p className="text-xs text-text-secondary">Summary across all categories</p>
                </div>
              </div>
            </div>

            <div className="h-[240px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} layout="vertical" margin={{ left: 20, right: 30 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--border)" opacity={0.3} />
                  <XAxis type="number" hide />
                  <YAxis 
                    dataKey="name" 
                    type="category" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 11, fontWeight: 600, fill: "var(--text-secondary)" }}
                    width={80}
                  />
                  <Tooltip 
                    cursor={{ fill: 'var(--muted)', opacity: 0.4 }}
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-card border border-border p-3 rounded-xl shadow-xl backdrop-blur-md">
                            <p className="font-bold text-sm mb-1">{data.name}</p>
                            <div className="flex justify-between gap-4 text-xs">
                              <span className="text-text-secondary">Spent:</span>
                              <span className="font-bold">{formatCurrency(data.spent)}</span>
                            </div>
                            <div className="flex justify-between gap-4 text-xs mt-1">
                              <span className="text-text-secondary">Limit:</span>
                              <span className="font-bold">{formatCurrency(data.budget)}</span>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="spent" radius={[0, 4, 4, 0]} barSize={20}>
                    {chartData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.percentage >= 100 ? "var(--destructive)" : entry.percentage >= 80 ? "#f59e0b" : "var(--primary)"} 
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Quick Stats */}
          <motion.div 
            variants={fadeUp}
            className="flex flex-col gap-6"
          >
            <div className="p-6 rounded-3xl bg-primary text-primary-foreground shadow-lg shadow-primary/20 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                <Target className="w-24 h-24" />
              </div>
              <p className="text-xs font-bold uppercase tracking-widest opacity-80 mb-2">Overall Progress</p>
              <h2 className="text-4xl font-black tracking-tighter mb-4">{overallPercentage.toFixed(1)}%</h2>
              <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden">
                <motion.div 
                   initial={{ width: 0 }}
                   animate={{ width: `${Math.min(overallPercentage, 100)}%` }}
                   className="h-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.5)]"
                />
              </div>
              <p className="text-xs mt-4 font-medium opacity-90">
                Spent {formatCurrency(totalSpent)} of {formatCurrency(totalBudget)}
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-card border border-border shadow-sm flex-1 flex flex-col justify-center">
                <div className="flex items-center gap-3 mb-2">
                    <LayoutGrid className="w-4 h-4 text-text-secondary" />
                    <span className="text-xs font-bold uppercase tracking-widest text-text-secondary">Active Budgets</span>
                </div>
                <h3 className="text-3xl font-bold text-text-primary">{Array.isArray(summary) ? summary.length : 0}</h3>
                <div className="mt-4 flex flex-wrap gap-2 text-[10px] font-bold">
                    <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-500 border-0">
                        {Array.isArray(summary) ? summary.filter(s => s.percentage_used < 80).length : 0} Healthy
                    </Badge>
                    <Badge variant="secondary" className="bg-amber-500/10 text-amber-500 border-0">
                        {Array.isArray(summary) ? summary.filter(s => s.percentage_used >= 80 && s.percentage_used < 100).length : 0} Warning
                    </Badge>
                    <Badge variant="secondary" className="bg-destructive/10 text-destructive border-0">
                        {Array.isArray(summary) ? summary.filter(s => s.percentage_used >= 100).length : 0} Exceeded
                    </Badge>
                </div>
            </div>
          </motion.div>
        </div>

        {/* Budgets Grid */}
        <div className="space-y-6">
          <div className="flex items-center gap-3">
             <div className="h-px bg-border flex-1" />
             <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-text-secondary px-4 whitespace-nowrap">Category Breakdown</h2>
             <div className="h-px bg-border flex-1" />
          </div>

          <AnimatePresence mode="popLayout">
            {(!Array.isArray(summary) || summary.length === 0) ? (
               <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-20 text-center"
               >
                 <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-4">
                    <Target className="w-10 h-10 text-text-secondary/50" />
                 </div>
                 <h3 className="text-xl font-bold text-text-primary">No budgets set yet</h3>
                 <p className="text-text-secondary max-w-xs mt-2">Take control of your finances by setting a spending limit for your categories.</p>
                 <Button 
                    onClick={() => dispatch(openModal({ type: "ADD_BUDGET" }))}
                    className="mt-6 rounded-full px-8"
                 >
                    Get Started
                 </Button>
               </motion.div>
            ) : (
              <motion.div 
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                layout
              >
                {summary.map((s) => (
                  <BudgetCard key={s.budget_id} summary={s} />
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
