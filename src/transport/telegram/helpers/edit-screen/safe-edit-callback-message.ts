import type { BotContext } from "../../context.js";
import type { InlineKeyboardMarkup } from "grammy/types";
import { getEditErrorKind } from "./get-edit-error-kind.js";

type EditOptions = {
  reply_markup?: InlineKeyboardMarkup;
  parse_mode?: "HTML";
};

export async function safeEditCallbackMessage(
  ctx: BotContext,
  text: string,
  options: EditOptions = {},
) {
  const chatId = ctx.chat?.id;
  const msgId = ctx.callbackQuery?.message?.message_id;

  if (!chatId || !msgId) {
    await ctx.reply(text, {
      ...options,
      parse_mode: options.parse_mode ?? "HTML",
    });
    return;
  }

  try {
    await ctx.api.editMessageText(chatId, msgId, text, {
      ...options,
      parse_mode: options.parse_mode ?? "HTML",
    });
  } catch (err) {
    const kind = getEditErrorKind(err);

    if (kind === "not_modified") return;
    if (kind !== "not_editable") throw err;

    await ctx.reply(text, {
      ...options,
      parse_mode: options.parse_mode ?? "HTML",
    });
  }
}
