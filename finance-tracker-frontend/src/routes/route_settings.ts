import { apiClient } from "@/utils/Error_handler";
import type { ClientSettings } from "@/service/service_settings";

interface SettingsResponse {
  message: string;
  data: ClientSettings;
}

export const fetchSettingsRoute = async () => {
  const data = await apiClient<SettingsResponse>("/api/settings", {
    method: "GET",
  });
  if (data.error) throw new Error(data.error.message);
  return data.result;
};

export const updateSettingsRoute = async (payload: Record<string, unknown>) => {
  const data = await apiClient<SettingsResponse>("/api/settings", {
    method: "PUT",
    body: JSON.stringify(payload),
  });
  if (data.error) throw new Error(data.error.message);
  return data.result;
};
