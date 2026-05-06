// src/app/dashboard/page.tsx
"use client";
import dynamic from "next/dynamic";
import { Skeleton } from "boneyard-js/react";
import { DashboardFixture } from "@/bones/fixtures";

const DashboardPage = dynamic(
  () => import("@/components/dashboard/dashboardPage"),
  { loading: () => <Skeleton name="dashboard" loading={true} fixture={<DashboardFixture />}><div className="min-h-[600px]" /></Skeleton> }
);

export default function Dashboard() {
  return <DashboardPage />;
}
