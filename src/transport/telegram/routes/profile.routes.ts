import type { Bot } from "grammy";
import type { BotContext } from "../context.js";

import type { LessonsService } from "../../../domain/lessons/lessons.service.js";
import type { ProfileService } from "../../../domain/profile/profile.service.js";

import { navReset, navPush } from "../helpers/nav.js";
import { renderScreen } from "../helpers/render-screen.js";

export function registerProfileRoutes(
  bot: Bot<BotContext>,
  deps: { lessons: LessonsService; profile: ProfileService },
) {
  bot.callbackQuery("nav:profile", async (ctx) => {
    navReset(ctx, { name: "home" });
    navPush(ctx, { name: "profile" });
    await renderScreen(ctx, deps, { name: "profile" });
  });

  bot.callbackQuery("nav:help", async (ctx) => {
    navReset(ctx, { name: "home" });
    navPush(ctx, { name: "help" });
    await renderScreen(ctx, deps, { name: "help" });
  });
}
