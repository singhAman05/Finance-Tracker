// src/services/service_account.ts
import { createAccountRoute, fetchAccountsRoute, deleteAccountRoute, processRecurringRoute, updateAccountRoute } from '@/routes/route_accounts';
import { notify } from '@/lib/notifications';

export const createAccount = async (data: object) => {
  const account = await createAccountRoute(data);
  notify.success(account?.message || "Account created successfully");
  return account;
};

export const bankLogos: Record<string, string> = {
  "State Bank of India": "/bank_logos/sbi-state-bank-of-india.svg",
  "HDFC Bank": "/bank_logos/HDFC Bank_id6pGb_xHe_0.svg",
  "ICICI Bank": "/bank_logos/ICICI Bank_idpyGoeREm_0.svg",
  "Axis Bank": "/bank_logos/Axis Bank_idHcfGpT5s_0.svg",
  "Kotak Mahindra Bank": "/bank_logos/Kotak Mahindra Bank_idVNFKKm-u_0.svg",
  "Paytm Payments Bank": "/bank_logos/Paytm_idkzzd2mE4_0.svg",
  "Bank of Baroda": "/bank_logos/Bank of Baroda_ido8WMeX5h_0.svg",
};

export function getBankLogoUrl(bankName: string) {
  return bankLogos[bankName] || "/bank_logos/default-bank.svg";
}

interface MappedAccount {
  id: string;
  name: string;
  type: string;
  balance: number;
  lastDigits: string;
  bank: string;
  bankName: string;
  currency: string;
  status: string;
  is_recurring: boolean;
  recurring_amount: number | null;
  recurring_type: string | null;
  recurring_frequency: string | null;
  recurring_day_of_month: number | null;
  recurring_description: string | null;
  recurring_last_posted: string | null;
}

const toNumber = (value: unknown): number => {
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? n : 0;
};

export const fetchAccounts = async () => {
  const result = await fetchAccountsRoute();
  if (!result || !result.data) return { data: [] as MappedAccount[], message: "" };

  const mappedData: MappedAccount[] = result.data.map((acc) => ({
    id: acc.id as string,
    name: `${acc.account_holder_name} Account`,
    type: acc.account_type as string,
    balance: toNumber(acc.balance),
    lastDigits: acc.account_number_last4 as string,
    bank: acc.bank_name as string,
    bankName: acc.bank_name as string,
    currency: acc.currency as string,
    status: acc.status as string,
    is_recurring: (acc.is_recurring as boolean) ?? false,
    recurring_amount:
      acc.recurring_amount !== null && acc.recurring_amount !== undefined
        ? toNumber(acc.recurring_amount)
        : null,
    recurring_type: (acc.recurring_type as string) ?? null,
    recurring_frequency: (acc.recurring_frequency as string) ?? null,
    recurring_day_of_month:
      acc.recurring_day_of_month !== null && acc.recurring_day_of_month !== undefined
        ? toNumber(acc.recurring_day_of_month)
        : null,
    recurring_description: (acc.recurring_description as string) ?? null,
    recurring_last_posted: (acc.recurring_last_posted as string) ?? null,
  }));

  return { ...result, data: mappedData };
};

export const processRecurringAccounts = async () => {
  const result = await processRecurringRoute();
  return result;
};

export const deleteAccount = async (accountId: string) => {
  const result = await deleteAccountRoute(accountId);
  notify.success(result?.message || "Account deleted successfully");
  return result;
};

export const updateAccount = async (accountId: string, payload: object) => {
  const result = await updateAccountRoute(accountId, payload);
  notify.success(result?.message || "Account updated successfully");
  return result;
};
