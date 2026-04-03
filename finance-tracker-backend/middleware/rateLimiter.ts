import { Request, Response, NextFunction } from "express";
import { getClientIp } from "../utils/Ip";

/**
 * Token-bucket rate limiter (adapted from user's Rate_limiter project).
 * In-memory — suitable for single-instance deployments.
 * For multi-instance, migrate the bucket store to Redis.
 */

type Bucket = {
    tokens: number;
    lastRefill: number;
};

const pool = new Map<string, Bucket>();

// Clean up stale entries every 10 minutes to prevent memory leaks
setInterval(() => {
    const now = Date.now();
    for (const [key, bucket] of pool) {
        // Remove entries idle for > 30 minutes
        if (now - bucket.lastRefill > 30 * 60 * 1000) {
            pool.delete(key);
        }
    }
}, 10 * 60 * 1000);

function createLimiter(maxTokens: number, refillRatePerSecond: number) {
    return (req: Request, res: Response, next: NextFunction) => {
        const ip = getClientIp(req);
        const currentTime = Date.now();
        let bucket = pool.get(ip);

        if (!bucket) {
            bucket = {
                tokens: maxTokens,
                lastRefill: currentTime,
            };
            pool.set(ip, bucket);
            bucket.tokens -= 1;
            return next();
        }

        const timeElapsed = (currentTime - bucket.lastRefill) / 1000;
        const refill = timeElapsed * refillRatePerSecond;

        bucket.tokens = Math.min(maxTokens, bucket.tokens + refill);
        bucket.lastRefill = currentTime;

        if (bucket.tokens < 1) {
            res.status(429).json({
                success: false,
                message: "Too many requests. Please try again later.",
            });
            return;
        }

        bucket.tokens -= 1;
        next();
    };
}

// Strict limiter for auth endpoints: 10 requests per 15 minutes
// refillRate = 10 / (15 * 60) ≈ 0.011 per second
export const authLimiter = createLimiter(10, 10 / (15 * 60));

// General API limiter: 100 requests per minute
// refillRate = 100 / 60 ≈ 1.67 per second
export const apiLimiter = createLimiter(100, 100 / 60);
