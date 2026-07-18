import type { BotContext } from "../../context.js";
import type { InlineKeyboardMarkup } from "grammy/types";
import { getEditErrorKind } from "./get-edit-error-kind.js";

type ScreenEditOptions = {
  reply_markup?: InlineKeyboardMarkup;
  parse_mode?: "HTML";
};

export async function safeEditScreen(
  ctx: BotContext,
  text: string,
  options: ScreenEditOptions = {},
) {
  const chatId = ctx.chat?.id;
  const screenMessageId = ctx.session.ui.screenMessageId;

  if (chatId && screenMessageId) {
    try {
      await ctx.api.editMessageText(chatId, screenMessageId, text, {
        ...options,
        parse_mode: options.parse_mode ?? "HTML",
      });
      return;
    } catch (err) {
      const kind = getEditErrorKind(err);

      if (kind === "not_modified") return;
      if (kind !== "not_editable") throw err;
    }
  }

  const msg = await ctx.reply(text, {
    ...options,
    parse_mode: options.parse_mode ?? "HTML",
  });
  ctx.session.ui.screenMessageId = msg.message_id;
}
