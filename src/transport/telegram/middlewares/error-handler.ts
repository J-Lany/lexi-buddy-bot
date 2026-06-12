import type { Bot } from "grammy";
import type { BotContext } from "../context.js";
import { logError } from "../../../observability/logger.js";

export function setupErrorHandler(bot: Bot<BotContext>) {
  bot.catch((err) => {
    logError("bot_middleware_error", err.error, {
      telegram_user_id: err.ctx?.from?.id ?? null,
      update_id: err.ctx?.update.update_id ?? null,
      chat_id: err.ctx?.chat?.id ?? null,
    });

    const ctx = err.ctx;
    if (!ctx) return;

    void ctx.reply(ctx.t("error-generic"), { parse_mode: "HTML" }).catch(() => {
      // User may have blocked the bot or context doesn't support reply
    });
  });
}
