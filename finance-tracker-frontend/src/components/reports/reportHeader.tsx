"use client";

import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { ReportPeriod } from "@/service/service_reports";
import { Download, FileJson, FileSpreadsheet, RefreshCw } from "lucide-react";

interface ReportHeaderProps {
  title: string;
  subtitle: string;
  period: ReportPeriod;
  horizon: number;
  isRefreshing: boolean;
  onPeriodChange: (value: ReportPeriod) => void;
  onHorizonChange: (value: number) => void;
  onRefresh: () => void;
  onExportCurrent: () => void;
  onExportFullCsv: () => void;
  onExportJson: () => void;
}

export default function ReportHeader({
  title,
  subtitle,
  period,
  horizon,
  isRefreshing,
  onPeriodChange,
  onHorizonChange,
  onRefresh,
  onExportCurrent,
  onExportFullCsv,
  onExportJson,
}: ReportHeaderProps) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4 md:p-5">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-text-primary">{title}</h1>
          <p className="text-sm text-text-secondary mt-1">{subtitle}</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Select value={period} onValueChange={(v) => onPeriodChange(v as ReportPeriod)}>
            <SelectTrigger className="w-[160px] bg-background border-border rounded-full">
              <SelectValue placeholder="Period" />
            </SelectTrigger>
            <SelectContent className="bg-card border-border">
              <SelectItem value="thisMonth">This Month</SelectItem>
              <SelectItem value="lastMonth">Last Month</SelectItem>
              <SelectItem value="last3Months">Last 3 Months</SelectItem>
              <SelectItem value="last6Months">Last 6 Months</SelectItem>
              <SelectItem value="allTime">All Time</SelectItem>
            </SelectContent>
          </Select>

          <Select value={String(horizon)} onValueChange={(v) => onHorizonChange(Number(v))}>
            <SelectTrigger className="w-[130px] bg-background border-border rounded-full">
              <SelectValue placeholder="Forecast" />
            </SelectTrigger>
            <SelectContent className="bg-card border-border">
              <SelectItem value="30">30 Days</SelectItem>
              <SelectItem value="60">60 Days</SelectItem>
              <SelectItem value="90">90 Days</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" onClick={onRefresh} className="rounded-full" disabled={isRefreshing}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
            Refresh
          </Button>

          <Button variant="outline" onClick={onExportCurrent} className="rounded-full">
            <FileSpreadsheet className="h-4 w-4 mr-2" />
            Export Current
          </Button>

          <Button variant="outline" onClick={onExportFullCsv} className="rounded-full">
            <Download className="h-4 w-4 mr-2" />
            Export Full CSV
          </Button>

          <Button variant="outline" onClick={onExportJson} className="rounded-full">
            <FileJson className="h-4 w-4 mr-2" />
            Export JSON
          </Button>
        </div>
      </div>
    </div>
  );
}
