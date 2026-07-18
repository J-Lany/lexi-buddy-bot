import { config } from "dotenv";
import path from "node:path";

import { resolveWebsiteBaseUrl } from "./website-base-url.js";

config({ path: path.resolve(process.cwd(), ".env") });

function mustGet(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env: ${name}`);
  return v;
}

export const env = {
  nodeEnv: process.env.NODE_ENV ?? "production",
  port: Number(process.env.PORT ?? 80),

  telegramBotToken: mustGet("TELEGRAM_BOT_TOKEN"),
  backendBaseUrl: mustGet("BACKEND_BASE_URL"),
  telegramBotInternalToken: mustGet("TELEGRAM_BOT_INTERNAL_TOKEN"),
  websiteBaseUrl: resolveWebsiteBaseUrl(process.env.WEBSITE_BASE_URL),

  upstashRedisRestUrl: mustGet("UPSTASH_REDIS_REST_URL"),
  upstashRedisRestToken: mustGet("UPSTASH_REDIS_REST_TOKEN"),
};
