"use client";

import { useCallback } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/app/store";
import { format as fnsFormat } from "date-fns";

const FORMAT_MAP: Record<string, string> = {
  "DD/MM/YYYY": "dd/MM/yyyy",
  "MM/DD/YYYY": "MM/dd/yyyy",
  "YYYY-MM-DD": "yyyy-MM-dd",
  "DD-MM-YYYY": "dd-MM-yyyy",
  "DD.MM.YYYY": "dd.MM.yyyy",
};

export function useDateFormat() {
  const settingFormat =
    useSelector((state: RootState) => state.settings.settings?.date_format) || "DD/MM/YYYY";

  const dateFormat = FORMAT_MAP[settingFormat] || "dd/MM/yyyy";

  const formatDate = useCallback(
    (date: string | Date) => {
      const d = typeof date === "string" ? new Date(date) : date;
      return fnsFormat(d, dateFormat);
    },
    [dateFormat]
  );

  return { dateFormat, formatDate };
}
