import { Redis } from 'ioredis';
import { env } from './env.js';

let redis: Redis | null = null;

export function getRedis() {
  if (!env.redisUrl) {
    return null;
  }

  if (!redis) {
    redis = new Redis(env.redisUrl, {
      maxRetriesPerRequest: 2,
      enableReadyCheck: true,
      lazyConnect: true,
    });

    redis.on('error', (error: Error) => {
      console.warn('Redis error:', error.message);
    });
  }

  return redis;
}

export async function connectRedis() {
  const client = getRedis();
  if (!client) {
    console.warn('REDIS_URL is not configured; cache and Redis rate-limit will use fallbacks.');
    return;
  }

  if (client.status === 'wait') {
    await client.connect();
  }

  await client.ping();
}
