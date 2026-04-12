import { Request, Response } from 'express';
import {
  creatingAccount,
  fetchAllaccounts,
  deleteAccount,
  processRecurringAccounts,
  fetchRecurringAccounts,
} from '../services/service_accounts';
import { validateAccount, validateAccountDetails } from '../utils/validationUtils';
import {
  getCache,
  setCache,
  CacheKey,
  invalidateAccounts,
  invalidateTransactions,
} from '../utils/cacheUtils';
import { parsePagination, buildPaginationMeta } from '../utils/paginationUtils';
import { asyncHandler } from '../utils/asyncHandler';
import { AppError } from '../utils/AppError';
import { getUser } from '../middleware/jwt';
import { CACHE_TTL } from '../types';

export const handleAccountCreation = asyncHandler(async (req: Request, res: Response) => {
  const user = getUser(req);
  const {
    bank_name,
    account_type,
    balance,
    currency,
    account_holder_name,
    account_number_last4,
    is_recurring,
    recurring_amount,
    recurring_type,
    recurring_category_id,
    recurring_day_of_month,
    recurring_frequency,
    recurring_description,
  } = req.body as Record<string, unknown>;

  if (typeof account_holder_name !== 'string' || account_holder_name.trim() === '') {
    throw AppError.validation('account_holder_name is required');
  }

  const validAccount = validateAccount(bank_name, account_type);
  const details = validateAccountDetails(balance, currency, account_number_last4);

  const result = await creatingAccount({
    client_id: user.id,
    bank_name: validAccount.name,
    account_type: validAccount.type,
    balance: details.balance,
    currency: details.currency,
    account_holder_name: account_holder_name.trim(),
    account_number_last4: details.accountNumberLast4,
    is_recurring,
    recurring_amount,
    recurring_type,
    recurring_category_id,
    recurring_day_of_month,
    recurring_frequency,
    recurring_description,
  });

  if (result.error || !result.data) {
    throw AppError.internal('Failed to create account', result.error);
  }

  await invalidateAccounts(user.id);

  res.status(201).json({
    success: true,
    message: 'Account added successfully',
    data: result.data,
  });
});

export const handleAccountFetch = asyncHandler(async (req: Request, res: Response) => {
  const user = getUser(req);
  const { page, limit, from, to } = parsePagination(req);
  const cacheKey = CacheKey.accounts(user.id, page, limit);

  const cached = await getCache(cacheKey);
  if (cached) {
    res.status(200).json({ success: true, message: 'Accounts from cache', ...(cached as object) });
    return;
  }

  const result = await fetchAllaccounts(user.id, { from, to });
  if (result.error) {
    throw AppError.internal('Failed to fetch accounts', result.error);
  }

  const responseBody = {
    data: result.data ?? [],
    pagination: buildPaginationMeta(page, limit, result.count),
  };

  await setCache(cacheKey, responseBody, CACHE_TTL.long);

  res.status(200).json({ success: true, message: 'Accounts fetched', ...responseBody });
});

export const handleAccountDeletion = asyncHandler(async (req: Request, res: Response) => {
  const user = getUser(req);
  const { account_id } = req.params;

  const result = await deleteAccount(account_id, user.id);
  if (result.error) {
    throw AppError.notFound('Account not found or unauthorized');
  }

  await invalidateAccounts(user.id);
  await invalidateTransactions(user.id);

  res.status(200).json({
    success: true,
    message: 'Account deleted successfully',
    data: { account_id },
  });
});

export const handleProcessRecurring = asyncHandler(async (req: Request, res: Response) => {
  const user = getUser(req);
  const result = await processRecurringAccounts(user.id);

  await invalidateAccounts(user.id);
  await invalidateTransactions(user.id);

  res.status(200).json({
    success: true,
    message: 'Recurring accounts processed',
    processed: result.processed,
  });
});

export const handleFetchRecurring = asyncHandler(async (req: Request, res: Response) => {
  const user = getUser(req);
  const result = await fetchRecurringAccounts(user.id);
  if (result.error) {
    throw AppError.internal('Failed to fetch recurring accounts', result.error);
  }

  res.status(200).json({
    success: true,
    message: 'Recurring accounts fetched',
    data: result.data ?? [],
  });
});
