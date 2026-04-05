import type { Bot } from "grammy";
import type { BotContext } from "../context.js";
import type { RoutesDeps } from "./routes.deps.js";

import { goTo } from "../helpers/go-to.js";
import { beginNewScreen } from "../helpers/begin-new-screen.js";
import { safeEditScreen } from "../helpers/edit-screen/safe-edit-screen.js";
import { logError } from "../../../observability/logger.js";

export function registerCommandsRoutes(bot: Bot<BotContext>, deps: RoutesDeps) {
  bot.command("lessons", async (ctx) => {
    beginNewScreen(ctx);

    try {
      await goTo(
        ctx,
        deps,
        { name: "lessons_list", page: 0 },
        { navMode: "reset", clearAssignmentRun: "always" },
      );
    } catch (e) {
      logError("command_lessons_failed", e);
      await safeEditScreen(
        ctx,
        "⚠️ Не удалось открыть уроки. Попробуй чуть позже.",
      );
    }
  });

  bot.command("help", async (ctx) => {
    beginNewScreen(ctx);

    try {
      await goTo(
        ctx,
        deps,
        { name: "help" },
        { navMode: "reset", clearAssignmentRun: "always" },
      );
    } catch (e) {
      logError("command_help_failed", e);
      await safeEditScreen(
        ctx,
        "⚠️ Не удалось открыть помощь. Попробуй чуть позже.",
      );
    }
  });
}
