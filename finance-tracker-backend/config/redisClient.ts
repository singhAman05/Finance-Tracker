// config/redisClient.ts
import { createClient } from 'redis';
import dotenv from 'dotenv';
dotenv.config();

const redisClient = createClient({
    url: `redis://default:cMZEXxAFFgbH1Hm4udsshsm01EzkBWoV@redis-13188.crce206.ap-south-1-1.ec2.redns.redis-cloud.com:13188`
});

redisClient.on('error', (err) => {
    console.error('Redis error:', err);
});

redisClient.connect();

export default redisClient;
