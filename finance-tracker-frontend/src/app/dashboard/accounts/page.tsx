// src/app/dashboard/accounts/page.tsx
"use client";
import dynamic from "next/dynamic";
import { Skeleton } from "boneyard-js/react";
import { AccountsFixture } from "@/bones/fixtures";

const AccountsPage = dynamic(
  () => import("@/components/accounts/account_manage"),
  { loading: () => <Skeleton name="accounts" loading={true} fixture={<AccountsFixture />}><div className="min-h-[600px]" /></Skeleton> }
);

export default function Dashboard() {
  return <AccountsPage />;
}
