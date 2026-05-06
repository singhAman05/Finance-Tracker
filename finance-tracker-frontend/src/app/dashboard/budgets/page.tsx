"use client";
import dynamic from "next/dynamic";
import { Skeleton } from "boneyard-js/react";
import { BudgetsFixture } from "@/bones/fixtures";

const BudgetsPage = dynamic(
  () => import("@/components/budgets/BudgetsPage"),
  { loading: () => <Skeleton name="budgets" loading={true} fixture={<BudgetsFixture />}><div className="min-h-[600px]" /></Skeleton> }
);

export default function Page() {
  return <BudgetsPage />;
}
