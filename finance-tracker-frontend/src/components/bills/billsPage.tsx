// components/bills/billsPage.tsx
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import { RootState } from "@/app/store";
import { setBills, setInstances, markInstancePaid } from "@/components/redux/slices/slice_bills";
import { setTransactions } from "@/components/redux/slices/slice_transactions";
import { payBillInstance } from "@/service/service_bills";
import { fetchBillInstancesRoute, fetchBillsRoute } from "@/routes/route_bills";
import { fetchTransactions } from "@/service/service_transactions";
import { Skeleton } from "@/components/ui/skeleton";

import BillsHeader from "@/components/bills/billsHeader";
import BillsSummaryCards from "@/components/bills/billsSummaryCards";
import BillsInstanceList from "@/components/bills/billsInstanceList";
import { AddBillModal } from "@/components/modals/addBill-modal"; // Still importing for type if needed, but we render via RootModal
import { openModal } from "@/components/redux/slices/slice_modal";

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

const LoadingSkeleton = () => (
  <div className="space-y-4 p-6">
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {[1, 2, 3].map((i) => (
        <Skeleton key={i} className="h-32 w-full rounded-2xl bg-muted" />
      ))}
    </div>
    <Skeleton className="h-[400px] w-full rounded-2xl bg-muted" />
  </div>
);

export default function BillsPage() {
  const dispatch = useDispatch();
  const { bills, instances } = useSelector((state: RootState) => state.bills);

  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { type: modalType } = useSelector((state: RootState) => state.modal);
  const [payingId, setPayingId] = useState<string | null>(null);

  // ── Data Loading (matches accounts / transactions pattern) ─────────────────
  const loadData = useCallback(
    async (isRefresh = false) => {
      try {
        if (isRefresh) setIsRefreshing(true);
        else setIsLoading(true);

        const [billsRes, instancesRes] = await Promise.all([
          fetchBillsRoute(),
          fetchBillInstancesRoute(),
        ]);
        if (billsRes?.data) dispatch(setBills(billsRes.data));
        if (instancesRes?.data) dispatch(setInstances(instancesRes.data));
      } catch (err) {
        console.error("Failed to load bills:", err);
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [dispatch]
  );

  useEffect(() => {
    loadData();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Summary Stats ──────────────────────────────────────────────────────────
  const now = new Date();
  const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

  const stats = useMemo(() => {
    const upcoming = instances.filter((i) => i.status === "upcoming");
    const overdue = instances.filter((i) => i.status === "overdue");
    const paidThisMonth = instances.filter(
      (i) =>
        i.status === "paid" &&
        i.paid_at &&
        i.paid_at.startsWith(currentMonthKey)
    );
    return {
      upcomingCount: upcoming.length,
      upcomingTotal: upcoming.reduce((sum, i) => sum + i.amount, 0),
      overdueCount: overdue.length,
      paidThisMonthCount: paidThisMonth.length,
      paidThisMonthTotal: paidThisMonth.reduce((sum, i) => sum + i.amount, 0),
    };
  }, [instances, currentMonthKey]);

  // ── Pay Handler ────────────────────────────────────────────────────────────
  const handlePay = async (instanceId: string) => {
    setPayingId(instanceId);
    try {
      const result = await payBillInstance(instanceId);
      if (result) {
        dispatch(markInstancePaid(instanceId));
        // Re-fetch instances to pick up next recurring instance from backend
        // Also refresh transactions since paying a bill creates a transaction
        const [instancesRes, txRes] = await Promise.all([
          fetchBillInstancesRoute(),
          fetchTransactions()
        ]);
        if (instancesRes?.data) dispatch(setInstances(instancesRes.data));
        if (txRes?.data) dispatch(setTransactions(txRes.data));
      }
    } catch (err) {
      console.error("Failed to pay bill:", err);
    } finally {
      setPayingId(null);
    }
  };

  // ── Refresh on Modal Close ────────────────────────────────────────────────
  const [prevModalType, setPrevModalType] = useState<string | null>(null);
  useEffect(() => {
    if (prevModalType === "ADD_BILL" && modalType === null) {
      loadData(true);
    }
    setPrevModalType(modalType);
  }, [modalType, prevModalType, loadData]);

  // ── Render ─────────────────────────────────────────────────────────────────
  if (isLoading && instances.length === 0) {
    return (
      <div className="min-h-screen bg-background relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(circle, var(--color-text-primary) 1px, transparent 1px)`,
            backgroundSize: "32px 32px",
          }}
        />
        <LoadingSkeleton />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-text-primary px-4 md:px-6 py-6 md:py-8 relative overflow-hidden">
      {/* Background dot pattern */}
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
        className="flex flex-col gap-6 relative z-10"
      >
        <BillsHeader
          onAddBill={() => dispatch(openModal({ type: "ADD_BILL" }))}
          onRefresh={() => loadData(true)}
          isRefreshing={isRefreshing}
        />

        <BillsSummaryCards
          upcomingCount={stats.upcomingCount}
          upcomingTotal={stats.upcomingTotal}
          overdueCount={stats.overdueCount}
          paidThisMonthCount={stats.paidThisMonthCount}
          paidThisMonthTotal={stats.paidThisMonthTotal}
        />

        <motion.div variants={fadeUp}>
          <BillsInstanceList
            instances={instances}
            bills={bills}
            onPay={handlePay}
            payingId={payingId}
          />
        </motion.div>
      </motion.div>

    </div>
  );
}
