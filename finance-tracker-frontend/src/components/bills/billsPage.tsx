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
import { notify } from "@/lib/notifications";
import { Skeleton } from "boneyard-js/react";
import { BillsFixture } from "@/bones/fixtures";

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

export default function BillsPage() {
  const dispatch = useDispatch();
  const { bills, instances } = useSelector((state: RootState) => state.bills);
  const accounts = useSelector((state: RootState) => state.accounts.accounts);

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
        // Error surfaced via notifications
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
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    const upcoming = instances.filter((i) => {
        if (i.status !== "upcoming") return false;
        const dueDate = new Date(i.due_date);
        dueDate.setHours(0, 0, 0, 0);
        return dueDate >= now;
    });

    const overdue = instances.filter((i) => {
        if (i.status === "overdue") return true;
        if (i.status === "upcoming") {
            const dueDate = new Date(i.due_date);
            dueDate.setHours(0, 0, 0, 0);
            return dueDate < now;
        }
        return false;
    });

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
    // Find the instance and its parent bill to check account status
    const instance = instances.find((i) => i.id === instanceId);
    if (instance) {
      const bill = bills.find((b) => b.id === instance.bill_id);
      if (bill?.account_id) {
        const account = accounts.find((a: any) => a.id === bill.account_id);
        if (account?.status === "inactive") {
          notify.error("Cannot pay bill from an inactive account. Please activate the account first.");
          return;
        }
      }
    }

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
      // Error surfaced via notifications
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
  return (
    <Skeleton name="bills" loading={isLoading && instances.length === 0} fixture={<BillsFixture />}>
    <div className="min-h-screen bg-background text-text-primary px-4 md:px-8 lg:px-12 py-6 md:py-8 relative overflow-hidden">
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
            accounts={accounts}
            onPay={handlePay}
            payingId={payingId}
          />
        </motion.div>
      </motion.div>

    </div>
    </Skeleton>
  );
}
