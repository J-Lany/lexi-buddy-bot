import os from "node:os";
import { env } from "../config/env.js";

import { createContainer } from "./container.js";
import { createBot } from "./bot.js";
import { startInternalHttpServer } from "../transport/internal-http/server.js";
import { TeacherRequestNotificationSender } from "../transport/telegram/notifications/teacher-request.notification.js";
import { setupBotUi } from "../transport/telegram/setup/setup-bot-ui.js";
import { LessonAssignedNotificationSender } from "../transport/telegram/notifications/lesson-assigned.notification.js";

let isShuttingDown = false;

function fatalExit(label: string, payload: unknown) {
  console.error(label, payload);
  process.exit(1);
}

process.on("unhandledRejection", (reason) => {
  fatalExit("[process] unhandledRejection", reason);
});

process.on("uncaughtException", (error) => {
  fatalExit("[process] uncaughtException", error);
});

async function main() {
  console.log("[boot] starting app", {
    pid: process.pid,
    host: os.hostname(),
    tokenTail: env.telegramBotToken.slice(-6),
    backendBaseUrl: env.backendBaseUrl,
    internalPort: env.internalPort,
    startedAt: new Date().toISOString(),
  });

  const container = createContainer();
  const bot = createBot(container);

  process.once("SIGINT", () => {
    isShuttingDown = true;
    console.log("[boot] SIGINT received, stopping bot...");
    bot.stop();
    process.exit(0);
  });

  process.once("SIGTERM", () => {
    isShuttingDown = true;
    console.log("[boot] SIGTERM received, stopping bot...");
    bot.stop();
    process.exit(0);
  });

  const teacherRequestNotifier = new TeacherRequestNotificationSender(bot);
  const lessonAssignedNotifier = new LessonAssignedNotificationSender(bot);

  startInternalHttpServer({ teacherRequestNotifier, lessonAssignedNotifier });
  console.log("[boot] internal http server started");

  void setupBotUi(bot)
    .then(() => {
      console.log("[boot] bot commands updated");
    })
    .catch((err) => {
      console.error("[boot] setupBotUi failed", err);
    });

  console.log("[boot] starting telegram polling...");

  try {
    await bot.start();

    if (!isShuttingDown) {
      fatalExit("[boot] telegram polling stopped unexpectedly", null);
    }
  } catch (err) {
    if (!isShuttingDown) {
      fatalExit("[boot] telegram polling failed", err);
    }
  }
}

main().catch((err) => {
  fatalExit("[boot] fatal startup error", err);
});
