import express, { type Request, type Response } from "express";
import type { Bot } from "grammy";
import type { BotContext } from "../telegram/context.js";
import { env } from "../../config/env.js";
import { parseTeacherRequestPayload } from "./teacher-request.dto.js";
import { TeacherRequestNotificationService } from "../../domain/notifications/teacher-request-notification.service.js";

function isAuthorized(req: Request): boolean {
  const token = req.header("x-internal-token");
  return Boolean(
    env.telegramBotInternalToken && token === env.telegramBotInternalToken,
  );
}

export function startInternalHttpServer(bot: Bot<BotContext>) {
  const app = express();
  app.use(express.json({ limit: "256kb" }));

  const notifier = new TeacherRequestNotificationService(bot);

  app.post("/internal/teacher-request", (req: Request, res: Response) => {
    if (!isAuthorized(req))
      return res.status(401).json({ error: "Unauthorized" });

    let payload;
    try {
      payload = parseTeacherRequestPayload(req.body);
    } catch {
      return res.status(400).json({ error: "Invalid payload" });
    }

    res.status(202).json({ ok: true });

    void notifier.send(payload).catch((err) => {
      console.error("[internal-http] telegram send failed", err);
    });
  });

  app.listen(env.internalPort, () => {
    console.log(`[internal-http] listening on :${env.internalPort}`);
  });

  return app;
}
