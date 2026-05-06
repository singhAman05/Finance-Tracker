import { Request, Response } from 'express';
import { fetchTransactions, createTransaction, deleteTransaction } from '../services/service_transactions';
import { getAccountStatus } from '../services/service_accounts';
import { validateTransactionPayload, validateUUID } from '../utils/validationUtils';
import {
  CacheKey,
  getCache,
  setCache,
  invalidateTransactions,
  invalidateAccounts,
  invalidateBudgets,
} from '../utils/cacheUtils';
import { parsePagination, buildPaginationMeta } from '../utils/paginationUtils';
import { asyncHandler } from '../utils/asyncHandler';
import { getUser } from '../middleware/jwt';
import { AppError } from '../utils/AppError';
import { CACHE_TTL, RECURRENCE_VALUES } from '../types';

export const handleTransactionsAdd = asyncHandler(async (req: Request, res: Response) => {
  const user = getUser(req);
  const { account_id, category_id, amount, type } = validateTransactionPayload(req.body);

  // Block transactions on inactive accounts
  const { status: accountStatus } = await getAccountStatus(account_id, user.id);
  if (accountStatus === 'inactive') {
    throw AppError.validation('Cannot add transactions to an inactive account. Please activate the account first.');
  }

  const {
    date,
    description,
    is_recurring,
    recurrence_rule,
  } = req.body as Record<string, unknown>;

  const payload = {
    client_id: user.id,
    account_id,
    category_id,
    amount,
    type,
    date: typeof date === 'string' && date ? date : new Date().toISOString().split('T')[0],
    description: typeof description === 'string' ? description : undefined,
    is_recurring: typeof is_recurring === 'boolean' ? is_recurring : false,
    recurrence_rule:
      typeof recurrence_rule === 'string' &&
      RECURRENCE_VALUES.includes(recurrence_rule as (typeof RECURRENCE_VALUES)[number])
        ? (recurrence_rule as (typeof RECURRENCE_VALUES)[number])
        : undefined,
  };

  const result = await createTransaction(payload);
  if (result.error || !result.data) {
    throw AppError.internal('Failed to add transaction', result.error);
  }

  await invalidateTransactions(user.id);
  await invalidateAccounts(user.id);
  await invalidateBudgets(user.id);

  res.status(201).json({
    success: true,
    message: 'Transaction added',
    data: result.data,
  });
});

export const handleTransactionsFetch = asyncHandler(async (req: Request, res: Response) => {
  const user = getUser(req);
  const { page, limit, from, to } = parsePagination(req);

  // Optional date-range filters
  const start_date = typeof req.query.start_date === 'string' ? req.query.start_date : undefined;
  const end_date = typeof req.query.end_date === 'string' ? req.query.end_date : undefined;

  const cacheKey = CacheKey.transactions(user.id, page, limit) + (start_date ? `:s${start_date}` : '') + (end_date ? `:e${end_date}` : '');

  const cached = await getCache(cacheKey);
  if (cached) {
    res.status(200).json({ success: true, message: 'Transactions from cache', ...(cached as object) });
    return;
  }

  const result = await fetchTransactions(user.id, { from, to }, { start_date, end_date });
  if (result.error) {
    throw AppError.internal('Failed to fetch transactions', result.error);
  }

  const responseBody = {
    data: result.data ?? [],
    pagination: buildPaginationMeta(page, limit, result.count),
  };

  await setCache(cacheKey, responseBody, CACHE_TTL.long);

  res.status(200).json({ success: true, message: 'Transactions fetched', ...responseBody });
});

export const handleTransactionDelete = asyncHandler(async (req: Request, res: Response) => {
  const user = getUser(req);
  const transaction_id = validateUUID(req.params.transaction_id, 'Transaction ID');

  const result = await deleteTransaction(transaction_id, user.id);
  if (result.error) {
    throw AppError.notFound('Transaction not found or unauthorized');
  }

  await invalidateTransactions(user.id);
  await invalidateAccounts(user.id);
  await invalidateBudgets(user.id);

  res.status(200).json({
    success: true,
    message: 'Transaction deleted successfully',
    data: { transaction_id },
  });
});
