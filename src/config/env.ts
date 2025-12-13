import { config } from "dotenv";
import path from "node:path";

config({ path: path.resolve(process.cwd(), ".env") });

function mustGet(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env: ${name}`);
  return v;
}

export const env = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  port: Number(process.env.PORT ?? 8080),

  telegramBotToken: mustGet("TELEGRAM_BOT_TOKEN"),
  backendBaseUrl: mustGet("BACKEND_BASE_URL"),
  internalPort: Number(process.env.PORT ?? 8080),
  telegramBotInternalToken: process.env.TELEGRAM_BOT_INTERNAL_TOKEN ?? null,
};
