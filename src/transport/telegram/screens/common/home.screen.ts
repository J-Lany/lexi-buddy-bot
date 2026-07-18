import type { BotContext } from "../../context.js";
import type { NavScreen } from "../../session.js";
import type { RenderScreenDeps } from "../types.js";

import { safeEditScreen } from "../../helpers/edit-screen/safe-edit-screen.js";
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
    ? `${banner}`
    : homeMessage(ctx.t, ctx.from?.first_name ?? null);

  await safeEditScreen(ctx, withBreadcrumb(ctx.t, screen, body), {
    reply_markup: mainInlineKeyboard(ctx.t),
    parse_mode: "HTML",
  });
}
