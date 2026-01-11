import { Bot } from "grammy";
import { env } from "../config/env.js";

import type { BotContext } from "../transport/telegram/context.js";
import { setupSessionMiddleware } from "../transport/telegram/middlewares/session.middleware.js";
import { setupErrorHandler } from "../transport/telegram/middlewares/error-handler.js";

import { registerStartRoutes } from "../transport/telegram/routes/start.routes.js";
import { registerRegistrationRoutes } from "../transport/telegram/routes/registration.routes.js";
import { registerInvitesRoutes } from "../transport/telegram/routes/invites.routes.js";

import type { Container } from "./container.js";

export function createBot(container: Container) {
  const bot = new Bot<BotContext>(env.telegramBotToken);

  setupSessionMiddleware(bot);
  setupErrorHandler(bot);

  registerStartRoutes(bot, container.studentHomeService);

  registerRegistrationRoutes(bot, container.registrationService);

  registerInvitesRoutes(bot, container.invitesService);

  return bot;
}
