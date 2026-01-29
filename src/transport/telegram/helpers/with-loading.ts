import type { BotContext } from "../context.js";
import { safeEditScreen } from "./safe-edit-screen.js";
import { copy } from "../ui/helpers/copy.js";

export async function withLoadingScreen<T>(
  ctx: BotContext,
  loader: () => Promise<T>,
): Promise<T> {
  await safeEditScreen(ctx, copy.ui.common.loading);

  return loader();
}
