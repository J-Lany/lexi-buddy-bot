import type { Bot } from "grammy";
import type { BotContext } from "../context.js";

import type { LessonsService } from "../../../domain/lessons/lessons.service.js";
import type { ProfileService } from "../../../domain/profile/profile.service.js";

import { navReset, navPush, navPop } from "../helpers/nav.js";
import { renderScreen } from "../helpers/render-screen.js";

export function registerLessonsRoutes(
  bot: Bot<BotContext>,
  deps: { lessons: LessonsService; profile: ProfileService },
) {
  bot.callbackQuery("nav:lessons", async (ctx) => {
    navReset(ctx, { name: "home" });
    navPush(ctx, { name: "lessons_list", page: 0 });
    await renderScreen(ctx, deps, { name: "lessons_list", page: 0 });
  });

  bot.callbackQuery(/^lessons_page:\d+$/, async (ctx) => {
    const m = /^lessons_page:(\d+)$/.exec(ctx.callbackQuery.data);
    if (!m) return;

    const page = Number(m[1]);

    navPush(ctx, { name: "lessons_list", page });
    await renderScreen(ctx, deps, { name: "lessons_list", page });
  });

  bot.callbackQuery(/^lesson_open:\d+$/, async (ctx) => {
    const m = /^lesson_open:(\d+)$/.exec(ctx.callbackQuery.data);
    if (!m) return;

    const lessonId = Number(m[1]);
    navPush(ctx, { name: "lesson", lessonId });

    await renderScreen(ctx, deps, { name: "lesson", lessonId });
  });

  bot.callbackQuery(/^assignment_open:\d+$/, async (ctx) => {
    const m = /^assignment_open:(\d+)$/.exec(ctx.callbackQuery.data);
    if (!m) return;

    const assignmentId = Number(m[1]);
    navPush(ctx, { name: "assignment", assignmentId });

    await renderScreen(ctx, deps, { name: "assignment", assignmentId });
  });

  bot.callbackQuery("nav:home", async (ctx) => {
    navReset(ctx, { name: "home" });
    await renderScreen(ctx, deps, { name: "home" });
  });

  bot.callbackQuery("nav:back", async (ctx) => {
    const prev = navPop(ctx);
    if (!prev) return;

    await renderScreen(ctx, deps, prev);
  });
}
