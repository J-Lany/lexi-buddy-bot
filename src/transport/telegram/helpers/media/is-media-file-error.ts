import { GrammyError } from "grammy";

const MEDIA_FILE_ERROR_PATTERNS = [
  "wrong file identifier",
  "wrong remote file id",
  "failed to get http url content",
  "can't parse inputmedia",
  "caption is too long",
];

/**
 * True only for Telegram errors that are actually about this specific
 * file_id/media send (bad/stale file_id, unreachable remote file, oversized
 * caption). Anything else — blocked-by-user, rate limits, network, 5xx —
 * must be rethrown, not treated as "safe to fall back to text".
 */
export function isMediaFileError(err: unknown): boolean {
  if (!(err instanceof GrammyError)) return false;
  if (err.error_code !== 400) return false;

  const description = err.description.toLowerCase();
  return MEDIA_FILE_ERROR_PATTERNS.some((pattern) =>
    description.includes(pattern),
  );
}
