import { Bot } from "grammy";
import { autoRetry } from "@grammyjs/auto-retry";
import { env } from "../config/env.js";

import type { BotContext } from "../transport/telegram/context.js";
import { setupSessionMiddleware } from "../transport/telegram/middlewares/session.middleware.js";
import { setupErrorHandler } from "../transport/telegram/middlewares/error-handler.js";
import { i18n } from "../i18n/index.js";

import { registerStartRoutes } from "../transport/telegram/routes/start.routes.js";
import { registerRegistrationRoutes } from "../transport/telegram/routes/registration.routes.js";
import { registerInvitesRoutes } from "../transport/telegram/routes/invites.routes.js";
import { registerLessonsRoutes } from "../transport/telegram/routes/lessons.routes.js";
import { registerProfileRoutes } from "../transport/telegram/routes/profile.routes.js";
import { registerCommandsRoutes } from "../transport/telegram/routes/commands.routes.js";
import { registerStudentAssignmentsRoutes } from "../transport/telegram/routes/student-assignments.routes.js";
import { registerLanguageRoutes } from "../transport/telegram/routes/language.routes.js";

import { logInfo } from "../observability/logger.js";
import { runWithRequestContext } from "../observability/request-context.js";

import type { Container } from "./container.js";

export function createBot(container: Container) {
  const bot = new Bot<BotContext>(env.telegramBotToken, {
    client: {
      timeoutSeconds: 20,
      sensitiveLogs: env.nodeEnv === "development",
    },
  });

  bot.api.config.use(
    autoRetry({
      maxRetryAttempts: 2,
      maxDelaySeconds: 10,
    }),
  );

  setupSessionMiddleware(bot);

  bot.use(i18n);

  bot.use(async (ctx, next) => {
    return await runWithRequestContext(
      {
        updateId: ctx.update.update_id ?? null,
        telegramUserId: ctx.from?.id ?? null,
        userId: ctx.session.userId ?? null,
      },
      async () => {
        logInfo("update_received", {
          text: ctx.msg?.text ?? null,
          callback_data: ctx.callbackQuery?.data ?? null,
        });

        await next();
      },
    );
  });

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
  registerLanguageRoutes(bot, deps);

  return bot;
}
