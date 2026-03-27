import { env } from "../config/env.js";
import { getRequestContext } from "./request-context.js";

type LogLevel = "info" | "warn" | "error";
type LogFields = Record<string, unknown>;

function serializeError(error: unknown) {
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      stack: error.stack ?? null,
    };
  }

  return {
    message: String(error),
  };
}

function buildPayload(
  level: LogLevel,
  event: string,
  fields: LogFields = {},
  error?: unknown,
) {
  const ctx = getRequestContext();

  const payload: Record<string, unknown> = {
    timestamp: new Date().toISOString(),
    level,
    event,
    env: env.nodeEnv,
    service: "bot",

    telegram_user_id: ctx?.telegramUserId ?? null,
    update_id: ctx?.updateId ?? null,
    request_id: ctx?.requestId ?? null,
    user_id: ctx?.userId ?? null,

    ...fields,
  };

  if (error !== undefined) {
    payload.error = serializeError(error);
  }

  return payload;
}

export function logInfo(event: string, fields: LogFields = {}) {
  console.log(JSON.stringify(buildPayload("info", event, fields)));
}

export function logWarn(event: string, fields: LogFields = {}) {
  console.warn(JSON.stringify(buildPayload("warn", event, fields)));
}

export function logError(
  event: string,
  error: unknown,
  fields: LogFields = {},
) {
  console.error(JSON.stringify(buildPayload("error", event, fields, error)));
}
