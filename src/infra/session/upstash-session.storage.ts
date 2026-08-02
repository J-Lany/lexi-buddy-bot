import { Redis } from "@upstash/redis";
import type { StorageAdapter } from "grammy";

import { env } from "../../config/env.js";
import { logError, logWarn } from "../../observability/logger.js";
import { SessionWriteError } from "./session-write-error.js";
import type { SessionData } from "../../transport/telegram/session.js";

const PREFIX = `${env.nodeEnv}:bot:session:`;
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 30;

// Every Telegram update waits on a session read before anything else runs
// (see tracing.middleware.ts), so a slow Upstash call blocks the whole bot.
const SESSION_OPERATION_TIMEOUT_MS = 3_000;
const SESSION_OPERATION_SLOW_THRESHOLD_MS = 300;

function createSessionRedisClient(url: string, token: string): Redis {
  return new Redis({
    url,
    token,
    // Verified against the installed @upstash/redis version (1.37.0,
    // pkg/http.ts request()): the client only rethrows on abort when
    // `signal` is a *function* — it is called fresh before every request,
    // and its abort is propagated as a real error. A static AbortSignal
    // that has already fired is instead swallowed and turned into a fake
    // 200 response carrying the abort reason as `result`, which would
    // silently corrupt a session read. Must stay a function.
    signal: () => AbortSignal.timeout(SESSION_OPERATION_TIMEOUT_MS),
    // Session-client-only: disabled deliberately. The default (5 attempts,
    // exponential backoff up to ~2.7s on the last one) sleeps with a plain
    // setTimeout that does not observe the abort signal, so a timeout that
    // fires mid-backoff can still add several extra seconds before the
    // error actually surfaces. A session read gates every update, so it
    // must fail fast rather than retry silently. Other Redis/backend
    // clients in this project are untouched.
    retry: false,
  });
}

async function timeSessionOperation<T>(
  operation: "read" | "write" | "delete",
  run: () => Promise<T>,
): Promise<T> {
  const startedAt = Date.now();

  try {
    const result = await run();
    const durationMs = Date.now() - startedAt;

    if (durationMs > SESSION_OPERATION_SLOW_THRESHOLD_MS) {
      logWarn("session_operation_slow", {
        operation,
        duration_ms: durationMs,
        success: true,
      });
    }

    return result;
  } catch (error) {
    logError("session_operation_failed", error, {
      operation,
      duration_ms: Date.now() - startedAt,
      success: false,
      error_kind: error instanceof Error ? error.name : "unknown",
    });

    throw error;
  }
}

export function createUpstashSessionStorage(
  redis: Redis = createSessionRedisClient(
    env.upstashRedisRestUrl,
    env.upstashRedisRestToken,
  ),
): StorageAdapter<SessionData> {
  return {
    read(key) {
      return timeSessionOperation("read", async () => {
        const redisKey = `${PREFIX}${key}`;
        const value = await redis.get<SessionData | null>(redisKey);

        if (value == null) return undefined;

        if (typeof value !== "object" || Array.isArray(value)) {
          await redis.del(redisKey);
          return undefined;
        }

        return value;
      });
    },

    write(key, value) {
      // grammY only ever calls write()/delete() from PropertySession.finish()
      // — strictly after the handler already ran and replied (see
      // tracing.middleware.test.ts for the full chain). A failure here must
      // never look like a handler error to the error boundary, so it's
      // re-thrown as a distinct type instead of the raw Upstash error.
      return timeSessionOperation("write", async () => {
        await redis.set(`${PREFIX}${key}`, value, {
          ex: SESSION_TTL_SECONDS,
        });
      }).catch((error) => {
        throw new SessionWriteError(error);
      });
    },

    delete(key) {
      return timeSessionOperation("delete", async () => {
        await redis.del(`${PREFIX}${key}`);
      }).catch((error) => {
        throw new SessionWriteError(error);
      });
    },
  };
}

export const upstashSessionStorage = createUpstashSessionStorage();
