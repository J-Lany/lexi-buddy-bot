import type { Bot } from "grammy";
import type { BotContext } from "../context.js";

export function setupErrorHandler(bot: Bot<BotContext>) {
  bot.catch((err) => {
    console.error("[bot.catch] error", {
      error: err.error,
      update: err.ctx?.update,
      chatId: err.ctx?.chat?.id,
      fromId: err.ctx?.from?.id,
      text: err.ctx?.msg?.text,
      callbackData: err.ctx?.callbackQuery?.data,
    });
  });
}
