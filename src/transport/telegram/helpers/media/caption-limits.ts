/**
 * Telegram's real media caption limit is 1024 characters; this keeps a
 * margin below it. Text over this length never attempts a media send at
 * all — it falls straight back to the existing plain-text message, in full,
 * uncut. Mirrors TELEGRAM_SAFE_MESSAGE_LENGTH's approach for full messages.
 */
export const TELEGRAM_MEDIA_CAPTION_SAFE_LENGTH = 1000;
