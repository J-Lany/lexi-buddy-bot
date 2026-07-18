import type { Bot } from "grammy";
import type { BotContext } from "../context.js";

const COMMANDS_BY_LOCALE: Record<
  string,
  Array<{ command: string; description: string }>
> = {
  en: [
    { command: "start", description: "🏠 Menu" },
    { command: "lessons", description: "📖 My lessons" },
    { command: "help", description: "❓ Help" },
  ],
  ru: [
    { command: "start", description: "🏠 Главное меню" },
    { command: "lessons", description: "📖 Мои уроки" },
    { command: "help", description: "❓ Помощь" },
  ],
  kz: [
    { command: "start", description: "🏠 Басты мәзір" },
    { command: "lessons", description: "📖 Менің сабақтарым" },
    { command: "help", description: "❓ Анықтама" },
  ],
  es: [
    { command: "start", description: "🏠 Menú principal" },
    { command: "lessons", description: "📖 Mis lecciones" },
    { command: "help", description: "❓ Ayuda" },
  ],
};

export async function setupBotUi(bot: Bot<BotContext>) {
  await bot.api.setMyCommands(COMMANDS_BY_LOCALE["en"]!, {
    scope: { type: "default" },
  });

  for (const [lang, commands] of Object.entries(COMMANDS_BY_LOCALE)) {
    await bot.api.setMyCommands(commands, {
      scope: { type: "default" },
      language_code: lang as "en" | "ru",
    });
  }
}
