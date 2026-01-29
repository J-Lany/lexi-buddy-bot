import type { BotContext } from "../context.js";
import type { InlineKeyboardMarkup } from "grammy/types";

type ScreenEditOptions = {
  reply_markup?: InlineKeyboardMarkup;
  parse_mode?: "HTML";
};

function isIgnorableEditError(err: unknown): boolean {
  const e = err as { description?: string; message?: string };
  const msg = `${e?.description ?? ""} ${e?.message ?? ""}`.toLowerCase();

  return (
    msg.includes("message is not modified") ||
    msg.includes("message to edit not found") ||
    msg.includes("can't be edited") ||
    msg.includes("message can't be edited")
  );
}

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
      if (!isIgnorableEditError(err)) throw err;
    }
  }

  const msg = await ctx.reply(text, {
    ...options,
    parse_mode: options.parse_mode ?? "HTML",
  });
  ctx.session.ui.screenMessageId = msg.message_id;
}
