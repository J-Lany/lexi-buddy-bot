import type { Bot } from "grammy";
import type { BotContext } from "../context.js";

import type { StudentHomeService } from "../../../domain/student-home/student-home.service.js";
import { startRegistrationKeyboard } from "../ui/keyboards/registration.keyboard.js";

import {
  startActiveStudentMessage,
  startNeedRegMessage,
  startRegisteredNoTeacherMessage,
} from "../ui/messages/start.messages.js";

import { safeEditScreen } from "../helpers/safe-edit-screen.js";
import { mainInlineKeyboard } from "../ui/keyboards/main-inline.keyboard.js";
import { beginNewScreen } from "../helpers/begin-new-screen.js";

export function registerStartRoutes(
  bot: Bot<BotContext>,
  home: StudentHomeService,
) {
  bot.command("start", async (ctx) => {
    const from = ctx.from;
    if (!from) return;

    beginNewScreen(ctx);
    await ctx
      .reply(" ", { reply_markup: { remove_keyboard: true } })
      .catch(() => {});

    const profile = {
      telegramId: from.id,
      username: from.username ?? null,
      firstName: from.first_name,
      lastName: from.last_name ?? null,
    };

    await safeEditScreen(ctx, "⌛️ Загружаю…", { reply_markup: undefined });

    const view = await home.getStartView(profile);

    if (view.type === "NEED_REG") {
      ctx.session.reg = { draft: profile };

      await safeEditScreen(ctx, startNeedRegMessage(profile.firstName), {
        reply_markup: startRegistrationKeyboard(),
      });
      return;
    }

    if (view.type === "REGISTERED_NO_TEACHER") {
      await safeEditScreen(ctx, startRegisteredNoTeacherMessage(), {
        reply_markup: mainInlineKeyboard(),
      });
      return;
    }

    await safeEditScreen(ctx, startActiveStudentMessage(profile.firstName), {
      reply_markup: mainInlineKeyboard(),
    });
  });
}
