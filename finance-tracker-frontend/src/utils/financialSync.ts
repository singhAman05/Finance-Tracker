const FINANCIAL_MARKER_KEY = "finance:last-transaction-change";
const FINANCIAL_EVENT_NAME = "finance:transaction-changed";

export const markFinancialDataChanged = () => {
  if (typeof window === "undefined") return;
  const now = String(Date.now());
  localStorage.setItem(FINANCIAL_MARKER_KEY, now);
  window.dispatchEvent(new Event(FINANCIAL_EVENT_NAME));
};

export const getFinancialDataMarker = (): number => {
  if (typeof window === "undefined") return 0;
  return Number(localStorage.getItem(FINANCIAL_MARKER_KEY) || "0");
};

export const FINANCIAL_SYNC_EVENT = FINANCIAL_EVENT_NAME;

