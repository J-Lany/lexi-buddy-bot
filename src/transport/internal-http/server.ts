import type { Server } from "node:http";
import { randomUUID } from "node:crypto";
import express, {
  type NextFunction,
  type Request,
  type Response,
} from "express";

import { env } from "../../config/env.js";
import { logError, logInfo, logWarn } from "../../observability/logger.js";

import { parseTeacherRequestPayload } from "./teacher-request.dto.js";
import type { TeacherRequestNotificationSender } from "../telegram/notifications/teacher-request.notification.js";
import { parseLessonAssignedPayload } from "./lesson-assigned.dto.js";
import type { LessonAssignedNotificationSender } from "../telegram/notifications/lesson-assigned.notification.js";

declare module "express-serve-static-core" {
  interface Request {
    requestId?: string;
  }
}

function resolveRequestId(req: Request) {
  if (req.requestId) return req.requestId;

  const incoming = req.header("x-request-id");
  return incoming && incoming.trim().length > 0 ? incoming : randomUUID();
}

function requestIdMiddleware(req: Request, res: Response, next: NextFunction) {
  const requestId = resolveRequestId(req);
  req.requestId = requestId;
  res.setHeader("X-Request-Id", requestId);
  next();
}

function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const requestId = resolveRequestId(req);
  const token = req.header("x-internal-token");
  const ok = token === env.telegramBotInternalToken;

  if (!ok) {
    logWarn("internal_http_unauthorized", {
      request_id: requestId,
      path: req.path,
      method: req.method,
    });

    return res.status(401).json({ error: "Unauthorized" });
  }

  next();
}

export function startInternalHttpServer(deps: {
  teacherRequestNotifier: TeacherRequestNotificationSender;
  lessonAssignedNotifier: LessonAssignedNotificationSender;
}): Server {
  const app = express();

  app.use(requestIdMiddleware);
  app.use(express.json({ limit: "256kb" }));

  app.post(
    "/internal/teacher-request",
    authMiddleware,
    (req: Request, res: Response) => {
      const requestId = resolveRequestId(req);

      let payload;
      try {
        payload = parseTeacherRequestPayload(req.body);
      } catch {
        logWarn("internal_teacher_request_invalid_payload", {
          request_id: requestId,
          path: req.path,
          method: req.method,
        });

        return res.status(400).json({ error: "Invalid payload" });
      }

      logInfo("internal_teacher_request_received", {
        request_id: requestId,
        telegram_user_id: payload.telegramId,
        invite_id: payload.inviteId,
      });

      res.status(202).json({ ok: true });

      void deps.teacherRequestNotifier.send(payload).catch((err) => {
        logError("internal_teacher_request_send_failed", err, {
          request_id: requestId,
          telegram_user_id: payload.telegramId,
          invite_id: payload.inviteId,
        });
      });
    },
  );

  app.post(
    "/internal/lesson-assigned",
    authMiddleware,
    (req: Request, res: Response) => {
      const requestId = resolveRequestId(req);

      let payload;
      try {
        payload = parseLessonAssignedPayload(req.body);
      } catch {
        logWarn("internal_lesson_assigned_invalid_payload", {
          request_id: requestId,
          path: req.path,
          method: req.method,
        });

        return res.status(400).json({ error: "Invalid payload" });
      }

      logInfo("internal_lesson_assigned_received", {
        request_id: requestId,
        telegram_user_id: payload.telegramId,
        lesson_id: payload.lessonId,
      });

      res.status(202).json({ ok: true });

      void deps.lessonAssignedNotifier.send(payload).catch((err) => {
        logError("internal_lesson_assigned_send_failed", err, {
          request_id: requestId,
          telegram_user_id: payload.telegramId,
          lesson_id: payload.lessonId,
        });
      });
    },
  );

  const server = app.listen(env.internalPort, () => {
    logInfo("internal_http_listening", {
      port: env.internalPort,
    });
  });

  server.on("error", (err) => {
    logError("internal_http_server_failed", err, {
      port: env.internalPort,
    });

    process.exit(1);
  });

  return server;
}
