import type { BotContext } from "../context.js";
import type { InlineKeyboardMarkup } from "grammy/types";

export async function sendChat(
  ctx: BotContext,
  text: string,
  opts: { reply_markup?: InlineKeyboardMarkup; parse_mode?: "HTML" } = {},
) {
  await ctx.reply(text, opts);
}
