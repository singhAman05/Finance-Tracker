import { apiClient, baseUrl } from "@/utils/Error_handler";

export const createAccountRoute = async (payload: object) => {
  const token = localStorage.getItem('jwt');
  if (!token) {
    throw new Error('Not authenticated');
  }
  console.log("Payload for createAccountRoute:", payload);
  const res = await fetch(`${baseUrl}/api/accounts/creating-account`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `HTTP ${res.status}`);
  }
  const result = await res.json();
  // console.log("Response from createAccountRoute:", result);
  return result; // { account: { ... } }
};

export const fetchAccountsRoute = async () => {
  const data = await apiClient<any>(
    `/api/accounts/fetch-accounts`,
    {
      method: "GET",
    }
  )
  console.log("Fetched accounts data:", data);
  return data.result
}

export const deleteAccountRoute = async (accountId: string) => {
  const data = await apiClient<any>(
    `/api/accounts/delete-account/${accountId}`,
    {
      method: "DELETE",
    }
  )
  return data.result
}