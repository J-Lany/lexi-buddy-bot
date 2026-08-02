import type { BotContext } from "../../context.js";
import type { InlineKeyboardMarkup } from "grammy/types";
import { setTrackedScreenMessage } from "../screen-message-state.js";

type ScreenEditOptions = {
  reply_markup?: InlineKeyboardMarkup;
  parse_mode?: "HTML";
};

/**
 * Sends `text` as a brand-new message — never editing an older one — deletes
 * the previously-tracked screen message (if any), and re-points
 * ctx.session.ui.screenMessageId at the new message.
 *
 * Use this instead of safeEditScreen when other messages (e.g. overflow
 * teacher-comment/vocab content) were sent in between: editing the old
 * tracked message in place would leave it positioned BEFORE those newer
 * messages in the chat, even though it's meant to be the final, most recent
 * screen. Sending fresh and cleaning up the old message keeps the visible
 * chat order correct and avoids leaving a stale "loading…" placeholder.
 */
export async function replaceScreenMessage(
  ctx: BotContext,
  text: string,
  options: ScreenEditOptions = {},
) {
  const chatId = ctx.chat?.id;
  const previousMessageId = ctx.session.ui.screenMessageId;

  const msg = await ctx.reply(text, {
    ...options,
    parse_mode: options.parse_mode ?? "HTML",
  });
  setTrackedScreenMessage(ctx, msg.message_id, "text");

  if (chatId && previousMessageId && previousMessageId !== msg.message_id) {
    await ctx.api.deleteMessage(chatId, previousMessageId).catch(() => {});
  }
}
