"use client";

import { useEffect, useMemo, useState } from "react";
import { FINANCIAL_SYNC_EVENT, getFinancialDataMarker } from "@/utils/financialSync";

export default function FinancialSyncBadge() {
  const [marker, setMarker] = useState<number>(0);
  const [eventCount, setEventCount] = useState(0);

  useEffect(() => {
    const refreshMarker = () => setMarker(getFinancialDataMarker());
    refreshMarker();

    const onSync = () => {
      setEventCount((n) => n + 1);
      refreshMarker();
    };
    const onFocus = () => refreshMarker();
    const onVisibility = () => {
      if (document.visibilityState === "visible") refreshMarker();
    };

    window.addEventListener(FINANCIAL_SYNC_EVENT, onSync);
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      window.removeEventListener(FINANCIAL_SYNC_EVENT, onSync);
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  const markerTime = useMemo(() => {
    if (!marker) return "none";
    return new Date(marker).toLocaleTimeString();
  }, [marker]);

  return (
    <div className="fixed bottom-3 right-3 z-[100] rounded-lg border border-border bg-card/90 px-3 py-2 text-[11px] font-mono text-text-secondary shadow-lg backdrop-blur-sm">
      <div className="font-semibold text-text-primary">SYNC DEBUG</div>
      <div>marker: {marker || 0}</div>
      <div>time: {markerTime}</div>
      <div>events: {eventCount}</div>
    </div>
  );
}

