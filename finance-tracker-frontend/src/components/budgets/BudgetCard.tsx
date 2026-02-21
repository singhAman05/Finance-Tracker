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
    const isWarning = percentage_used >= 80 && percentage_used < 100;

    const getStatusColor = () => {
        if (isOverBudget) return "text-destructive";
        if (isWarning) return "text-amber-500";
        return "text-emerald-500";
    };

    const getProgressColor = () => {
        if (isOverBudget) return "bg-destructive";
        if (isWarning) return "bg-amber-500";
        return "bg-emerald-500";
    };

    const formatCurrency = (val: number) =>
        new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: "INR",
            maximumFractionDigits: 0,
        }).format(val);

    return (
        <motion.div
            whileHover={{ y: -4 }}
            transition={{ duration: 0.2 }}
            onClick={onClick}
            className="cursor-pointer"
        >
            <Card className="overflow-hidden border border-border bg-card hover:border-primary/20 transition-all duration-300 shadow-sm hover:shadow-md">
                <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className={cn(
                                "w-10 h-10 rounded-xl flex items-center justify-center shadow-sm border border-border/50",
                                isOverBudget ? "bg-destructive/10" : isWarning ? "bg-amber-500/10" : "bg-emerald-500/10"
                            )}>
                                <Target className={cn("w-5 h-5", getStatusColor())} />
                            </div>
                            <div>
                                <h3 className="font-bold text-text-primary tracking-tight">{category_name}</h3>
                                <p className="text-xs text-text-secondary font-medium uppercase tracking-wider">Monthly Budget</p>
                            </div>
                        </div>
                        <Badge variant={isOverBudget ? "destructive" : "secondary"} className="rounded-full px-3 py-1 font-bold">
                            {percentage_used.toFixed(0)}%
                        </Badge>
                    </div>

                    <div className="space-y-4">
                        <div className="flex justify-between items-end">
                            <div>
                                <p className="text-xs text-text-secondary mb-1">Spent</p>
                                <p className="text-xl font-bold text-text-primary">{formatCurrency(spent_amount)}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-xs text-text-secondary mb-1">Limit</p>
                                <p className="text-sm font-semibold text-text-secondary">{formatCurrency(budget_amount)}</p>
                            </div>
                        </div>

                        <div className="relative pt-1">
                            <Progress 
                                value={Math.min(percentage_used, 100)} 
                                className="h-2.5 bg-muted"
                                // @ts-ignore - custom color handling in some components, or we apply via className
                            />
                            <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${Math.min(percentage_used, 100)}%` }}
                                transition={{ duration: 1, ease: "easeOut" }}
                                className={cn("absolute top-1 left-0 h-2.5 rounded-full", getProgressColor())}
                            />
                        </div>

                        <div className="flex items-center justify-between pt-2">
                             <div className="flex items-center gap-1.5">
                                {isOverBudget ? (
                                    <AlertTriangle className="w-3.5 h-3.5 text-destructive" />
                                ) : (
                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                                )}
                                <span className={cn("text-[11px] font-bold uppercase tracking-wider", getStatusColor())}>
                                    {isOverBudget ? "Exceeded" : isWarning ? "Warning" : "On Track"}
                                </span>
                             </div>
                             <p className="text-xs font-medium text-text-secondary">
                                {isOverBudget 
                                    ? `${formatCurrency(Math.abs(remaining_amount))} over` 
                                    : `${formatCurrency(remaining_amount)} left`}
                             </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
}
