import type { BotContext } from "../context.js";
import type { InlineKeyboardMarkup } from "grammy/types";

export async function sendChat(
  ctx: BotContext,
  text: string,
  opts: { reply_markup?: InlineKeyboardMarkup } = {},
) {
  await ctx.reply(text, opts);
}
