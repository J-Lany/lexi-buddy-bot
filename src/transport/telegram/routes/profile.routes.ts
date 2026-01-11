import type { Bot } from "grammy";
import type { BotContext } from "../context.js";

import type { ProfileService } from "../../../domain/profile/profile.service.js";
import { profileMessage } from "../ui/messages/profile.messages.js";
import { mainMenuKeyboard } from "../ui/keyboards/main.keyboard.js";

export function registerProfileRoutes(
  bot: Bot<BotContext>,
  profile: ProfileService,
) {
  bot.hears("👤 Профиль", async (ctx) => {
    const telegramId = ctx.from?.id;
    if (!telegramId) return;

    const data = await profile.get(telegramId);
    await ctx.reply(profileMessage(data), { reply_markup: mainMenuKeyboard() });
  });
}
