import type { Bot, MiddlewareFn } from "grammy";
import type { BotContext } from "../context.js";
import { logWarn } from "../../../observability/logger.js";

const WINDOW_MS = 10_000;
const MAX_UPDATES = 20;

const timestamps = new Map<number, number[]>();

// Evict entries for users who haven't been active in a while to prevent memory growth
setInterval(() => {
  const cutoff = Date.now() - WINDOW_MS;
  for (const [userId, times] of timestamps) {
    const last = times[times.length - 1];
    if (last !== undefined && last < cutoff) timestamps.delete(userId);
  }
}, 60_000).unref();

export function rateLimitMiddleware(): MiddlewareFn<BotContext> {
  return async (ctx, next) => {
    const userId = ctx.from?.id;
    if (!userId) return next();

    const now = Date.now();
    const cutoff = now - WINDOW_MS;

    const times = (timestamps.get(userId) ?? []).filter((t) => t > cutoff);
    times.push(now);
    timestamps.set(userId, times);

    if (times.length > MAX_UPDATES) {
      logWarn("rate_limit_exceeded", { telegram_user_id: userId });

      if (ctx.callbackQuery) {
        await ctx
          .answerCallbackQuery({ text: ctx.t("error-generic") })
          .catch(() => {});
      }
      return;
    }

    return next();
  };
}

export function setupRateLimitMiddleware(bot: Bot<BotContext>) {
  bot.use(rateLimitMiddleware());
}
