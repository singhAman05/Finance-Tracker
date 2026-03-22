import { apiClient } from "@/utils/Error_handler";

interface AccountResponse {
  message: string;
  data: Record<string, unknown>[];
}

interface SingleAccountResponse {
  message: string;
  data: Record<string, unknown>;
}

export const createAccountRoute = async (payload: object) => {
  const data = await apiClient<SingleAccountResponse>("/api/accounts/creating-account", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  if (data.error) throw new Error(data.error.message);
  return data.result;
};

export const fetchAccountsRoute = async () => {
  const data = await apiClient<AccountResponse>("/api/accounts/fetch-accounts", {
    method: "GET",
  });
  if (data.error) throw new Error(data.error.message);
  return data.result;
};

export const deleteAccountRoute = async (accountId: string) => {
  const data = await apiClient<{ message: string }>(`/api/accounts/delete-account/${accountId}`, {
    method: "DELETE",
  });
  if (data.error) throw new Error(data.error.message);
  return data.result;
};

export const processRecurringRoute = async () => {
  const data = await apiClient<{ message: string }>("/api/accounts/process-recurring", {
    method: "POST",
  });
  if (data.error) throw new Error(data.error.message);
  return data.result;
};
