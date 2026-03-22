import { apiClient } from "@/utils/Error_handler";

interface SettingsResponse {
  message: string;
  data: {
    currency: string;
    date_format: string;
    [key: string]: unknown;
  };
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
