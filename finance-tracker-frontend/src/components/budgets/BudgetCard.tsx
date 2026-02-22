"use client";

import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { Target, TrendingUp, AlertTriangle, CheckCircle2 } from "lucide-react";
import { BudgetSummary } from "@/components/redux/slices/slice_budgets";

interface BudgetCardProps {
    summary: BudgetSummary;
    onClick?: () => void;
}

export default function BudgetCard({ summary, onClick }: BudgetCardProps) {
    const {
        category_name,
        budget_amount,
        spent_amount,
        remaining_amount,
        percentage_used,
    } = summary;

    const isOverBudget = percentage_used >= 100;
    const isWarning = percentage_used >= 90 && percentage_used < 100;

    const getStatusColor = () => {
        if (isOverBudget) return "text-danger";
        if (isWarning) return "text-warning";
        return "text-success";
    };

    const getProgressColor = () => {
        if (isOverBudget) return "bg-danger";
        if (isWarning) return "bg-warning";
        return "bg-success";
    };

    const formatCurrency = (val: number) =>
        new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: "INR",
            maximumFractionDigits: 0,
        }).format(val);

    return (
        <motion.div
            whileHover={{ y: -6 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            onClick={onClick}
            className="group cursor-pointer"
        >
            <Card className="overflow-hidden border border-border bg-card/50 backdrop-blur-sm hover:bg-card hover:border-primary/20 transition-all duration-300 shadow-sm hover:shadow-xl rounded-[2rem]">
                <CardContent className="p-7">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-4">
                            <div 
                                className={cn(
                                    "w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm border border-border/50 transition-transform group-hover:scale-110 duration-500",
                                )}
                                style={{ 
                                    backgroundColor: summary.category_color ? `${summary.category_color}1a` : undefined,
                                    borderColor: summary.category_color ? `${summary.category_color}4d` : undefined 
                                }}
                            >
                                <Target 
                                    className={cn("w-6 h-6", !summary.category_color && getStatusColor())} 
                                    style={{ color: summary.category_color || undefined }}
                                />
                            </div>
                            <div>
                                <h3 className="text-lg font-black text-text-primary tracking-tight">{category_name}</h3>
                                <p className="text-[10px] text-text-secondary font-black uppercase tracking-widest opacity-70">Monthly Limit</p>
                            </div>
                        </div>
                        <div className={cn(
                            "rounded-full px-3 py-1 font-black text-xs tracking-tighter",
                            isOverBudget ? "bg-destructive/10 text-destructive" : "bg-secondary text-text-primary"
                        )}>
                            {percentage_used.toFixed(0)}%
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="flex justify-between items-end">
                            <div className="space-y-1">
                                <p className="text-[10px] font-black uppercase tracking-widest text-text-secondary opacity-60">Spent So Far</p>
                                <p className="text-2xl font-black text-text-primary tracking-tighter">{formatCurrency(spent_amount)}</p>
                            </div>
                            <div className="text-right space-y-1">
                                <p className="text-[10px] font-black uppercase tracking-widest text-text-secondary opacity-60">Total Budget</p>
                                <p className="text-sm font-bold text-text-secondary tracking-tight">{formatCurrency(budget_amount)}</p>
                            </div>
                        </div>

                        <div className="space-y-2.5">
                            <div className="relative h-2.5 w-full bg-muted rounded-full overflow-hidden">
                                <motion.div 
                                    initial={{ width: 0 }}
                                    animate={{ width: `${Math.min(percentage_used, 100)}%` }}
                                    transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
                                    className={cn("h-full rounded-full shadow-[0_0_10px_rgba(0,0,0,0.1)]", getProgressColor())}
                                />
                            </div>
                            
                            <div className="flex items-center justify-between">
                                 <div className="flex items-center gap-2">
                                    <div className={cn("w-1.5 h-1.5 rounded-full animate-pulse", getProgressColor())} />
                                    <span className={cn("text-[10px] font-black uppercase tracking-widest", getStatusColor())}>
                                        {isOverBudget ? "Exceeded" : isWarning ? "Warning" : "On Track"}
                                    </span>
                                 </div>
                                 <p className="text-[11px] font-bold text-text-secondary tracking-tight">
                                    {isOverBudget 
                                        ? `${formatCurrency(Math.abs(remaining_amount))} over limit` 
                                        : `${formatCurrency(remaining_amount)} remaining`}
                                 </p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
}
