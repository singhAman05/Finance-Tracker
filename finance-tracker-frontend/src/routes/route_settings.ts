import { apiClient } from "@/utils/Error_handler";

export const fetchSettingsRoute = async () => {
  const data = await apiClient<any>(
    `/api/settings`,
    {
      method: "GET",
    }
  );
  return data.result;
};

export const updateSettingsRoute = async (payload: any) => {
  const data = await apiClient<any>(
    `/api/settings`,
    {
      method: "PUT",
      body: JSON.stringify(payload)
    }
  );
  return data.result;
};
