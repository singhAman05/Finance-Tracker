// src/services/service_account.ts
import { createAccountRoute, fetchAccountsRoute } from '@/routes/route_accounts';

export const createAccount = async (data: object) => {
  const account = await createAccountRoute(data);
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
    // You can preprocess it here if needed
    return result.map((acc: any) => ({
      id: acc.id,
      name: `${acc.account_holder_name} Account`,
      type: acc.account_type,
      balance: acc.balance,
      lastDigits: acc.account_number_last4,
      bank: acc.bank_name,
      status: acc.status,
    }));
  } catch (error) {
    console.error("Failed to fetch accounts:", error);
    throw error;
  }
};
