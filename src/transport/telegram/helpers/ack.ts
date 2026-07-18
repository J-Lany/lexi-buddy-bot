import type { BotContext } from "../context.js";

export async function ack(ctx: BotContext, text?: string) {
  if (!ctx.callbackQuery) return;
  await ctx.answerCallbackQuery(text ? { text } : undefined).catch(() => {});
}
