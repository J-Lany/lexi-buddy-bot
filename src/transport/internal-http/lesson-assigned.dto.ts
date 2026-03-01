import { parseNumberLike } from "./utils/number-like.js";
import type { LessonAssignedNotification } from "../telegram/notifications/lesson-assigned.notification.js";

type LessonAssignedPayload = {
  telegramId?: unknown;
  lessonId?: unknown;
  lessonTitle?: unknown;
  teacherName?: unknown;
};

export function parseLessonAssignedPayload(
  body: unknown,
): LessonAssignedNotification {
  if (!body || typeof body !== "object") {
    throw new Error("Body is required");
  }

  const b = body as LessonAssignedPayload;

  const telegramId = parseNumberLike(b.telegramId, "telegramId");
  const lessonId = parseNumberLike(b.lessonId, "lessonId");

  if (typeof b.lessonTitle !== "string") {
    throw new Error("lessonTitle must be string");
  }

  const result: LessonAssignedNotification = {
    telegramId,
    lessonId,
    lessonTitle: b.lessonTitle.trim() || `Урок`,
  };

  if (b.teacherName != null) {
    if (typeof b.teacherName !== "string") {
      throw new Error("teacherName must be string|null");
    }
    result.teacherName = b.teacherName.trim() || null;
  }

  return result;
}
