import type { Bot } from "grammy";
import type { BotContext } from "../context.js";
import { logError } from "../../../observability/logger.js";
import { SessionWriteError } from "../../../infra/session/session-write-error.js";

export function setupErrorHandler(bot: Bot<BotContext>) {
  bot.catch((err) => {
    const isSessionWriteFailure = err.error instanceof SessionWriteError;

    logError("bot_middleware_error", err.error, {
      telegram_user_id: err.ctx?.from?.id ?? null,
      update_id: err.ctx?.update.update_id ?? null,
      chat_id: err.ctx?.chat?.id ?? null,
      error_kind: isSessionWriteFailure ? "session_write" : "handler",
    });

    if (isSessionWriteFailure) {
      // The handler already ran and replied successfully — the session
      // just failed to persist afterwards. Sending error-generic here would
      // be a confusing second message for something the user already got a
      // correct response to.
      return;
    }

    const ctx = err.ctx;
    if (!ctx) return;

    void ctx.reply(ctx.t("error-generic"), { parse_mode: "HTML" }).catch(() => {
      // User may have blocked the bot or context doesn't support reply
    });
  });
}
