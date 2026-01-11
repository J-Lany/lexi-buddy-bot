import type { Bot } from "grammy";
import type { BotContext } from "../context.js";

import type { StudentHomeService } from "../../../domain/student-home/student-home.service.js";
import { startRegistrationKeyboard } from "../ui/keyboards/registration.keyboard.js";
import { mainMenuKeyboard } from "../ui/keyboards/main.keyboard.js";

import {
  startActiveStudentMessage,
  startNeedRegMessage,
  startRegisteredNoTeacherMessage,
} from "../ui/messages/start.messages.js";

export function registerStartRoutes(
  bot: Bot<BotContext>,
  home: StudentHomeService,
) {
  bot.command("start", async (ctx) => {
    const from = ctx.from;
    if (!from) return;

    const profile = {
      telegramId: from.id,
      username: from.username ?? null,
      firstName: from.first_name,
      lastName: from.last_name ?? null,
    };

    const view = await home.getStartView(profile);

    if (view.type === "NEED_REG") {
      ctx.session.reg = { draft: profile };

      await ctx.reply(startNeedRegMessage(profile.firstName), {
        reply_markup: startRegistrationKeyboard(),
      });
      return;
    }

    if (view.type === "REGISTERED_NO_TEACHER") {
      await ctx.reply(startRegisteredNoTeacherMessage(), {
        reply_markup: mainMenuKeyboard(),
      });
      return;
    }

    await ctx.reply(startActiveStudentMessage(profile.firstName), {
      reply_markup: mainMenuKeyboard(),
    });
  });
}
