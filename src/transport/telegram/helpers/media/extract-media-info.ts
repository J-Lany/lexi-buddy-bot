import type { Message } from "grammy/types";

const USABLE_DOCUMENT_MIME_TYPES = new Set(["image/gif", "video/mp4"]);

export type ExtractedMediaInfo = {
  type: "animation" | "video" | "document";
  fileId: string;
  fileUniqueId: string;
  mimeType: string | null;
  fileName: string | null;
  /**
   * False only for "document" — a file_id obtained from a document upload
   * is not guaranteed to work with sendAnimation/sendVideo (it depends on
   * how the file was originally uploaded to Telegram's servers), so it must
   * never be presented as a ready-to-use value for the media env vars.
   */
  usableForMediaEnv: boolean;
};

/** Pure parser — no ctx, no Telegram API calls, easy to unit test. */
export function extractMediaInfo(msg: Message): ExtractedMediaInfo | null {
  if (msg.animation) {
    return {
      type: "animation",
      fileId: msg.animation.file_id,
      fileUniqueId: msg.animation.file_unique_id,
      mimeType: msg.animation.mime_type ?? null,
      fileName: msg.animation.file_name ?? null,
      usableForMediaEnv: true,
    };
  }

  if (msg.video) {
    return {
      type: "video",
      fileId: msg.video.file_id,
      fileUniqueId: msg.video.file_unique_id,
      mimeType: msg.video.mime_type ?? null,
      fileName: msg.video.file_name ?? null,
      usableForMediaEnv: true,
    };
  }

  if (msg.document) {
    const mimeType = msg.document.mime_type;
    if (!mimeType || !USABLE_DOCUMENT_MIME_TYPES.has(mimeType)) return null;

    return {
      type: "document",
      fileId: msg.document.file_id,
      fileUniqueId: msg.document.file_unique_id,
      mimeType,
      fileName: msg.document.file_name ?? null,
      usableForMediaEnv: false,
    };
  }

  return null;
}
