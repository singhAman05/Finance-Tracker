"use client";

import { Skeleton } from "boneyard-js/react";
import {
  DashboardFixture,
  TransactionsFixture,
  AccountsFixture,
  BillsFixture,
  BudgetsFixture,
  ReportsFixture,
  SettingsFixture,
} from "@/bones/fixtures";

/**
 * Dedicated page for boneyard CLI to capture all skeleton layouts.
 * Each Skeleton is rendered with loading={false} so boneyard can snapshot the fixture DOM.
 */
export default function BoneyardCapturePage() {
  return (
    <div className="space-y-8">
      <Skeleton name="dashboard" loading={false}>
        <DashboardFixture />
      </Skeleton>

      <Skeleton name="transactions" loading={false}>
        <TransactionsFixture />
      </Skeleton>

      <Skeleton name="accounts" loading={false}>
        <AccountsFixture />
      </Skeleton>

      <Skeleton name="bills" loading={false}>
        <BillsFixture />
      </Skeleton>

      <Skeleton name="budgets" loading={false}>
        <BudgetsFixture />
      </Skeleton>

      <Skeleton name="reports" loading={false}>
        <ReportsFixture />
      </Skeleton>

      <Skeleton name="settings" loading={false}>
        <SettingsFixture />
      </Skeleton>
    </div>
  );
}
