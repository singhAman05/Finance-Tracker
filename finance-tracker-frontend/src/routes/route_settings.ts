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
  const res = await apiClient<SettingsResponse>("/api/settings", {
    method: "GET",
  });
  if (res.error) throw new Error(res.error.message);
  return res.result;
};

export const updateSettingsRoute = async (payload: Record<string, unknown>) => {
  const res = await apiClient<SettingsResponse>("/api/settings", {
    method: "PUT",
    body: JSON.stringify(payload),
  });
  if (res.error) throw new Error(res.error.message);
  return res.result;
};

export const exportDataRoute = async () => {
  const res = await apiClient<ExportDataResponse>("/api/settings/export", {
    method: "GET",
  });
  if (res.error) throw new Error(res.error.message);
  return res.result;
};

export const clearHistoryRoute = async () => {
  const res = await apiClient<ClearHistoryResponse>("/api/settings/history", {
    method: "DELETE",
  });
  if (res.error) throw new Error(res.error.message);
  return res.result;
};
