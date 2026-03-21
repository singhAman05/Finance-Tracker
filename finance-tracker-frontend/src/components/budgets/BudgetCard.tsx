import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Target, PauseCircle, Check } from "lucide-react";
import { BudgetSummary } from "@/components/redux/slices/slice_budgets";
import { expireBudget } from "@/service/service_budgets";
import { useCurrency } from "@/hooks/useCurrency";

interface BudgetCardProps {
    summary: BudgetSummary;
    onClick?: () => void;
    onRefresh?: () => void;
}

export default function BudgetCard({ summary, onClick, onRefresh }: BudgetCardProps) {
    const [showConfirm, setShowConfirm] = useState(false);
    const [isExpiring, setIsExpiring] = useState(false);
    const {
        category_name,
        budget_name,
        period_type,
        budget_amount,
        total_spent,
        remaining,
        percentage_used,
        end_date,
    } = summary;

    const spent_amount = total_spent;
    const remaining_amount = remaining;

    const isExpired = !summary.is_active;

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

    const { formatCurrency } = useCurrency();

    const handleExpire = async (e: React.MouseEvent) => {
        e.stopPropagation();
        try {
            setIsExpiring(true);
            const result = await expireBudget(summary.budget_id);
            if (result && onRefresh) {
                onRefresh();
            } else {
                // If no refresh callback is passed, triggering a reload will suffice
                // Alternatively, component just updates via a global reload
                window.location.reload(); 
            }
        } catch (error) {
            console.error("Failed to expire budget", error);
        } finally {
            setIsExpiring(false);
            setShowConfirm(false);
        }
    };

    return (
        <motion.div
            whileHover={!isExpired ? { y: -6 } : {}}
            transition={{ duration: 0.3, ease: "easeOut" }}
            onClick={!isExpired ? onClick : undefined}
            className={cn("group", !isExpired ? "cursor-pointer" : "cursor-default opacity-85 hover:opacity-100 transition-opacity")}
        >
            <Card className="overflow-hidden border border-border bg-card/50 backdrop-blur-sm hover:bg-card hover:border-primary/20 transition-all duration-300 shadow-sm hover:shadow-xl rounded-[1.5rem] sm:rounded-[2rem]">
                <CardContent className="p-5 sm:p-7">
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
                                <h3 className="text-base sm:text-lg font-black text-text-primary tracking-tight">
                                    {budget_name?.trim() || category_name}
                                </h3>
                                 <div className="flex items-center gap-2">
                                    <p className="text-[9px] sm:text-[10px] text-text-secondary font-black uppercase tracking-widest opacity-70">
                                        {(period_type || "monthly")} limit
                                    </p>

                                    {budget_name && (
                                        <span className="px-1.5 py-0.5 rounded-md bg-muted text-[8px] sm:text-[9px] font-bold text-text-secondary uppercase tracking-wider">
                                            {category_name}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                             <div className={cn(
                                "rounded-full px-3 py-1 font-black text-xs tracking-tighter",
                                isExpired ? "bg-muted text-text-secondary" : isOverBudget ? "bg-destructive/10 text-destructive" : "bg-secondary text-text-primary"
                            )}>
                                {isExpired ? "EXPIRED" : `${Math.min(percentage_used, 100).toFixed(0)}%`}
                            </div>
                            
                            {!isExpired && (
                               <button 
                                 onClick={(e) => { e.stopPropagation(); setShowConfirm(true); }}
                                 className="text-text-secondary hover:text-danger opacity-0 group-hover:opacity-100 transition-opacity p-1"
                                 title="End Budget Early"
                               >
                                 <PauseCircle className="w-6 h-6" />
                               </button>
                            )}
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="flex justify-between items-end">
                             <div className="space-y-1">
                                <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-text-secondary opacity-60">Spent So Far</p>
                                <p className="text-xl sm:text-2xl font-black text-text-primary tracking-tighter">{formatCurrency(spent_amount)}</p>
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
                                 {isExpired ? (
                                     <span className="text-[10px] font-black uppercase tracking-widest text-text-secondary">
                                         Finished
                                     </span>
                                 ) : (
                                     <div className="flex items-center gap-2">
                                        <div className={cn("w-1.5 h-1.5 rounded-full animate-pulse", getProgressColor())} />
                                        <span className={cn("text-[10px] font-black uppercase tracking-widest", getStatusColor())}>
                                            {isOverBudget ? "Exceeded" : isWarning ? "Warning" : "On Track"}
                                        </span>
                                     </div>
                                 )}
                                 <p className="text-[11px] font-bold text-text-secondary tracking-tight">
                                    {isOverBudget 
                                        ? `${formatCurrency(Math.abs(remaining_amount))} over limit` 
                                        : `${formatCurrency(remaining_amount)} remaining`}
                                 </p>
                            </div>
                        </div>
                    </div>
                </CardContent>
                
                {/* Confirmation Overlay */}
                <AnimatePresence>
                    {showConfirm && (
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 z-20 bg-background/90 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center rounded-[1.5rem] sm:rounded-[2rem]"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <PauseCircle className="w-8 h-8 text-danger mb-3" />
                            <h4 className="font-bold text-text-primary text-sm mb-1">End Budget Early?</h4>
                            <p className="text-xs text-text-secondary mb-4">This will permanently set the budget's expiration date to today. This cannot be undone.</p>
                            
                            <div className="flex gap-2 w-full">
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  className="flex-1 rounded-full text-xs h-8"
                                  onClick={() => setShowConfirm(false)}
                                  disabled={isExpiring}
                                >
                                  Cancel
                                </Button>
                                <Button 
                                  size="sm" 
                                  className="flex-1 rounded-full text-xs h-8 bg-danger text-white hover:bg-danger/90"
                                  onClick={handleExpire}
                                  disabled={isExpiring}
                                >
                                  {isExpiring ? "Ending..." : "End Now"}
                                </Button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </Card>
        </motion.div>
    );
}
