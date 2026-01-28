import type { BotContext } from "../../context.js";
import type { NavScreen } from "../../session.js";
import type { RenderScreenDeps } from "../types.js";

import { safeEditScreen } from "../../helpers/safe-edit-screen.js";
import { withBreadcrumb } from "../../ui/messages/breadcrumbs.js";
import { homeMessage } from "../../ui/messages/home.messages.js";
import { mainInlineKeyboard } from "../../ui/keyboards/main-inline.keyboard.js";

export async function renderHomeScreen(
  ctx: BotContext,
  _deps: RenderScreenDeps,
  screen: NavScreen,
) {
  if (screen.name !== "home") return;

  const banner = ctx.session.ui.bannerText ?? null;
  ctx.session.ui.bannerText = null;

  const body = banner
    ? `${banner}\n\n${homeMessage(ctx.from?.first_name ?? null)}`
    : homeMessage(ctx.from?.first_name ?? null);

  await safeEditScreen(ctx, withBreadcrumb(screen, body), {
    reply_markup: mainInlineKeyboard(),
  });
}
