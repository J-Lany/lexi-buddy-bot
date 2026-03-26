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
import { registerCommandsRoutes } from "../transport/telegram/routes/commands.routes.js";
import { registerStudentAssignmentsRoutes } from "../transport/telegram/routes/student-assignments.routes.js";

import type { Container } from "./container.js";

export function createBot(container: Container) {
  const bot = new Bot<BotContext>(env.telegramBotToken);

  bot.use(async (ctx, next) => {
    console.log("[update]", {
      updateId: ctx.update.update_id,
      fromId: ctx.from?.id,
      chatId: ctx.chat?.id,
      text: ctx.msg?.text,
      callbackData: ctx.callbackQuery?.data,
    });

    await next();
  });

  setupSessionMiddleware(bot);
  setupErrorHandler(bot);

  const deps = {
    lessons: container.lessonsService,
    profile: container.profileService,
    studentAssignments: container.studentAssignmentsService,
  };

  registerStartRoutes(bot, {
    home: container.studentHomeService,
    ...deps,
  });

  registerRegistrationRoutes(bot, container.registrationService);
  registerInvitesRoutes(bot, container.invitesService);

  registerCommandsRoutes(bot, deps);
  registerLessonsRoutes(bot, deps);
  registerStudentAssignmentsRoutes(bot, deps);
  registerProfileRoutes(bot, deps);

  return bot;
}
