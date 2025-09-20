import redisClient from '../config/redisClient';

export const getCache = async (key: string) => {
    try {
        const data = await redisClient.get(key);
        return data ? JSON.parse(data) : null;
    } catch (err) {
        console.error('Redis GET error:', err);
        return null;
    }
};

export const setCache = async (key: string, value: any, ttlSeconds = 3600) => {
    try {
        await redisClient.set(key, JSON.stringify(value), {
        EX: ttlSeconds,
        });
    } catch (err) {
        console.error('Redis SET error:', err);
    }
};

export const deleteCache = async (key: string) => {
    try {
        await redisClient.del(key);
    } catch (err) {
        console.error('Redis DEL error:', err);
    }
};
