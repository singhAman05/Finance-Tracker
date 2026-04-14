export const CURRENCY_VALUES = [
  'INR','USD','EUR','GBP','JPY','AUD','CAD','CHF','CNY','SGD','AED','SAR',
] as const;

export const DATE_FORMAT_VALUES = [
  'DD/MM/YYYY','MM/DD/YYYY','YYYY-MM-DD','DD-MM-YYYY','DD.MM.YYYY',
] as const;

export const ACCOUNT_TYPE_VALUES = [
  'savings','current','digital_wallet','loan','credit_card','cash','investment',
] as const;

export const CATEGORY_TYPE_VALUES = ['income', 'expense'] as const;
export const TX_TYPE_VALUES = ['income', 'expense'] as const;
export const RECURRENCE_VALUES = ['weekly', 'bi-weekly', 'monthly', 'quarterly', 'yearly'] as const;
export const BILL_RECURRENCE_VALUES = ['weekly', 'monthly', 'quarterly', 'yearly'] as const;

export const CACHE_TTL = {
  short: 300,
  medium: 900,
  long: 3600,
  bills: 3600,
  billInstances: 1800,
} as const;

export type Currency = typeof CURRENCY_VALUES[number];
export type DateFormat = typeof DATE_FORMAT_VALUES[number];
export type AccountType = typeof ACCOUNT_TYPE_VALUES[number];
export type CategoryType = typeof CATEGORY_TYPE_VALUES[number];
export type TxType = typeof TX_TYPE_VALUES[number];

export type AuthPayload = {
  id: string;
  phone?: string;
  email?: string;
  full_name?: string;
  profile_complete?: boolean;
};
