"use client";

import { motion } from "framer-motion";
import { Plus, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] as const },
  },
};

interface BudgetsHeaderProps {
  onAddBudget: () => void;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export default function BudgetsHeader({ onAddBudget, onRefresh, isRefreshing }: BudgetsHeaderProps) {
  return (
    <motion.div
      variants={fadeUp}
      className="flex flex-col gap-4 md:flex-row md:justify-between md:items-center"
    >
      <div>
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tighter text-text-primary">
          Budget Management
        </h1>
        <p className="mt-2 text-base text-text-secondary">
          Track your spending habits and hit your financial targets.
        </p>
      </div>

      <div className="flex items-center gap-3 w-full md:w-auto">
        {onRefresh && (
          <Button
            variant="outline"
            size="icon"
            onClick={onRefresh}
            disabled={isRefreshing}
            className={cn(
              "rounded-full border border-border bg-card text-text-primary hover:bg-muted w-12 h-12",
              isRefreshing && "animate-spin"
            )}
          >
            <RefreshCw className="h-5 w-5" />
          </Button>
        )}
        <Button
          size="lg"
          onClick={onAddBudget}
          className="gap-2 flex-1 text-primary-foreground md:flex-none shadow-lg hover:shadow-xl transition-all duration-300 rounded-full bg-primary hover:bg-primary/90"
        >
          <Plus size={18} />
          Add Budget
        </Button>
      </div>
    </motion.div>
  );
}
