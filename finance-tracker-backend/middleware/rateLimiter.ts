import { Request, Response, NextFunction } from 'express';
import redisClient, { getRedisReady } from '../config/redisClient';
import { getClientIp } from '../utils/Ip';

const memoryStore = new Map<string, number[]>();

const cleanup = setInterval(() => {
  const now = Date.now();
  for (const [key, hits] of memoryStore) {
    const fresh = hits.filter((ts) => now - ts <= 30 * 60 * 1000);
    if (fresh.length === 0) {
      memoryStore.delete(key);
      continue;
    }
    memoryStore.set(key, fresh);
  }
}, 10 * 60 * 1000);
cleanup.unref();

async function consumeRedisWindow(key: string, maxHits: number, windowMs: number): Promise<boolean> {
  const now = Date.now();
  const min = now - windowMs;
  const member = `${now}-${Math.random().toString(36).slice(2)}`;

  await redisClient.zRemRangeByScore(key, 0, min);
  await redisClient.zAdd(key, [{ score: now, value: member }]);
  const count = await redisClient.zCard(key);
  await redisClient.expire(key, Math.ceil(windowMs / 1000) + 5);
  return count <= maxHits;
}

function consumeMemoryWindow(key: string, maxHits: number, windowMs: number): boolean {
  const now = Date.now();
  const hits = memoryStore.get(key) ?? [];
  const fresh = hits.filter((ts) => now - ts <= windowMs);
  fresh.push(now);
  memoryStore.set(key, fresh);
  return fresh.length <= maxHits;
}

function createLimiter(scope: string, maxHits: number, windowMs: number) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const ip = getClientIp(req);
    const key = `rl:${scope}:${ip}`;

    try {
      const allowed = getRedisReady()
        ? await consumeRedisWindow(key, maxHits, windowMs)
        : consumeMemoryWindow(key, maxHits, windowMs);

      if (!allowed) {
        res.status(429).json({ success: false, message: 'Too many requests. Please try again later.' });
        return;
      }

      next();
    } catch {
      // Fail-open to avoid blocking traffic due to limiter infra failures
      next();
    }
  };
}

export const authLimiter = createLimiter('auth', 10, 15 * 60 * 1000);
export const apiLimiter = createLimiter('api', 100, 60 * 1000);
