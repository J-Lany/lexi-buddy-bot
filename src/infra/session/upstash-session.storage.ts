import { Redis } from "@upstash/redis";
import type { StorageAdapter } from "grammy";

import { env } from "../../config/env.js";
import type { SessionData } from "../../transport/telegram/session.js";

const redis = new Redis({
  url: env.upstashRedisRestUrl,
  token: env.upstashRedisRestToken,
});

const PREFIX = `${env.nodeEnv}:bot:session:`;
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 30;

export const upstashSessionStorage: StorageAdapter<SessionData> = {
  async read(key) {
    const redisKey = `${PREFIX}${key}`;
    const value = await redis.get<SessionData | null>(redisKey);

    if (value == null) return undefined;

    if (typeof value !== "object" || Array.isArray(value)) {
      await redis.del(redisKey);
      return undefined;
    }

    return value;
  },

  async write(key, value) {
    await redis.set(`${PREFIX}${key}`, value, {
      ex: SESSION_TTL_SECONDS,
    });
  },

  async delete(key) {
    await redis.del(`${PREFIX}${key}`);
  },
};
