"use client";

import { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import { RootState } from "@/app/store";
import { setBudgets, setSummary, setLoading } from "@/components/redux/slices/slice_budgets";
import { fetchBudgets, fetchBudgetSummary, calculateBudgetSummaryStats } from "@/service/service_budgets";
import { openModal } from "@/components/redux/slices/slice_modal";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Target, PieChart, LayoutGrid } from "lucide-react";
import BudgetCard from "./BudgetCard";
import BudgetsHeader from "./BudgetsHeader";
import BudgetsSummaryCards from "./BudgetsSummaryCards";
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
  visible: { transition: { staggerChildren: 0.08 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] as const },
  },
};

export default function BudgetsPage() {
  const dispatch = useDispatch();
  const { summary, loading } = useSelector((state: RootState) => state.budgets);
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

  // Refresh data when the modal is closed
  const { type: modalType } = useSelector((state: RootState) => state.modal);
  const [prevModalType, setPrevModalType] = useState<string | null>(null);

  useEffect(() => {
    if (prevModalType === "ADD_BUDGET" && modalType === null) {
      loadData(true);
    }
    setPrevModalType(modalType);
  }, [modalType, prevModalType]);

  const categories = useSelector((state: RootState) => state.categories.categories);
  const stats = useMemo(() => calculateBudgetSummaryStats(summary), [summary]);

  const enrichedSummary = useMemo(() => {
    if (!Array.isArray(summary) || !Array.isArray(categories)) return summary;
    return summary.map((s) => {
      const category = categories.find((c) => c.id === s.category_id);
      return {
        ...s,
        category_name: category?.name || "Uncategorized",
        category_color: category?.color || "#94a3b8",
      };
    });
  }, [summary, categories]);

  const chartData = useMemo(() => {
    if (!Array.isArray(enrichedSummary)) return [];
    return enrichedSummary.map((s) => ({
      name: s.category_name,
      spent: s.spent_amount,
      budget: s.budget_amount,
      percentage: s.percentage_used,
    })).sort((a, b) => b.percentage - a.percentage);
  }, [enrichedSummary]);

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(val);

  if (loading && summary.length === 0) {
    return (
      <div className="min-h-screen bg-background relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(circle, var(--color-text-primary) 1px, transparent 1px)`,
            backgroundSize: "32px 32px",
          }}
        />
        <div className="p-6 space-y-8 w-full mx-auto relative z-10">
          <Skeleton className="h-20 w-full rounded-2xl bg-muted" />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Skeleton className="h-32 rounded-3xl bg-muted" />
            <Skeleton className="h-32 rounded-3xl bg-muted" />
            <Skeleton className="h-32 rounded-3xl bg-muted" />
            <Skeleton className="h-32 rounded-3xl bg-muted" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Skeleton className="h-64 rounded-3xl bg-muted col-span-1 md:col-span-2" />
            <Skeleton className="h-64 rounded-3xl bg-muted" />
          </div>
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
        className="flex flex-col gap-6 md:gap-8 relative z-10 mx-auto w-full"
      >
        <BudgetsHeader 
          onAddBudget={() => dispatch(openModal({ type: "ADD_BUDGET" }))}
          onRefresh={() => loadData(true)}
          isRefreshing={isRefreshing}
        />

        <BudgetsSummaryCards {...stats} />

        {/* Global Overview Chart */}
        <motion.div 
          variants={fadeUp}
          className="p-6 rounded-3xl bg-card border border-border shadow-sm group hover:border-primary/20 transition-all duration-300"
        >
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-primary/10 group-hover:scale-110 transition-transform">
                <PieChart className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-bold text-text-primary">Budget Utilization</h3>
                <p className="text-xs text-text-secondary font-medium">Monthly spending overview</p>
              </div>
            </div>
          </div>

          <div className="h-[240px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} layout="vertical" margin={{ left: 10, right: 30 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--border)" opacity={0.3} />
                <XAxis type="number" hide />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 11, fontWeight: 700, fill: "var(--text-secondary)" }}
                  width={80}
                />
                <Tooltip 
                  cursor={{ fill: 'var(--muted)', opacity: 0.4 }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-card border border-border p-3 rounded-2xl shadow-xl backdrop-blur-md">
                          <p className="font-bold text-sm mb-2">{data.name}</p>
                          <div className="space-y-1">
                              <div className="flex justify-between gap-4 text-xs font-medium">
                                <span className="text-text-secondary">Spent:</span>
                                <span className="text-text-primary">{formatCurrency(data.spent)}</span>
                              </div>
                              <div className="flex justify-between gap-4 text-xs font-medium border-t border-border pt-1">
                                <span className="text-text-secondary">Budget:</span>
                                <span className="text-text-primary">{formatCurrency(data.budget)}</span>
                              </div>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="spent" radius={[0, 6, 6, 0]} barSize={24}>
                  {chartData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.percentage >= 100 ? "var(--danger)" : entry.percentage >= 90 ? "var(--warning)" : "var(--success)"} 
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Budgets Grid */}
        <div className="space-y-8 mt-4">
          <div className="flex items-center gap-6">
             <h2 className="text-sm font-black uppercase tracking-[0.2em] text-text-primary whitespace-nowrap">Category Breakdown</h2>
             <div className="h-px bg-border flex-1 opacity-50" />
          </div>

          <AnimatePresence mode="popLayout">
            {(!Array.isArray(enrichedSummary) || enrichedSummary.length === 0) ? (
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
                {enrichedSummary.map((s) => (
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
