import {
  ACCOUNT_TYPE_VALUES,
  BILL_RECURRENCE_VALUES,
  CATEGORY_TYPE_VALUES,
  CURRENCY_VALUES,
  DATE_FORMAT_VALUES,
  RECURRENCE_VALUES,
  TX_TYPE_VALUES,
} from '../types';
import { AppError } from './AppError';

const MAX_AMOUNT = 9_999_999_999; // ~₹999 crore / $10B – practical upper bound

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const asString = (value: unknown, field: string) => {
  if (typeof value !== 'string' || value.trim() === '') {
    throw AppError.validation(`${field} is required`);
  }
  return value.trim();
};

export const validateUUID = (value: unknown, field: string): string => {
  const parsed = asString(value, field);
  if (!UUID_REGEX.test(parsed)) {
    throw AppError.validation(`${field} must be a valid UUID`);
  }
  return parsed;
};

export const validatePhone = (phone: unknown) => {
  const parsed = asString(phone, 'Phone number');
  const phoneRegex = /^\+[1-9]\d{1,14}$/;
  if (!phoneRegex.test(parsed)) {
    throw AppError.validation('Phone number must be in E.164 format (e.g. +1234567890)');
  }
  if (parsed.replace(/\D/g, '').length < 8) {
    throw AppError.validation('Phone number is too short');
  }
  return parsed;
};

export const validateEmail = (email: unknown) => {
  const parsed = asString(email, 'Email');
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(parsed)) {
    throw AppError.validation('Invalid email format');
  }
  return parsed;
};

export const validateAccount = (name: unknown, type: unknown) => {
  const parsedName = asString(name, 'Bank name');
  const parsedType = asString(type, 'Account type');
  if (!ACCOUNT_TYPE_VALUES.includes(parsedType as (typeof ACCOUNT_TYPE_VALUES)[number])) {
    throw AppError.validation(`Account type must be one of: ${ACCOUNT_TYPE_VALUES.join(', ')}`);
  }
  return { name: parsedName, type: parsedType as (typeof ACCOUNT_TYPE_VALUES)[number] };
};

export const validateAccountDetails = (balance: unknown, currency: unknown, accountNumberLast4: unknown) => {
  const parsedBalance = Number(balance);
  if (Number.isNaN(parsedBalance) || parsedBalance < 0) {
    throw AppError.validation('Balance must be a non-negative number');
  }
  if (parsedBalance > MAX_AMOUNT) {
    throw AppError.validation('Balance exceeds maximum allowed (₹999 crore)');
  }

  const parsedCurrency = currency ? String(currency) : 'INR';
  if (!CURRENCY_VALUES.includes(parsedCurrency as (typeof CURRENCY_VALUES)[number])) {
    throw AppError.validation(`Currency must be one of: ${CURRENCY_VALUES.join(', ')}`);
  }

  const last4 = accountNumberLast4 ? String(accountNumberLast4).trim() : '';
  if (last4 && !/^\d{4}$/.test(last4)) {
    throw AppError.validation('Account number last 4 digits must be exactly 4 digits');
  }

  return { balance: parsedBalance, currency: parsedCurrency, accountNumberLast4: last4 };
};

export const validateCategory = (name: unknown, type: unknown) => {
  const parsedName = asString(name, 'Category name');
  const parsedType = asString(type, 'Category type');
  if (!CATEGORY_TYPE_VALUES.includes(parsedType as (typeof CATEGORY_TYPE_VALUES)[number])) {
    throw AppError.validation(`Category type must be one of: ${CATEGORY_TYPE_VALUES.join(', ')}`);
  }
  return { name: parsedName, type: parsedType as (typeof CATEGORY_TYPE_VALUES)[number] };
};

export const validateTransactionPayload = (body: Record<string, unknown>) => {
  const account_id = validateUUID(body.account_id, 'Account ID');
  const category_id = validateUUID(body.category_id, 'Category ID');
  const amount = Number(body.amount);
  const type = asString(body.type, 'Type');

  if (Number.isNaN(amount) || amount <= 0) {
    throw AppError.validation('Amount must be a positive number');
  }
  if (amount > MAX_AMOUNT) {
    throw AppError.validation('Amount exceeds maximum allowed (₹999 crore)');
  }

  if (!TX_TYPE_VALUES.includes(type as (typeof TX_TYPE_VALUES)[number])) {
    throw AppError.validation(`Type must be one of: ${TX_TYPE_VALUES.join(', ')}`);
  }

  if (body.recurrence_rule && !RECURRENCE_VALUES.includes(String(body.recurrence_rule) as (typeof RECURRENCE_VALUES)[number])) {
    throw AppError.validation(`Recurrence rule must be one of: ${RECURRENCE_VALUES.join(', ')}`);
  }

  return { account_id, category_id, amount, type };
};

export const validateSettingsPayload = (input: Record<string, unknown>) => {
  const validated: Record<string, unknown> = {};

  if (input.currency !== undefined) {
    const currency = String(input.currency);
    if (!CURRENCY_VALUES.includes(currency as (typeof CURRENCY_VALUES)[number])) {
      throw AppError.validation(`Invalid currency. Allowed: ${CURRENCY_VALUES.join(', ')}`);
    }
    validated.currency = currency;
  }

  if (input.date_format !== undefined) {
    const dateFormat = String(input.date_format);
    if (!DATE_FORMAT_VALUES.includes(dateFormat as (typeof DATE_FORMAT_VALUES)[number])) {
      throw AppError.validation(`Invalid date format. Allowed: ${DATE_FORMAT_VALUES.join(', ')}`);
    }
    validated.date_format = dateFormat;
  }

  for (const key of ['notify_bills', 'notify_budgets', 'notify_recurring'] as const) {
    if (input[key] !== undefined) {
      if (typeof input[key] !== 'boolean') {
        throw AppError.validation(`${key} must be a boolean`);
      }
      validated[key] = input[key];
    }
  }

  return validated;
};

export const validateBillPayload = (input: Record<string, unknown>) => {
  const system_category_id = validateUUID(input.system_category_id, 'System category id');
  const name = asString(input.name, 'Bill name');
  const amount = Number(input.amount);
  const start_date = asString(input.start_date, 'Start date');

  if (Number.isNaN(amount) || amount <= 0) {
    throw AppError.validation('Amount must be greater than 0');
  }
  if (amount > MAX_AMOUNT) {
    throw AppError.validation('Amount exceeds maximum allowed (₹999 crore)');
  }

  if (input.recurrence_type !== undefined && input.recurrence_type !== null) {
    const recurrenceType = String(input.recurrence_type);
    if (!BILL_RECURRENCE_VALUES.includes(recurrenceType as (typeof BILL_RECURRENCE_VALUES)[number])) {
      throw AppError.validation(`recurrence_type must be one of: ${BILL_RECURRENCE_VALUES.join(', ')}`);
    }
  }

  return { system_category_id, name, amount, start_date };
};
