"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BillInstance, Bill } from "@/types/interfaces";
import { Calendar, CheckCircle2, Clock, AlertCircle, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0 },
};

interface BillsInstanceListProps {
  instances: BillInstance[];
  bills: Bill[];
  onPay: (instanceId: string) => void;
  payingId: string | null;
}

const statusConfig = {
  upcoming: {
    label: "Upcoming",
    icon: Clock,
    color: "text-info",
    badgeClass: "bg-info/10 text-info border-info/20",
  },
  paid: {
    label: "Paid",
    icon: CheckCircle2,
    color: "text-success",
    badgeClass: "bg-success/10 text-success border-success/20",
  },
  overdue: {
    label: "Overdue",
    icon: AlertCircle,
    color: "text-danger",
    badgeClass: "bg-danger/10 text-danger border-danger/20",
  },
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
  }).format(value);
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function BillsInstanceList({
  instances,
  bills,
  onPay,
  payingId,
}: BillsInstanceListProps) {
  const billMap = bills.reduce((acc, b) => {
    acc[b.id] = b;
    return acc;
  }, {} as Record<string, Bill>);

  const now = new Date();
  now.setHours(0, 0, 0, 0);

  const sorted = [...instances].sort((a, b) => {
    // 1. Determine effective status (taking date into account)
    const getEffectiveStatus = (inst: BillInstance) => {
        if (inst.status === 'paid') return 'paid';
        const dueDate = new Date(inst.due_date);
        dueDate.setHours(0, 0, 0, 0);
        return dueDate < now ? 'overdue' : 'upcoming';
    };

    const statusA = getEffectiveStatus(a);
    const statusB = getEffectiveStatus(b);

    const order = { overdue: 0, upcoming: 1, paid: 2 };
    
    // Sort by status priority first
    if (order[statusA] !== order[statusB]) {
        return order[statusA] - order[statusB];
    }

    // Within same status, sort by proximity to today
    const dateA = new Date(a.due_date).getTime();
    const dateB = new Date(b.due_date).getTime();

    if (statusA === 'overdue') {
        // Overdue: Closest to today should be at the top (i.e. latest due date)
        return dateB - dateA;
    }

    // Upcoming or Paid: Earliest date first
    return dateA - dateB;
  });

  if (sorted.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center justify-center py-24 text-text-secondary gap-3"
      >
        <Calendar className="h-12 w-12 opacity-30" />
        <p className="text-base font-medium">No bill instances yet.</p>
        <p className="text-sm">Add a bill using the button above to get started.</p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="grid grid-cols-1 gap-4"
    >
      <AnimatePresence mode="popLayout">
        {sorted.map((instance, i) => {
          const bill = billMap[instance.bill_id];
          
          // Determine effective status for display
          let effectiveStatus: "upcoming" | "paid" | "overdue" = instance.status;
          if (instance.status === "upcoming") {
              const dueDate = new Date(instance.due_date);
              dueDate.setHours(0, 0, 0, 0);
              if (dueDate < now) effectiveStatus = "overdue";
          }

          const status = statusConfig[effectiveStatus];
          const StatusIcon = status.icon;
          const isPaying = payingId === instance.id;

          return (
            <motion.div
              key={instance.id}
              custom={i}
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              exit={{ opacity: 0, scale: 0.97, transition: { duration: 0.2 } }}
              layout
            >
              <Card className="bg-card border-border shadow-sm hover:shadow-md transition-all duration-300">
                <CardContent className="p-4 sm:p-5">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    {/* Left: icon + info */}
                    <div className="flex items-start gap-4">
                      <div
                        className={`p-2.5 rounded-xl mt-0.5 shrink-0 ${
                          effectiveStatus === "paid"
                            ? "bg-success/10"
                            : effectiveStatus === "overdue"
                            ? "bg-danger/10"
                            : "bg-primary/10"
                        }`}
                      >
                        <StatusIcon className={`h-5 w-5 ${status.color}`} />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold tracking-tight text-text-primary truncate">
                            {bill?.name ?? "Unknown Bill"}
                          </span>
                          {bill?.is_recurring && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-medium text-text-secondary bg-muted px-1.5 py-0.5 rounded-md">
                              <RefreshCw className="h-2.5 w-2.5" />
                              Recurring
                            </span>
                          )}
                          <Badge
                            variant="outline"
                            className={`text-[10px] px-2 py-0.5 ${status.badgeClass}`}
                          >
                            {status.label}
                          </Badge>
                        </div>
                        <div className="text-xs text-text-secondary mt-1 flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          Due: {formatDate(instance.due_date)}
                          {instance.paid_at && (
                            <span className="ml-2 text-success">
                              • Paid {formatDate(instance.paid_at)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right: amount + action */}
                    <div className="flex items-center gap-3 sm:flex-col sm:items-end sm:gap-2">
                      <span
                        className={`text-xl font-bold tracking-tighter ${
                          effectiveStatus === "paid"
                            ? "text-success"
                            : effectiveStatus === "overdue"
                            ? "text-danger"
                            : "text-text-primary"
                        }`}
                      >
                        {formatCurrency(instance.amount)}
                      </span>

                      {effectiveStatus !== "paid" && (
                        <Button
                          size="sm"
                          variant={effectiveStatus === "overdue" ? "destructive" : "default"}
                          onClick={() => onPay(instance.id)}
                          disabled={isPaying}
                          className={cn(
                            "rounded-full text-xs h-8 px-4 shrink-0 font-medium transition-all shadow-sm",
                            effectiveStatus === "upcoming" && "bg-primary text-primary-foreground hover:bg-primary/90",
                            effectiveStatus === "overdue" && "bg-danger text-white hover:bg-danger/90"
                          )}
                        >
                          {isPaying ? "Processing…" : "Mark as Paid"}
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </motion.div>
  );
}
