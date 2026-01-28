import type { Bot } from "grammy";
import type { BotContext } from "../context.js";
import type { RoutesDeps } from "./routes.deps.js";
import { ack } from "../helpers/ack.js";
import { goTo } from "../helpers/go-to.js";

export function registerProfileRoutes(bot: Bot<BotContext>, deps: RoutesDeps) {
  bot.callbackQuery("nav:profile", async (ctx) => {
    await ack(ctx);
    await goTo(ctx, deps, { name: "profile" }, { navMode: "reset" });
  });

  bot.callbackQuery("nav:help", async (ctx) => {
    await ack(ctx);
    await goTo(ctx, deps, { name: "help" }, { navMode: "reset" });
  });
}
