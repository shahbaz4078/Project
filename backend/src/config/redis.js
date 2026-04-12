import Redis from 'ioredis';
import { env } from './env.js';

let client;

export function getRedis() {
  if (!client) {
    client = new Redis(env.redisUrl, {
      maxRetriesPerRequest: 3,
      lazyConnect: true,
    });
  }
  return client;
}

export async function redisReady() {
  const r = getRedis();
  await r.connect().catch(() => {});
  return r;
}
