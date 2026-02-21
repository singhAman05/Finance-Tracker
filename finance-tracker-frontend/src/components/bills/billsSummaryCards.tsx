"use client";

import { useEffect, useState } from "react";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, AlertCircle, CheckCircle2 } from "lucide-react";

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

interface BillsSummaryCardsProps {
  upcomingCount: number;
  upcomingTotal: number;
  overdueCount: number;
  paidThisMonthCount: number;
  paidThisMonthTotal: number;
}

export default function BillsSummaryCards({
  upcomingCount,
  upcomingTotal,
  overdueCount,
  paidThisMonthCount,
  paidThisMonthTotal,
}: BillsSummaryCardsProps) {
  return (
    <motion.div
      variants={fadeUp}
      className="grid grid-cols-1 sm:grid-cols-3 gap-6"
    >
      {/* Upcoming */}
      <Card className="bg-primary/5 border-primary/20 shadow-sm hover:shadow-md transition-all duration-300">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-primary">
            Upcoming Bills
          </CardTitle>
          <div className="p-2 bg-primary/10 rounded-full">
            <Calendar className="h-4 w-4 text-primary" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold tracking-tighter">
            <AnimatedCounter target={upcomingTotal} prefix="₹" />
          </div>
          <p className="text-xs text-text-secondary mt-2 font-medium">
            <span className="text-text-primary font-semibold">{upcomingCount}</span>{" "}
            upcoming bill{upcomingCount !== 1 ? "s" : ""}
          </p>
        </CardContent>
      </Card>

      {/* Overdue */}
      <Card className="bg-danger/5 border-danger/20 shadow-sm hover:shadow-md transition-all duration-300">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-danger">
            Overdue
          </CardTitle>
          <div className="p-2 bg-danger/10 rounded-full">
            <AlertCircle className="h-4 w-4 text-danger" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold tracking-tighter text-danger">
            <AnimatedCounter target={overdueCount} />
          </div>
          <p className="text-xs text-text-secondary mt-2 font-medium">
            {overdueCount === 0
              ? "All bills up to date"
              : `${overdueCount} overdue bill${overdueCount !== 1 ? "s" : ""}`}
          </p>
        </CardContent>
      </Card>

      {/* Paid this month */}
      <Card className="bg-success/5 border-success/20 shadow-sm hover:shadow-md transition-all duration-300">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-success">
            Paid This Month
          </CardTitle>
          <div className="p-2 bg-success/10 rounded-full">
            <CheckCircle2 className="h-4 w-4 text-success" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold tracking-tighter text-success">
            <AnimatedCounter target={paidThisMonthTotal} prefix="₹" />
          </div>
          <p className="text-xs text-text-secondary mt-2 font-medium">
            <span className="text-text-primary font-semibold">{paidThisMonthCount}</span>{" "}
            bill{paidThisMonthCount !== 1 ? "s" : ""} paid
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
}
