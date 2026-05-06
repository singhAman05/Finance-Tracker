"use client";
import dynamic from "next/dynamic";
import { Skeleton } from "boneyard-js/react";
import { SettingsFixture } from "@/bones/fixtures";

const SettingsPage = dynamic(
  () => import("@/components/settings/settingsPage"),
  { loading: () => <Skeleton name="settings" loading={true} fixture={<SettingsFixture />}><div className="min-h-[600px]" /></Skeleton> }
);

export default function Page() {
  return <SettingsPage />;
}
