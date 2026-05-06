import { Request, Response } from 'express';
import {
  createBill,
  fetchBills,
  fetchBillInstances,
  markBillInstanceAsPaid,
} from '../services/service_bills';
import {
  CacheKey,
  getCache,
  setCache,
  invalidateBills,
  invalidateBillInstances,
  invalidateBillPayment,
} from '../utils/cacheUtils';
import { parsePagination, buildPaginationMeta } from '../utils/paginationUtils';
import { asyncHandler } from '../utils/asyncHandler';
import { getUser } from '../middleware/jwt';
import { validateBillPayload, validateUUID } from '../utils/validationUtils';
import { AppError } from '../utils/AppError';
import { CACHE_TTL } from '../types';
import { getAccountStatus } from '../services/service_accounts';

export const handleBillCreation = asyncHandler(async (req: Request, res: Response) => {
  const user = getUser(req);
  const valid = validateBillPayload(req.body);

  const {
    account_id,
    is_recurring,
    recurrence_type,
    recurrence_interval,
    end_date,
    reminder_days_before,
    notes,
  } = req.body as Record<string, unknown>;

  const bill = await createBill({
    client_id: user.id,
    account_id: typeof account_id === 'string' ? account_id : undefined,
    system_category_id: valid.system_category_id,
    name: valid.name,
    amount: valid.amount,
    is_recurring: Boolean(is_recurring),
    recurrence_type: typeof recurrence_type === 'string' ? (recurrence_type as 'weekly' | 'monthly' | 'quarterly' | 'yearly') : undefined,
    recurrence_interval: Number.isFinite(Number(recurrence_interval)) ? Number(recurrence_interval) : undefined,
    start_date: valid.start_date,
    end_date: typeof end_date === 'string' ? end_date : undefined,
    reminder_days_before: Number.isFinite(Number(reminder_days_before)) ? Number(reminder_days_before) : undefined,
    notes: typeof notes === 'string' ? notes : undefined,
  });

  await invalidateBills(user.id);
  await invalidateBillInstances(user.id);

  res.status(201).json({ success: true, message: 'Bill created successfully', data: bill });
});

export const handleBillsFetch = asyncHandler(async (req: Request, res: Response) => {
  const user = getUser(req);
  const { page, limit, from, to } = parsePagination(req);
  const cacheKey = CacheKey.bills(user.id, page, limit);

  const cached = await getCache(cacheKey);
  if (cached) {
    res.status(200).json({ success: true, message: 'Bills from cache', ...(cached as object) });
    return;
  }

  const result = await fetchBills(user.id, { from, to });

  const responseBody = {
    data: result.data,
    pagination: buildPaginationMeta(page, limit, result.count),
  };

  await setCache(cacheKey, responseBody, CACHE_TTL.bills);

  res.status(200).json({ success: true, message: 'Bills fetched', ...responseBody });
});

export const handleBillInstancesFetch = asyncHandler(async (req: Request, res: Response) => {
  const user = getUser(req);
  const { page, limit, from, to } = parsePagination(req);
  const cacheKey = CacheKey.billInstances(user.id, page, limit);

  const cached = await getCache(cacheKey);
  if (cached) {
    res.status(200).json({ success: true, message: 'Bill instances from cache', ...(cached as object) });
    return;
  }

  const result = await fetchBillInstances(user.id, { from, to });

  const responseBody = {
    data: result.data,
    pagination: buildPaginationMeta(page, limit, result.count),
  };

  await setCache(cacheKey, responseBody, CACHE_TTL.billInstances);

  res.status(200).json({ success: true, message: 'Bill instances fetched', ...responseBody });
});

export const handleBillInstancePayment = asyncHandler(async (req: Request, res: Response) => {
  const user = getUser(req);
  const bill_instance_id = validateUUID(req.params.bill_instance_id, 'Bill instance ID');

  // Check if the bill's linked account is inactive
  const { account_id } = req.body as Record<string, unknown>;
  if (typeof account_id === 'string' && account_id) {
    const { status: accountStatus } = await getAccountStatus(account_id, user.id);
    if (accountStatus === 'inactive') {
      throw AppError.validation('Cannot pay bill from an inactive account. Please activate the account first.');
    }
  }

  await markBillInstanceAsPaid(bill_instance_id, user.id);
  await invalidateBillPayment(user.id);

  res.status(200).json({
    success: true,
    message: 'Bill marked as paid successfully',
    data: { bill_instance_id },
  });
});
