import { Bot } from "grammy";
import { env } from "../config/env.js";

import type { BotContext } from "../transport/telegram/context.js";
import { setupSessionMiddleware } from "../transport/telegram/middlewares/session.middleware.js";
import { setupErrorHandler } from "../transport/telegram/middlewares/error-handler.js";

import { registerRegistrationRoutes } from "../transport/telegram/routes/registration.routes.js";
import { registerTeacherRequestRoutes } from "../transport/telegram/routes/teacher-requests.routes.js";

import type { Container } from "./container.js";

export function createBot(container: Container) {
  const bot = new Bot<BotContext>(env.telegramBotToken);

  setupSessionMiddleware(bot);
  setupErrorHandler(bot);

  registerRegistrationRoutes(bot, container.registrationService);
  registerTeacherRequestRoutes(bot, container.backendApi);

  return bot;
}
