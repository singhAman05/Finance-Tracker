// src/app/dashboard/reports/page.tsx
"use client";
import dynamic from "next/dynamic";
import { Skeleton } from "boneyard-js/react";
import { ReportsFixture } from "@/bones/fixtures";

const ReportsPage = dynamic(
  () => import("@/components/reports/reportPage"),
  { loading: () => <Skeleton name="reports" loading={true} fixture={<ReportsFixture />}><div className="min-h-[600px]" /></Skeleton> }
);

export default function Dashboard() {
  return <ReportsPage />;
}
