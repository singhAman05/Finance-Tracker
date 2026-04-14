import { Request, Response } from 'express';
import {
  createBudget,
  fetchBudgets,
  deleteBudget,
  updateBudget,
  fetchBudgetSummary,
} from '../services/service_budgets';
import { getCache, setCache, CacheKey, invalidateBudgets } from '../utils/cacheUtils';
import { parsePagination, buildPaginationMeta } from '../utils/paginationUtils';
import { asyncHandler } from '../utils/asyncHandler';
import { getUser } from '../middleware/jwt';
import { AppError } from '../utils/AppError';
import { CACHE_TTL } from '../types';

const allowedPeriods = ['weekly', 'monthly', 'quarterly', 'yearly', 'custom'];

export const handleBudgetCreation = asyncHandler(async (req: Request, res: Response) => {
  const user = getUser(req);
  const { category_id, name, amount, period_type, start_date, end_date, notes } = req.body as Record<string, unknown>;

  if (!category_id || !period_type || !start_date || !end_date) {
    throw AppError.validation('Missing required fields');
  }

  const parsedAmount = Number(amount);
  if (Number.isNaN(parsedAmount) || parsedAmount <= 0) {
    throw AppError.validation('Invalid amount');
  }

  if (!allowedPeriods.includes(String(period_type))) {
    throw AppError.validation('Invalid period type');
  }

  if (new Date(String(start_date)) >= new Date(String(end_date))) {
    throw AppError.validation('End date must be after start date');
  }

  const result = await createBudget({
    client_id: user.id,
    category_id: String(category_id),
    name: typeof name === 'string' ? name.trim() : undefined,
    amount: parsedAmount,
    period_type: String(period_type) as 'weekly' | 'monthly' | 'quarterly' | 'yearly' | 'custom',
    start_date: String(start_date),
    end_date: String(end_date),
    notes: typeof notes === 'string' ? notes.trim() : undefined,
  });

  if (result.error?.message?.includes('exclusion')) {
    throw AppError.validation('Budget overlaps with an existing budget for this category');
  }
  if (result.error || !result.data) {
    throw AppError.internal('Failed to create budget', result.error);
  }

  await invalidateBudgets(user.id);

  res.status(201).json({ success: true, message: 'Budget created successfully', data: result.data });
});

export const handleBudgetFetch = asyncHandler(async (req: Request, res: Response) => {
  const user = getUser(req);
  const { page, limit, from, to } = parsePagination(req);
  const cacheKey = CacheKey.budgets(user.id, page, limit);

  const cached = await getCache(cacheKey);
  if (cached) {
    res.status(200).json({ success: true, message: 'Budgets from cache', ...(cached as object) });
    return;
  }

  const result = await fetchBudgets(user.id, { from, to });
  if (result.error) {
    throw AppError.internal('Failed to fetch budgets', result.error);
  }

  const responseBody = {
    data: result.data ?? [],
    pagination: buildPaginationMeta(page, limit, result.count),
  };

  await setCache(cacheKey, responseBody, CACHE_TTL.long);

  res.status(200).json({ success: true, message: 'Budgets fetched', ...responseBody });
});

export const handleBudgetDeletion = asyncHandler(async (req: Request, res: Response) => {
  const user = getUser(req);
  const { budget_id } = req.params;

  const result = await deleteBudget(budget_id, user.id);
  if (result.error) {
    throw AppError.notFound('Budget not found or unauthorized');
  }

  await invalidateBudgets(user.id);

  res.status(200).json({
    success: true,
    message: 'Budget deleted successfully',
    data: { budget_id },
  });
});

export const handleBudgetUpdate = asyncHandler(async (req: Request, res: Response) => {
  const user = getUser(req);
  const { budget_id } = req.params;

  const existing = await fetchBudgets(user.id);
  const budget = existing.data?.find((b: { id: string; is_active: boolean }) => b.id === budget_id);
  if (budget && budget.is_active === false) {
    throw AppError.validation('Cannot update an expired budget');
  }

  const { amount, period_type, start_date, end_date, notes, name } = req.body as Record<string, unknown>;
  const safeUpdates: Record<string, unknown> = {};
  if (amount !== undefined) safeUpdates.amount = amount;
  if (period_type !== undefined) safeUpdates.period_type = period_type;
  if (start_date !== undefined) safeUpdates.start_date = start_date;
  if (end_date !== undefined) safeUpdates.end_date = end_date;
  if (notes !== undefined) safeUpdates.notes = notes;
  if (name !== undefined) safeUpdates.name = name;

  const result = await updateBudget(budget_id, user.id, safeUpdates);
  if (result.error || !result.data) {
    throw AppError.notFound('Budget not found or unauthorized');
  }

  await invalidateBudgets(user.id);

  res.status(200).json({ success: true, message: 'Budget updated successfully', data: result.data });
});

export const handleBudgetExpire = asyncHandler(async (req: Request, res: Response) => {
  const user = getUser(req);
  const { budget_id } = req.params;

  const updates = { end_date: new Date().toISOString().split('T')[0], is_active: false };
  const result = await updateBudget(budget_id, user.id, updates);

  if (result.error || !result.data) {
    throw AppError.notFound('Budget not found or unauthorized');
  }

  await invalidateBudgets(user.id);

  res.status(200).json({ success: true, message: 'Budget ended early', data: result.data });
});

export const handleBudgetSummary = asyncHandler(async (req: Request, res: Response) => {
  const user = getUser(req);
  const cacheKey = CacheKey.budgetSummary(user.id);

  const cached = await getCache(cacheKey);
  if (cached) {
    res.status(200).json({ success: true, message: 'Budget summary from cache', data: cached });
    return;
  }

  const result = await fetchBudgetSummary(user.id);
  if (result.error) {
    throw AppError.internal('Failed to fetch budget summary', result.error);
  }

  await setCache(cacheKey, result.data ?? [], CACHE_TTL.medium);

  res.status(200).json({ success: true, message: 'Budget summary fetched', data: result.data ?? [] });
});
