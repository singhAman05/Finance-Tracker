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
  const res = await apiClient<SingleAccountResponse>("/api/accounts/creating-account", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  if (res.error) throw new Error(res.error.message);
  return res.result;
};

export const fetchAccountsRoute = async () => {
  const res = await apiClient<AccountResponse>("/api/accounts/fetch-accounts", {
    method: "GET",
  });
  if (res.error) throw new Error(res.error.message);
  return res.result;
};

export const deleteAccountRoute = async (accountId: string) => {
  const res = await apiClient<{ message: string }>(`/api/accounts/delete-account/${accountId}`, {
    method: "DELETE",
  });
  if (res.error) throw new Error(res.error.message);
  return res.result;
};

export const updateAccountRoute = async (accountId: string, payload: object) => {
  const res = await apiClient<SingleAccountResponse>(`/api/accounts/update-account/${accountId}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
  if (res.error) throw new Error(res.error.message);
  return res.result;
};

export const processRecurringRoute = async () => {
  const res = await apiClient<{ message: string }>("/api/accounts/process-recurring", {
    method: "POST",
  });
  if (res.error) throw new Error(res.error.message);
  return res.result;
};
