import type { Bot } from "grammy";
import { session } from "grammy";
import type { BotContext } from "../context.js";
import type { SessionData } from "../session.js";

export function setupSessionMiddleware(bot: Bot<BotContext>) {
  bot.use(
    session<SessionData, BotContext>({
      initial: (): SessionData => ({}),
    }),
  );
}
