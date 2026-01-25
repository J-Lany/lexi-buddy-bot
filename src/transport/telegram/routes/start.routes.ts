import type { Bot } from "grammy";
import type { BotContext } from "../context.js";

import type { StudentHomeService } from "../../../domain/student-home/student-home.service.js";
import type { LessonsService } from "../../../domain/lessons/lessons.service.js";
import type { ProfileService } from "../../../domain/profile/profile.service.js";

import { startRegistrationKeyboard } from "../ui/keyboards/registration.keyboard.js";
import {
  startNeedRegMessage,
  startRegisteredNoTeacherMessage,
} from "../ui/messages/start.messages.js";

import { beginNewScreen } from "../helpers/begin-new-screen.js";
import { safeEditScreen } from "../helpers/safe-edit-screen.js";
import { navReset } from "../helpers/nav.js";
import { renderScreen } from "../helpers/render-screen.js";

export function registerStartRoutes(
  bot: Bot<BotContext>,
  deps: {
    home: StudentHomeService;
    lessons: LessonsService;
    profile: ProfileService;
  },
) {
  bot.command("start", async (ctx) => {
    const from = ctx.from;
    if (!from) return;

    beginNewScreen(ctx);

    await ctx
      .reply("✅", { reply_markup: { remove_keyboard: true } })
      .catch(() => {});

    const profile = {
      telegramId: from.id,
      username: from.username ?? null,
      firstName: from.first_name,
      lastName: from.last_name ?? null,
    };

    await safeEditScreen(ctx, "⌛️ Загружаю…", { reply_markup: undefined });

    const view = await deps.home.getStartView(profile);

    if (view.type === "NEED_REG") {
      ctx.session.reg = { draft: profile };

      await safeEditScreen(ctx, startNeedRegMessage(profile.firstName), {
        reply_markup: startRegistrationKeyboard(),
      });
      return;
    }

    if (view.type === "REGISTERED_NO_TEACHER") {
      navReset(ctx, { name: "home" });
      await safeEditScreen(ctx, startRegisteredNoTeacherMessage(), {
        reply_markup: undefined,
      });

      await renderScreen(
        ctx,
        { lessons: deps.lessons, profile: deps.profile },
        { name: "home" },
      );
      return;
    }

    navReset(ctx, { name: "home" });
    await renderScreen(
      ctx,
      { lessons: deps.lessons, profile: deps.profile },
      { name: "home" },
    );
  });
}
