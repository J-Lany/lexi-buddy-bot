import type { Bot } from "grammy";
import type { BotContext } from "../context.js";
import type { RoutesDeps } from "./routes.deps.js";

import { navPop } from "../helpers/nav.js";
import { goTo } from "../helpers/go-to.js";
import { ack } from "../helpers/ack.js";

export function registerLessonsRoutes(bot: Bot<BotContext>, deps: RoutesDeps) {
  bot.callbackQuery("nav:lessons", async (ctx) => {
    await ack(ctx);
    await goTo(
      ctx,
      deps,
      { name: "lessons_list", page: 0 },
      { navMode: "reset" },
    );
  });

  bot.callbackQuery(/^lessons_page:\d+$/, async (ctx) => {
    await ack(ctx);

    const m = /^lessons_page:(\d+)$/.exec(ctx.callbackQuery.data);
    if (!m) return;

    const page = Number(m[1]);

    await goTo(
      ctx,
      deps,
      { name: "lessons_list", page },
      { navMode: "replaceTop", clearAssignmentRun: "never" },
    );
  });

  bot.callbackQuery(/^lesson_open:\d+$/, async (ctx) => {
    await ack(ctx);

    const m = /^lesson_open:(\d+)$/.exec(ctx.callbackQuery.data);
    if (!m) return;

    const lessonId = Number(m[1]);

    await goTo(
      ctx,
      deps,
      { name: "lesson", lessonId },
      { navMode: "push", clearAssignmentRun: "never" },
    );
  });

  bot.callbackQuery(/^assignment_open:\d+$/, async (ctx) => {
    await ack(ctx);

    const m = /^assignment_open:(\d+)$/.exec(ctx.callbackQuery.data);
    if (!m) return;

    const assignmentId = Number(m[1]);

    await goTo(
      ctx,
      deps,
      { name: "assignment_intro", assignmentId },
      { navMode: "push", clearAssignmentRun: "always" },
    );
  });

  bot.callbackQuery("nav:home", async (ctx) => {
    await ack(ctx);
    await goTo(ctx, deps, { name: "home" }, { navMode: "reset" });
  });

  bot.callbackQuery("nav:back", async (ctx) => {
    await ack(ctx);

    const prev = navPop(ctx);
    if (!prev) return;

    await goTo(ctx, deps, prev, { navMode: "replaceTop" });
  });
}
