import type { BotContext } from "../context.js";
import type { InlineKeyboardMarkup } from "grammy/types";

type EditOptions = {
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
    if (!isIgnorableEditError(err)) throw err;
    await ctx.reply(text, {
      ...options,
      parse_mode: options.parse_mode ?? "HTML",
    });
  }
}
