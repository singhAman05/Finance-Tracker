/**
 * Lightweight cross-page mutation notification.
 *
 * Sets a localStorage marker and dispatches a custom DOM event so that
 * other pages (Dashboard, Reports, etc.) know to re-fetch stale data.
 */

export const STORAGE_KEY = "finance:last-transaction-change";
export const EVENT_NAME = "finance:transaction-changed";

/** Call after any successful transaction create / update / delete. */
export function notifyTransactionMutation() {
  const now = Date.now();
  try {
    localStorage.setItem(STORAGE_KEY, now.toString());
  } catch {
    // localStorage unavailable – event alone will suffice for same-tab
  }
  window.dispatchEvent(new CustomEvent(EVENT_NAME));
}

/**
 * Subscribe to transaction mutation changes across pages/tabs.
 * Returns an unsubscribe cleanup function.
 */
export function subscribeToTransactionMutation(onMutation: () => void) {
  if (typeof window === "undefined") return () => undefined;

  let hydratedAt = Date.now();

  const maybeRefresh = () => {
    const marker = Number(localStorage.getItem(STORAGE_KEY) || "0");
    if (marker > hydratedAt) {
      hydratedAt = Date.now();
      onMutation();
    }
  };

  const onEvent = () => maybeRefresh();
  const onFocus = () => maybeRefresh();
  const onVisibility = () => {
    if (document.visibilityState === "visible") maybeRefresh();
  };

  window.addEventListener(EVENT_NAME, onEvent);
  window.addEventListener("focus", onFocus);
  document.addEventListener("visibilitychange", onVisibility);

  return () => {
    window.removeEventListener(EVENT_NAME, onEvent);
    window.removeEventListener("focus", onFocus);
    document.removeEventListener("visibilitychange", onVisibility);
  };
}
