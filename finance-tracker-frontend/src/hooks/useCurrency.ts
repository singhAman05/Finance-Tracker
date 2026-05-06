"use client";

import { useCallback } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/app/store";

const CURRENCY_MAP: Record<string, { locale: string; symbol: string }> = {
  INR: { locale: "en-IN", symbol: "₹" },
  USD: { locale: "en-US", symbol: "$" },
  EUR: { locale: "de-DE", symbol: "€" },
  GBP: { locale: "en-GB", symbol: "£" },
  JPY: { locale: "ja-JP", symbol: "¥" },
  AUD: { locale: "en-AU", symbol: "A$" },
  CAD: { locale: "en-CA", symbol: "C$" },
  CHF: { locale: "de-CH", symbol: "CHF" },
  CNY: { locale: "zh-CN", symbol: "¥" },
  SGD: { locale: "en-SG", symbol: "S$" },
  AED: { locale: "ar-AE", symbol: "د.إ" },
  SAR: { locale: "ar-SA", symbol: "ر.س" },
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
    (val: number) => {
      const abs = Math.abs(val);
      if (abs >= 1_000_000) return `${info.symbol}${(val / 1_000_000).toFixed(1)}M`;
      if (abs >= 1_000) return `${info.symbol}${(val / 1_000).toFixed(0)}k`;
      return `${info.symbol}${val}`;
    },
    [info.symbol]
  );

  return { formatCurrency, symbol: info.symbol, currency, formatAxis };
}
