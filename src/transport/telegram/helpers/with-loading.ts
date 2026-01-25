import type { BotContext } from "../context.js";
import { safeEditScreen } from "./safe-edit-screen.js";

export async function withLoadingScreen<T>(
  ctx: BotContext,
  loader: () => Promise<T>,
): Promise<T> {
  if (ctx.callbackQuery) {
    await ctx.answerCallbackQuery().catch(() => {});
  }

  await safeEditScreen(ctx, "⌛️ Загружаю…", { reply_markup: undefined });

  return loader();
}
