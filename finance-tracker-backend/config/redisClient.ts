// config/redisClient.ts
import { createClient } from 'redis';
import dotenv from 'dotenv';
dotenv.config();

const redisClient = createClient({
    url: `redis://default:8cpOO6Mq1gF0o7fqdQUaOVCXzl6f3yLN@redis-11049.crce206.ap-south-1-1.ec2.cloud.redislabs.com:11049`
});

redisClient.on('error', (err) => {
    console.error('Redis error:', err);
});

redisClient.connect();

export default redisClient;
