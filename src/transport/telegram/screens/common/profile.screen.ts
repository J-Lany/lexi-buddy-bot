import type { BotContext } from "../../context.js";
import type { NavScreen } from "../../session.js";
import type { RenderScreenDeps } from "../types.js";

import { withLoadingScreen } from "../../helpers/with-loading.js";
import { safeEditScreen } from "../../helpers/safe-edit-screen.js";
import { withBreadcrumb } from "../../ui/messages/breadcrumbs.js";
import { mainInlineKeyboard } from "../../ui/keyboards/main-inline.keyboard.js";
import { profileMessage } from "../../ui/messages/profile.messages.js";

export async function renderProfileScreen(
  ctx: BotContext,
  deps: RenderScreenDeps,
  screen: NavScreen,
) {
  if (screen.name !== "profile") return;

  const telegramId = ctx.from?.id;
  if (!telegramId) return;

  const data = await withLoadingScreen(ctx, () => deps.profile.get(telegramId));

  await safeEditScreen(ctx, withBreadcrumb(screen, profileMessage(data)), {
    reply_markup: mainInlineKeyboard(),
    parse_mode: "HTML",
  });
}
