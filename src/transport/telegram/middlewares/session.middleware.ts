import type { Bot } from "grammy";
import { session } from "grammy";
import type { BotContext } from "../context.js";
import type { SessionData } from "../session.js";
import { upstashSessionStorage } from "../../../infra/session/upstash-session.storage.js";

export function setupSessionMiddleware(bot: Bot<BotContext>) {
  bot.use(
    session<SessionData, BotContext>({
      storage: upstashSessionStorage,
      initial: (): SessionData => ({
        userId: null,
        nav: { stack: [{ name: "home" }] },
        ui: {},
        assignmentRun: null,
        assignmentSubmitError: null,
      }),
    }),
  );
}
