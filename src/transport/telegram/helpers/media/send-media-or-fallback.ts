import type { Api } from "grammy";
import type { InlineKeyboardMarkup } from "grammy/types";

import { logWarn } from "../../../../observability/logger.js";
import { isMediaFileError } from "./is-media-file-error.js";
import { TELEGRAM_MEDIA_CAPTION_SAFE_LENGTH } from "./caption-limits.js";

type MediaKind = "animation" | "video";

/**
 * Passed through as-is to sendAnimation/sendVideo — this helper never
 * invents or defaults parse_mode itself. The caller must pass whatever
 * parse_mode the existing text call site effectively sends today (directly,
 * or via a helper's own default, e.g. safeEditScreen's `?? "HTML"`).
 */
type MediaSendOptions = {
  parse_mode?: "HTML";
  reply_markup?: InlineKeyboardMarkup;
};

export async function sendMediaOrFallback(params: {
  api: Api;
  /** Caller-resolved chat id. A missing chat id is a call-site bug, not a
   * runtime fallback case — resolve it (or bail out) before calling this. */
  chatId: number | string;
  fileId: string | undefined;
  kind: MediaKind;
  caption: string;
  options?: MediaSendOptions;
  /** Message to delete after a successful media send (Screen-mode scenarios only). */
  previousMessageId?: number | undefined;
  /** Called with the new message id right after a successful media send,
   * before the previousMessageId cleanup — e.g. to re-point
   * ctx.session.ui.screenMessageId. */
  onSent?: (messageId: number) => void;
  /** The exact same call the code makes today when there's no media — the
   * single source of truth for "no media" behavior. */
  fallback: () => Promise<void>;
  /** For logs only. */
  event: string;
}): Promise<void> {
  if (
    !params.fileId ||
    params.caption.length > TELEGRAM_MEDIA_CAPTION_SAFE_LENGTH
  ) {
    await params.fallback();
    return;
  }

  let sent: { message_id: number };

  // try/catch scoped to ONLY the send call — a failure here, and only here,
  // is what "media didn't work, fall back to text" means.
  try {
    sent =
      params.kind === "animation"
        ? await params.api.sendAnimation(params.chatId, params.fileId, {
            caption: params.caption,
            ...params.options,
          })
        : await params.api.sendVideo(params.chatId, params.fileId, {
            caption: params.caption,
            ...params.options,
          });
  } catch (err) {
    if (!isMediaFileError(err)) throw err;

    logWarn("student_media_send_failed", {
      event: params.event,
      kind: params.kind,
      error: err instanceof Error ? err.message : String(err),
    });

    await params.fallback();
    return;
  }

  // Media is already delivered — we are committed. Anything that fails from
  // here on (session bookkeeping, cleanup) must propagate as a real error
  // and must NEVER trigger fallback(): that would send a duplicate text
  // message on top of an already-successful media message.
  params.onSent?.(sent.message_id);

  if (
    params.previousMessageId !== undefined &&
    params.previousMessageId !== sent.message_id
  ) {
    await params.api
      .deleteMessage(params.chatId, params.previousMessageId)
      .catch(() => {
        // best-effort cleanup only — a failed delete doesn't affect the
        // already-delivered media message and must not throw or retry
      });
  }
}
