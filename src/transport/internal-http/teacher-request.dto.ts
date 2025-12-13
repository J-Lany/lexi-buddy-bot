import type { TeacherRequestNotification } from "../../domain/notifications/teacher-request-notification.service.js";

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

  const rawTelegramId = b.telegramId;
  const chatId =
    typeof rawTelegramId === "number"
      ? rawTelegramId
      : typeof rawTelegramId === "string"
        ? Number(rawTelegramId)
        : NaN;

  if (!Number.isFinite(chatId)) {
    throw new Error("telegramId must be a number or numeric string");
  }

  if (typeof b.inviteId !== "number" || !Number.isFinite(b.inviteId)) {
    throw new Error("inviteId must be a number");
  }

  const result: TeacherRequestNotification = {
    telegramId: chatId,
    inviteId: b.inviteId,
  };

  if (b.teacherName != null) {
    if (typeof b.teacherName !== "string") {
      throw new Error("teacherName must be string|null");
    }
    result.teacherName = b.teacherName.trim() || null;
  }

  if (b.message != null) {
    if (typeof b.message !== "string") {
      throw new Error("message must be string|null");
    }
    result.message = b.message;
  }

  return result;
}
