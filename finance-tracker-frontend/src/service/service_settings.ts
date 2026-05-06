import { notify } from "@/lib/notifications";
import { clearHistoryRoute, exportDataRoute, fetchSettingsRoute, updateSettingsRoute } from "@/routes/route_settings";

export interface ClientSettings {
  currency: string;
  date_format: string;
  notify_bills: boolean;
  notify_budgets: boolean;
  notify_recurring: boolean;
}

export const fetchSettings = async () => {
    const result = await fetchSettingsRoute();
    return result;
};

export const updateSettings = async (payload: Partial<ClientSettings>) => {
    const result = await updateSettingsRoute(payload);
    notify.success("Settings updated successfully");
    return result;
};

export const exportAllData = async () => {
    const result = await exportDataRoute();
    return result;
};

export const clearHistory = async () => {
    const result = await clearHistoryRoute();
    notify.success("History cleared successfully");
    return result;
};
