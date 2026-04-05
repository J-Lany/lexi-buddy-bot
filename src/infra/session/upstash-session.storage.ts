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
    const raw = await redis.get<string>(`${PREFIX}${key}`);
    if (!raw) return undefined;

    return JSON.parse(raw) as SessionData;
  },

  async write(key, value) {
    await redis.set(`${PREFIX}${key}`, JSON.stringify(value), {
      ex: SESSION_TTL_SECONDS,
    });
  },

  async delete(key) {
    await redis.del(`${PREFIX}${key}`);
  },
};
