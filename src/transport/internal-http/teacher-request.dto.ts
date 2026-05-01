import type { TeacherRequestNotification } from "../telegram/notifications/teacher-request.notification.js";
import { parseNumberLike } from "./utils/number-like.js";

type TeacherRequestPayload = {
  telegramId?: unknown;
  inviteId?: unknown;
  teacherName?: unknown;
  message?: unknown;
};

export function parseTeacherRequestPayload(
  body: unknown,
): TeacherRequestNotification {
  if (!body || typeof body !== "object") {
    throw new Error("Body is required");
  }

  const b = body as TeacherRequestPayload;

  const chatId = parseNumberLike(b.telegramId, "telegramId");
  const inviteId = parseNumberLike(b.inviteId, "inviteId");

  const result: TeacherRequestNotification = {
    telegramId: chatId,
    inviteId: inviteId,
  };

  if (b.teacherName != null) {
    if (typeof b.teacherName !== "string" || b.teacherName.length > 256) {
      throw new Error("teacherName must be string (max 256 chars)");
    }
    result.teacherName = b.teacherName.trim() || null;
  }

  if (b.message != null) {
    if (typeof b.message !== "string" || b.message.length > 1024) {
      throw new Error("message must be string (max 1024 chars)");
    }
    result.message = b.message.trim() || null;
  }

  return result;
}
