import express, {
  type Request,
  type Response,
  type NextFunction,
} from "express";
import { env } from "../../config/env.js";
import { parseTeacherRequestPayload } from "./teacher-request.dto.js";
import type { TeacherRequestNotificationSender } from "../telegram/notifications/teacher-request.notification.js";
import { parseLessonAssignedPayload } from "./lesson-assigned.dto.js";
import type { LessonAssignedNotificationSender } from "../telegram/notifications/lesson-assigned.notification.js";

function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const token = req.header("x-internal-token");
  const ok =
    Boolean(env.telegramBotInternalToken) &&
    token === env.telegramBotInternalToken;

  if (!ok) return res.status(401).json({ error: "Unauthorized" });
  next();
}

export function startInternalHttpServer(deps: {
  teacherRequestNotifier: TeacherRequestNotificationSender;
  lessonAssignedNotifier: LessonAssignedNotificationSender;
}) {
  const app = express();
  app.use(express.json({ limit: "256kb" }));

  app.post(
    "/internal/teacher-request",
    authMiddleware,
    (req: Request, res: Response) => {
      let payload;
      try {
        payload = parseTeacherRequestPayload(req.body);
      } catch {
        return res.status(400).json({ error: "Invalid payload" });
      }

      res.status(202).json({ ok: true });

      void deps.teacherRequestNotifier.send(payload).catch((err) => {
        console.error("[internal-http] telegram send failed", err);
      });
    },
  );

  app.post(
    "/internal/lesson-assigned",
    authMiddleware,
    (req: Request, res: Response) => {
      let payload;
      try {
        payload = parseLessonAssignedPayload(req.body);
      } catch {
        return res.status(400).json({ error: "Invalid payload" });
      }

      res.status(202).json({ ok: true });

      void deps.lessonAssignedNotifier.send(payload).catch((err) => {
        console.error("[internal-http] telegram send failed", err);
      });
    },
  );

  app.listen(env.internalPort, () => {
    console.log(`[internal-http] listening on :${env.internalPort}`);
  });

  return app;
}
