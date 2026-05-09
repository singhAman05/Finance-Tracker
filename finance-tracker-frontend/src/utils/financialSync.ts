const FINANCIAL_MARKER_KEY = "finance:last-transaction-change";
const FINANCIAL_EVENT_NAME = "finance:transaction-changed";

export type FinancialSyncKind =
  | "transaction_add"
  | "transaction_delete"
  | "bill_paid"
  | "bill_create"
  | "generic";

export const markFinancialDataChanged = (kind: FinancialSyncKind = "generic") => {
  if (typeof window === "undefined") return;
  const now = String(Date.now());
  localStorage.setItem(FINANCIAL_MARKER_KEY, now);
  window.dispatchEvent(new CustomEvent(FINANCIAL_EVENT_NAME, { detail: { kind } }));
};

export const getFinancialDataMarker = (): number => {
  if (typeof window === "undefined") return 0;
  return Number(localStorage.getItem(FINANCIAL_MARKER_KEY) || "0");
};

export const FINANCIAL_SYNC_EVENT = FINANCIAL_EVENT_NAME;
