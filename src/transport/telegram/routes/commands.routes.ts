import type { Bot } from "grammy";
import type { BotContext } from "../context.js";

import type { LessonsService } from "../../../domain/lessons/lessons.service.js";
import type { ProfileService } from "../../../domain/profile/profile.service.js";

import { navPush, navReset } from "../helpers/nav.js";
import { renderScreen } from "../helpers/render-screen.js";
import { beginNewScreen } from "../helpers/begin-new-screen.js";

export function registerCommandsRoutes(
  bot: Bot<BotContext>,
  deps: { lessons: LessonsService; profile: ProfileService },
) {
  bot.command("lessons", async (ctx) => {
    beginNewScreen(ctx);
    navReset(ctx, { name: "home" });
    navPush(ctx, { name: "lessons_list", page: 0 });
    await renderScreen(ctx, deps, { name: "lessons_list", page: 0 });
  });

  bot.command("profile", async (ctx) => {
    beginNewScreen(ctx);
    navReset(ctx, { name: "home" });
    navPush(ctx, { name: "profile" });
    await renderScreen(ctx, deps, { name: "profile" });
  });

  bot.command("help", async (ctx) => {
    beginNewScreen(ctx);
    navReset(ctx, { name: "home" });
    navPush(ctx, { name: "help" });
    await renderScreen(ctx, deps, { name: "help" });
  });
}
