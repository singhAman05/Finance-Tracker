// src/services/service_account.ts
import { createAccountRoute, fetchAccountsRoute, deleteAccountRoute, processRecurringRoute } from '@/routes/route_accounts';
import { notify } from '@/lib/notifications';

export const createAccount = async (data: object) => {
  const account = await createAccountRoute(data);
  console.log("Created account in service:", account);
  notify.success(account.message || "Account created successfully");
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

export const fetchAccounts = async () => {
  try {
    const result = await fetchAccountsRoute();
    if (result.data.length > 0) {
      result.data = result.data.map((acc: any) => ({
        id: acc.id,
        name: `${acc.account_holder_name} Account`,
        type: acc.account_type,
        balance: acc.balance,
        lastDigits: acc.account_number_last4,
        bank: acc.bank_name,
        currency: acc.currency,
        status: acc.status,
        // Recurring fields
        is_recurring: acc.is_recurring ?? false,
        recurring_amount: acc.recurring_amount ?? null,
        recurring_type: acc.recurring_type ?? null,
        recurring_frequency: acc.recurring_frequency ?? null,
        recurring_day_of_month: acc.recurring_day_of_month ?? null,
        recurring_description: acc.recurring_description ?? null,
        recurring_last_posted: acc.recurring_last_posted ?? null,
      }))
    }
    return result;
  } catch (error) {
    console.error("Failed to fetch accounts:", error);
    throw error;
  }
};

export const processRecurringAccounts = async () => {
  try {
    const result = await processRecurringRoute();
    return result;
  } catch (error) {
    console.error("Failed to process recurring accounts:", error);
    throw error;
  }
};


export const deleteAccount = async (accountId: string) => {
  try {
    const result = await deleteAccountRoute(accountId);
    console.log("Deleted account in service:", result);
    notify.success(result.message || "Account deleted successfully");
    return result;
  }
  catch (error) {
    console.error("Failed to delete account:", error);
    throw error;
  }
}