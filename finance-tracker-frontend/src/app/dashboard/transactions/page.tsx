"use client";
import dynamic from "next/dynamic";
import { Skeleton } from "boneyard-js/react";
import { TransactionsFixture } from "@/bones/fixtures";

const TransactionPage = dynamic(
  () => import("@/components/transactions/transactionPage"),
  { loading: () => <Skeleton name="transactions" loading={true} fixture={<TransactionsFixture />}><div className="min-h-[600px]" /></Skeleton> }
);

export default function Dashboard() {
  return <TransactionPage />;
}
