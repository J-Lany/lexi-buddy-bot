import type { Bot } from "grammy";
import type { BotContext } from "../context.js";

import { env } from "../../../config/env.js";
import { extractMediaInfo } from "../helpers/media/extract-media-info.js";
import { logInfo } from "../../../observability/logger.js";

const UNUSABLE_DOCUMENT_HINT =
  'This file_id came from a document upload — it is not guaranteed to work with sendAnimation/sendVideo. Resend this file as an animation or a video (not "as file"), then use that file_id.';

/**
 * Optional, off-by-default diagnostic handler for obtaining Telegram
 * file_id values for the student media env vars. Always registered — the
 * flag + allowlist are checked at runtime on every update, so toggling it
 * only needs an env change + service restart, no new release. Not gated by
 * NODE_ENV: dev and prod are different bot tokens, so file_id must be
 * obtained through whichever bot it will actually be used with.
 */
export function registerMediaRegistrationRoutes(bot: Bot<BotContext>) {
  bot.on(
    ["message:animation", "message:video", "message:document"],
    async (ctx, next) => {
      if (!env.mediaRegistration.enabled) {
        await next();
        return;
      }

      const userId = ctx.from?.id;
      if (!userId || !env.mediaRegistration.adminIds.has(userId)) {
        // Silent — indistinguishable from a bot with no such handler at
        // all, which is exactly what an unauthorized sender sees today.
        await next();
        return;
      }

      const info = extractMediaInfo(ctx.message);
      if (!info) {
        await ctx.reply(
          "Unsupported document type — expected image/gif or video/mp4.",
        );
        return;
      }

      logInfo("media_registration_info", {
        media_type: info.type,
        file_id: info.fileId,
        file_unique_id: info.fileUniqueId,
        mime_type: info.mimeType,
        file_name: info.fileName,
        usable_for_media_env: info.usableForMediaEnv,
      });

      const lines = [
        `type: ${info.type}`,
        `file_id: ${info.fileId}`,
        `file_unique_id: ${info.fileUniqueId}`,
        `mime_type: ${info.mimeType ?? "—"}`,
        `file_name: ${info.fileName ?? "—"}`,
      ];

      if (!info.usableForMediaEnv) {
        lines.push(`usable_for_media_env: false`, UNUSABLE_DOCUMENT_HINT);
      }

      await ctx.reply(lines.join("\n"));
    },
  );
}
