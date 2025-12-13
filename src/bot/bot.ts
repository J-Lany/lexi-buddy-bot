import { Bot } from "grammy";
import { session } from "grammy";
import type { BotContext } from "./context.js";
import type { SessionData } from "./session.js";
import { env } from "../config/env.js";
import { BackendApiService } from "../infra/backend-api/backend-api.service.js";
import { registerRegistrationHandlers } from "./handlers/registration.handler.js";
import { RegistrationService } from "../domain/registration/registration.service.js";

export function createBot() {
  const bot = new Bot<BotContext>(env.telegramBotToken);

  bot.use(
    session<SessionData, BotContext>({
      initial: (): SessionData => ({}),
    }),
  );

  const backend = new BackendApiService();
  const regService = new RegistrationService(backend);

  registerRegistrationHandlers(bot, regService);

  return bot;
}
