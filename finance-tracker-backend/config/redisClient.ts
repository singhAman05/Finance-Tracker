// config/redisClient.ts
import { createClient } from 'redis';
import dotenv from 'dotenv';
dotenv.config();

const redisClient = createClient({
    url: process.env.REDIS_URL
});

redisClient.on('error', (err) => {
    console.error('Redis error:', err);
});

// --- #19: Graceful Redis connection with retry ---
let isRedisReady = false;

async function connectRedis(retries = 3, delayMs = 2000) {
    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            await redisClient.connect();
            isRedisReady = true;
            console.log('Redis connected successfully');
            return;
        } catch (err) {
            console.error(`Redis connection attempt ${attempt}/${retries} failed:`, err);
            if (attempt < retries) {
                await new Promise(resolve => setTimeout(resolve, delayMs));
            }
        }
    }
    console.error('Redis failed to connect after all retries. Cache operations will be skipped.');
}

// Non-blocking — server starts even if Redis fails
connectRedis();

redisClient.on('ready', () => { isRedisReady = true; });
redisClient.on('end', () => { isRedisReady = false; });

export { isRedisReady };
export default redisClient;
