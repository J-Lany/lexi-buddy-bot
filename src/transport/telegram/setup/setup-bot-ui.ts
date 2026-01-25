import type { Bot } from "grammy";
import type { BotContext } from "../context.js";

export async function setupBotUi(bot: Bot<BotContext>) {
  await bot.api.setMyCommands(
    [
      { command: "start", description: "🏠 Главное меню" },
      { command: "lessons", description: "📖 Мои уроки" },
      { command: "profile", description: "👤 Профиль" },
      { command: "help", description: "❓ Помощь" },
    ],
    { scope: { type: "default" } },
  );
}
