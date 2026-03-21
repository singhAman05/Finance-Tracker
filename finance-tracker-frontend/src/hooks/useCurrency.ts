"use client";

import { useCallback } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/app/store";

const CURRENCY_MAP: Record<string, { locale: string; symbol: string }> = {
  INR: { locale: "en-IN", symbol: "₹" },
  USD: { locale: "en-US", symbol: "$" },
  EUR: { locale: "de-DE", symbol: "€" },
  GBP: { locale: "en-GB", symbol: "£" },
};

export function useCurrency() {
  const currency =
    useSelector((state: RootState) => state.settings.settings?.currency) || "INR";

  const info = CURRENCY_MAP[currency] || CURRENCY_MAP.INR;

  const formatCurrency = useCallback(
    (val: number) =>
      new Intl.NumberFormat(info.locale, {
        style: "currency",
        currency,
        maximumFractionDigits: 0,
      }).format(val),
    [currency, info.locale]
  );

  /** Short axis formatter for charts, e.g. "$12k" */
  const formatAxis = useCallback(
    (val: number) => `${info.symbol}${val / 1000}k`,
    [info.symbol]
  );

  return { formatCurrency, symbol: info.symbol, currency, formatAxis };
}
