import type { Server } from "node:http";
import os from "node:os";

import { env } from "../config/env.js";
import { logError, logInfo, logWarn } from "../observability/logger.js";

import { createContainer } from "./container.js";
import { createBot } from "./bot.js";
import { startInternalHttpServer } from "../transport/internal-http/server.js";
import { TeacherRequestNotificationSender } from "../transport/telegram/notifications/teacher-request.notification.js";
import { setupBotUi } from "../transport/telegram/setup/setup-bot-ui.js";
import { LessonAssignedNotificationSender } from "../transport/telegram/notifications/lesson-assigned.notification.js";

let isShuttingDown = false;

function fatalExit(event: string, payload: unknown) {
  logError(event, payload);
  process.exit(1);
}

function closeServer(server: Server) {
  return new Promise<void>((resolve, reject) => {
    server.close((err) => {
      if (err) {
        reject(err);
        return;
      }
      resolve();
    });
  });
}

process.on("unhandledRejection", (reason) => {
  fatalExit("process_unhandled_rejection", reason);
});

process.on("uncaughtException", (error) => {
  fatalExit("process_uncaught_exception", error);
});

async function main() {
  logInfo("boot_starting_app", {
    pid: process.pid,
    host: os.hostname(),
    token_tail: env.telegramBotToken.slice(-6),
    backend_base_url: env.backendBaseUrl,
    internal_port: env.internalPort,
    started_at: new Date().toISOString(),
  });

  const container = createContainer();
  const bot = createBot(container);

  process.once("SIGINT", () => {
    isShuttingDown = true;
    logInfo("signal_received", { signal: "SIGINT" });
    void bot.stop();
  });

  process.once("SIGTERM", () => {
    isShuttingDown = true;
    logInfo("signal_received", { signal: "SIGTERM" });
    void bot.stop();
  });

  logInfo("telegram_api_check_started");
  const me = await bot.api.getMe();
  logInfo("telegram_api_check_succeeded", {
    bot_id: me.id,
    bot_username: me.username ?? null,
  });

  void setupBotUi(bot)
    .then(() => {
      logInfo("bot_commands_updated");
    })
    .catch((err) => {
      logWarn("bot_commands_update_failed", {
        message: err instanceof Error ? err.message : String(err),
      });
    });

  const teacherRequestNotifier = new TeacherRequestNotificationSender(bot);
  const lessonAssignedNotifier = new LessonAssignedNotificationSender(bot);

  const internalHttpServer = startInternalHttpServer({
    teacherRequestNotifier,
    lessonAssignedNotifier,
  });

  logInfo("telegram_polling_starting");

  try {
    await bot.start();

    if (isShuttingDown) {
      await closeServer(internalHttpServer);
      logInfo("internal_http_server_stopped");
      logInfo("shutdown_complete");
      return;
    }

    fatalExit("telegram_polling_stopped_unexpectedly", null);
  } catch (err) {
    try {
      await closeServer(internalHttpServer);
    } catch (closeErr) {
      logError("internal_http_server_stop_failed", closeErr);
    }

    if (!isShuttingDown) {
      fatalExit("telegram_polling_failed", err);
    }
  }
}

main().catch((err) => {
  fatalExit("boot_fatal_startup_error", err);
});
