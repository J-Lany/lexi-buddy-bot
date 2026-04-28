import type { BotContext } from "../context.js";
import { safeEditScreen } from "./edit-screen/safe-edit-screen.js";

export async function withLoadingScreen<T>(
  ctx: BotContext,
  loader: () => Promise<T>,
): Promise<T> {
  await safeEditScreen(ctx, ctx.t("loading"));

  return loader();
}
