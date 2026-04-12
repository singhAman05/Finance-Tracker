import redisClient, { getRedisReady } from '../config/redisClient';
import { CACHE_TTL } from '../types';
import { logger } from './logger';

type JsonValue = unknown;

export const CacheKey = {
  accounts: (clientId: string, page: number, limit: number) => `accounts:${clientId}:${page}:${limit}`,
  transactions: (clientId: string, page: number, limit: number) => `transactions:${clientId}:${page}:${limit}`,
  budgets: (clientId: string, page: number, limit: number) => `budgets:${clientId}:${page}:${limit}`,
  budgetSummary: (clientId: string) => `budgets:summary:${clientId}`,
  bills: (clientId: string, page: number, limit: number) => `bills:${clientId}:${page}:${limit}`,
  billInstances: (clientId: string, page: number, limit: number) => `bill_instances:${clientId}:${page}:${limit}`,
  prefix: {
    accounts: (clientId: string) => `accounts:${clientId}:`,
    transactions: (clientId: string) => `transactions:${clientId}:`,
    budgets: (clientId: string) => `budgets:${clientId}:`,
    bills: (clientId: string) => `bills:${clientId}:`,
    billInstances: (clientId: string) => `bill_instances:${clientId}:`,
  },
};

function canUseRedis() {
  return getRedisReady();
}

export async function getCache<T = JsonValue>(key: string): Promise<T | null> {
  if (!canUseRedis()) return null;
  try {
    const data = await redisClient.get(key);
    return data ? (JSON.parse(data) as T) : null;
  } catch (err) {
    logger.warn('Redis GET failed', { key, error: err instanceof Error ? err.message : String(err) });
    return null;
  }
}

export async function setCache(key: string, value: JsonValue, ttlSeconds: number = CACHE_TTL.long): Promise<void> {
  if (!canUseRedis()) return;
  try {
    await redisClient.set(key, JSON.stringify(value), { EX: ttlSeconds });
  } catch (err) {
    logger.warn('Redis SET failed', { key, error: err instanceof Error ? err.message : String(err) });
  }
}

export async function deleteCache(key: string): Promise<void> {
  if (!canUseRedis()) return;
  try {
    await redisClient.del(key);
  } catch (err) {
    logger.warn('Redis DEL failed', { key, error: err instanceof Error ? err.message : String(err) });
  }
}

export async function deleteCacheByPrefix(prefix: string): Promise<void> {
  if (!canUseRedis()) return;
  try {
    const keysToDelete: string[] = [];
    for await (const key of redisClient.scanIterator({ MATCH: `${prefix}*`, COUNT: 200 })) {
      keysToDelete.push(String(key));
    }
    if (keysToDelete.length > 0) {
      await redisClient.del(keysToDelete);
    }
  } catch (err) {
    logger.warn('Redis DEL by prefix failed', { prefix, error: err instanceof Error ? err.message : String(err) });
  }
}

export async function invalidateTransactions(clientId: string) {
  await deleteCacheByPrefix(CacheKey.prefix.transactions(clientId));
  await deleteCache(CacheKey.budgetSummary(clientId));
}

export async function invalidateAccounts(clientId: string) {
  await deleteCacheByPrefix(CacheKey.prefix.accounts(clientId));
}

export async function invalidateBudgets(clientId: string) {
  await deleteCacheByPrefix(CacheKey.prefix.budgets(clientId));
  await deleteCache(CacheKey.budgetSummary(clientId));
}

export async function invalidateBills(clientId: string) {
  await deleteCacheByPrefix(CacheKey.prefix.bills(clientId));
}

export async function invalidateBillInstances(clientId: string) {
  await deleteCacheByPrefix(CacheKey.prefix.billInstances(clientId));
}

export async function invalidateBillPayment(clientId: string) {
  await invalidateBillInstances(clientId);
  await invalidateTransactions(clientId);
  await invalidateAccounts(clientId);
}

export async function invalidateClearHistory(clientId: string) {
  await invalidateTransactions(clientId);
  await invalidateAccounts(clientId);
  await invalidateBills(clientId);
  await invalidateBillInstances(clientId);
  await invalidateBudgets(clientId);
}
