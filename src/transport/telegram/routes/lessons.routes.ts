import type { Bot } from "grammy";
import type { BotContext } from "../context.js";
import type { RoutesDeps } from "./routes.deps.js";

import { navPop } from "../helpers/nav.js";
import { goTo } from "../helpers/go-to.js";
import { ack } from "../helpers/ack.js";
import { safeEditScreen } from "../helpers/edit-screen/safe-edit-screen.js";
import { logError, logInfo } from "../../../observability/logger.js";

export function registerLessonsRoutes(bot: Bot<BotContext>, deps: RoutesDeps) {
  bot.callbackQuery("nav:lessons", async (ctx) => {
    await ack(ctx);

    try {
      await goTo(
        ctx,
        deps,
        { name: "lessons_list", page: 0 },
        { navMode: "reset" },
      );
    } catch (e) {
      logError("nav_lessons_failed", e);
      await safeEditScreen(
        ctx,
        "⚠️ Не удалось открыть список уроков. Попробуй чуть позже.",
      );
    }
  });

  bot.callbackQuery(/^lessons_page:\d+$/, async (ctx) => {
    await ack(ctx);

    const m = /^lessons_page:(\d+)$/.exec(ctx.callbackQuery.data);
    if (!m) return;

    const page = Number(m[1]);

    try {
      await goTo(
        ctx,
        deps,
        { name: "lessons_list", page },
        { navMode: "replaceTop", clearAssignmentRun: "never" },
      );
    } catch (e) {
      logError("lessons_page_failed", e, { page });
      await safeEditScreen(
        ctx,
        "⚠️ Не удалось переключить страницу уроков. Попробуй ещё раз.",
      );
    }
  });

  bot.callbackQuery(/^lesson_open:\d+$/, async (ctx) => {
    await ack(ctx);

    const m = /^lesson_open:(\d+)$/.exec(ctx.callbackQuery.data);
    if (!m) return;

    const lessonId = Number(m[1]);

    logInfo("lesson_opened", { lessonId });

    try {
      await goTo(
        ctx,
        deps,
        { name: "lesson", lessonId },
        { navMode: "push", clearAssignmentRun: "never" },
      );
    } catch (e) {
      logError("lesson_open_failed", e, { lessonId });
      await safeEditScreen(
        ctx,
        "⚠️ Не удалось открыть урок. Попробуй чуть позже.",
      );
    }
  });

  bot.callbackQuery(/^assignment_open:\d+$/, async (ctx) => {
    await ack(ctx);

    const m = /^assignment_open:(\d+)$/.exec(ctx.callbackQuery.data);
    if (!m) return;

    const assignmentId = Number(m[1]);

    try {
      await goTo(
        ctx,
        deps,
        { name: "assignment_intro", assignmentId },
        { navMode: "push", clearAssignmentRun: "always" },
      );
    } catch (e) {
      logError("assignment_open_failed", e, { assignmentId });
      await safeEditScreen(
        ctx,
        "⚠️ Не удалось открыть задание. Попробуй чуть позже.",
      );
    }
  });

  bot.callbackQuery("nav:home", async (ctx) => {
    await ack(ctx);

    try {
      await goTo(ctx, deps, { name: "home" }, { navMode: "reset" });
    } catch (e) {
      logError("nav_home_failed", e);
      await safeEditScreen(
        ctx,
        "⚠️ Не удалось открыть главное меню. Попробуй ещё раз.",
      );
    }
  });

  bot.callbackQuery("nav:back", async (ctx) => {
    await ack(ctx);

    const prev = navPop(ctx);
    if (!prev) return;

    try {
      await goTo(ctx, deps, prev, { navMode: "replaceTop" });
    } catch (e) {
      logError("nav_back_failed", e, { target: prev.name });
      await safeEditScreen(
        ctx,
        "⚠️ Не удалось вернуться назад. Попробуй ещё раз.",
      );
    }
  });
}
