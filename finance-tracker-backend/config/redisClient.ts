import { createClient } from 'redis';
import dotenv from 'dotenv';
import { logger } from '../utils/logger';
import { appConfig } from './appConfig';

dotenv.config();

const redisUrl = process.env.REDIS_URL;
const redisConfig = appConfig.redis;
const redisClient = createClient(
  redisUrl
    ? { url: redisUrl }
    : {
        socket: {
          reconnectStrategy(retries: number) {
            if (retries >= redisConfig.reconnectMaxRetries) {
              logger.error('Redis reconnect retries exhausted', { retries });
              return false;
            }
            return Math.min(redisConfig.reconnectBaseDelayMs * 2 ** retries, redisConfig.reconnectMaxDelayMs);
          },
        },
      }
);

let isRedisReady = false;

redisClient.on('ready', () => {
  isRedisReady = true;
  logger.info('Redis ready');
});

redisClient.on('end', () => {
  isRedisReady = false;
  logger.warn('Redis connection ended');
});

redisClient.on('error', (err) => {
  isRedisReady = false;
  logger.error('Redis error', { error: err instanceof Error ? err.message : String(err) });
});

export async function connectRedis() {
  try {
    await redisClient.connect();
  } catch (err) {
    logger.warn('Redis unavailable, continuing without cache', {
      error: err instanceof Error ? err.message : String(err),
    });
  }
}

export function getRedisReady() {
  return isRedisReady;
}

export default redisClient;
