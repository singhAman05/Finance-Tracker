"use client";
import dynamic from "next/dynamic";
import { Skeleton } from "boneyard-js/react";
import { BillsFixture } from "@/bones/fixtures";

const BillsPage = dynamic(
  () => import("@/components/bills/billsPage"),
  { loading: () => <Skeleton name="bills" loading={true} fixture={<BillsFixture />}><div className="min-h-[600px]" /></Skeleton> }
);

export default function BillsRoute() {
  return <BillsPage />;
}
