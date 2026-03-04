import type { Bot } from "grammy";
import type { BotContext } from "../context.js";
import type { RoutesDeps } from "./routes.deps.js";

import { goTo } from "../helpers/go-to.js";
import { beginNewScreen } from "../helpers/begin-new-screen.js";

export function registerCommandsRoutes(bot: Bot<BotContext>, deps: RoutesDeps) {
  bot.command("lessons", async (ctx) => {
    beginNewScreen(ctx);
    await goTo(
      ctx,
      deps,
      { name: "lessons_list", page: 0 },
      { navMode: "reset", clearAssignmentRun: "always" },
    );
  });

  bot.command("help", async (ctx) => {
    beginNewScreen(ctx);
    await goTo(
      ctx,
      deps,
      { name: "help" },
      { navMode: "reset", clearAssignmentRun: "always" },
    );
  });
}
