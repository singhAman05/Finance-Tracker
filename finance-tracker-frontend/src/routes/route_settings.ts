import { apiClient } from "@/utils/Error_handler";
import type { ClientSettings } from "@/service/service_settings";

interface SettingsResponse {
  message: string;
  data: ClientSettings;
}

interface ExportDataResponse {
  message: string;
  data: Record<string, unknown>;
}

interface ClearHistoryResponse {
  message: string;
  data: {
    deleted: {
      transactions: number;
      bills: number;
      bill_instances: number;
    };
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

export const exportDataRoute = async () => {
  const data = await apiClient<ExportDataResponse>("/api/settings/export", {
    method: "GET",
  });
  if (data.error) throw new Error(data.error.message);
  return data.result;
};

export const clearHistoryRoute = async () => {
  const data = await apiClient<ClearHistoryResponse>("/api/settings/history", {
    method: "DELETE",
  });
  if (data.error) throw new Error(data.error.message);
  return data.result;
};
