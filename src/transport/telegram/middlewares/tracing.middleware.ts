import type { MiddlewareFn } from "grammy";
import type { BotContext } from "../context.js";
import { logError, logInfo } from "../../../observability/logger.js";
import { runWithRequestContext } from "../../../observability/request-context.js";
import type { UpdateTracker } from "../../../observability/update-tracker.js";

function getUpdateType(update: object): string {
  const key = Object.keys(update).find((k) => k !== "update_id");
  return key ?? "unknown";
}

/**
 * Registered before the session middleware on purpose: session reads go to
 * Upstash and must not be the reason an update never gets logged. userId is
 * seeded as null here (session isn't loaded yet) and corrected later by the
 * existing setRequestUserId() calls in routes, within the same request
 * context.
 */
export function createTracingMiddleware(
  tracker: UpdateTracker,
): MiddlewareFn<BotContext> {
  return async (ctx, next) => {
    return await runWithRequestContext(
      {
        updateId: ctx.update.update_id ?? null,
        telegramUserId: ctx.from?.id ?? null,
        userId: null,
      },
      async () => {
        const updateType = getUpdateType(ctx.update);
        const startedAt = Date.now();
        tracker.recordUpdateReceived();

        logInfo("update_received", {
          update_type: updateType,
          has_text: ctx.msg?.text != null,
          has_callback: ctx.callbackQuery != null,
        });

        try {
          await next();

          logInfo("update_completed", {
            update_type: updateType,
            duration_ms: Date.now() - startedAt,
            success: true,
          });
        } catch (error) {
          logError("update_failed", error, {
            update_type: updateType,
            duration_ms: Date.now() - startedAt,
            success: false,
            error_kind: error instanceof Error ? error.name : "unknown",
          });

          throw error;
        } finally {
          tracker.recordUpdateFinished();
        }
      },
    );
  };
}
