import type { Bot } from "grammy";
import type { BotContext } from "../context.js";

export function setupErrorHandler(bot: Bot<BotContext>) {
  bot.catch((err) => {
    console.error("BOT ERROR:", err.error);
  });
}
