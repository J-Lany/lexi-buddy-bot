import { config } from "dotenv";
import path from "node:path";

import { resolveWebsiteBaseUrl } from "./website-base-url.js";
import { normalizeOptionalEnv } from "./optional-env.js";
import {
  parseAdminIds,
  parseMediaRegistrationEnabled,
} from "./media-registration-env.js";

config({ path: path.resolve(process.cwd(), ".env") });

function mustGet(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env: ${name}`);
  return v;
}

const parsedAdminIds = parseAdminIds(process.env.TELEGRAM_MEDIA_ADMIN_IDS);

export const env = {
  nodeEnv: process.env.NODE_ENV ?? "production",
  port: Number(process.env.PORT ?? 80),

  telegramBotToken: mustGet("TELEGRAM_BOT_TOKEN"),
  backendBaseUrl: mustGet("BACKEND_BASE_URL"),
  telegramBotInternalToken: mustGet("TELEGRAM_BOT_INTERNAL_TOKEN"),
  websiteBaseUrl: resolveWebsiteBaseUrl(process.env.WEBSITE_BASE_URL),

  upstashRedisRestUrl: mustGet("UPSTASH_REDIS_REST_URL"),
  upstashRedisRestToken: mustGet("UPSTASH_REDIS_REST_TOKEN"),

  // Optional student-facing GIF/video overlays — absent env means "keep
  // sending the current plain text", never a startup failure.
  studentMedia: {
    welcomeGifFileId: normalizeOptionalEnv(
      process.env.TELEGRAM_GIF_STUDENT_WELCOME_FILE_ID,
    ),
    mainMenuGifFileId: normalizeOptionalEnv(
      process.env.TELEGRAM_GIF_STUDENT_MAIN_MENU_FILE_ID,
    ),
    teacherRequestAcceptedGifFileId: normalizeOptionalEnv(
      process.env.TELEGRAM_GIF_STUDENT_TEACHER_REQUEST_ACCEPTED_FILE_ID,
    ),
    lessonAssignedGifFileId: normalizeOptionalEnv(
      process.env.TELEGRAM_GIF_STUDENT_LESSON_ASSIGNED_FILE_ID,
    ),
    taskResultLowVideoFileId: normalizeOptionalEnv(
      process.env.TELEGRAM_VIDEO_STUDENT_TASK_RESULT_LOW_FILE_ID,
    ),
    taskResultPositiveVideoFileId: normalizeOptionalEnv(
      process.env.TELEGRAM_VIDEO_STUDENT_TASK_RESULT_POSITIVE_FILE_ID,
    ),
  },

  // Dev/prod-independent, off-by-default diagnostic handler for obtaining
  // Telegram file_id values. Not gated by nodeEnv — each bot (dev/prod) owns
  // its own token, so file_id must be registered through that same bot.
  mediaRegistration: {
    enabled: parseMediaRegistrationEnabled(
      process.env.TELEGRAM_MEDIA_REGISTRATION_ENABLED,
    ),
    adminIds: parsedAdminIds.ids,
    invalidAdminIdEntries: parsedAdminIds.invalidEntries,
  },
};
