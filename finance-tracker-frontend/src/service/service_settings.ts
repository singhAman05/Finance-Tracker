import { notify } from "@/lib/notifications";
import { fetchSettingsRoute, updateSettingsRoute } from "@/routes/route_settings";

export interface ClientSettings {
  currency: string;
  date_format: string;
  notify_bills: boolean;
  notify_budgets: boolean;
  notify_recurring: boolean;
}

export const fetchSettings = async () => {
    try {
        const result = await fetchSettingsRoute();
        return result;
    } catch (error) {
        console.error("Failed to fetch settings:", error);
        throw error;
    }
};

export const updateSettings = async (payload: Partial<ClientSettings>) => {
    try {
        const result = await updateSettingsRoute(payload);
        notify.success("Settings updated successfully");
        return result;
    } catch (error) {
        console.error("Failed to update settings:", error);
        throw error;
    }
};
