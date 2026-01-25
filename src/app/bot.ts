import { Bot } from "grammy";
import { env } from "../config/env.js";

import type { BotContext } from "../transport/telegram/context.js";
import { setupSessionMiddleware } from "../transport/telegram/middlewares/session.middleware.js";
import { setupErrorHandler } from "../transport/telegram/middlewares/error-handler.js";

import { registerStartRoutes } from "../transport/telegram/routes/start.routes.js";
import { registerRegistrationRoutes } from "../transport/telegram/routes/registration.routes.js";
import { registerInvitesRoutes } from "../transport/telegram/routes/invites.routes.js";
import { registerLessonsRoutes } from "../transport/telegram/routes/lessons.routes.js";
import { registerProfileRoutes } from "../transport/telegram/routes/profile.routes.js";

import type { Container } from "./container.js";
import { registerCommandsRoutes } from "../transport/telegram/routes/commands.routes.js";

export function createBot(container: Container) {
  const bot = new Bot<BotContext>(env.telegramBotToken);

  setupSessionMiddleware(bot);
  setupErrorHandler(bot);

  registerStartRoutes(bot, container.studentHomeService);
  registerRegistrationRoutes(bot, container.registrationService);
  registerInvitesRoutes(bot, container.invitesService);

  registerCommandsRoutes(bot, {
    lessons: container.lessonsService,
    profile: container.profileService,
  });

  registerLessonsRoutes(bot, {
    lessons: container.lessonsService,
    profile: container.profileService,
  });

  registerProfileRoutes(bot, {
    lessons: container.lessonsService,
    profile: container.profileService,
  });

  return bot;
}
