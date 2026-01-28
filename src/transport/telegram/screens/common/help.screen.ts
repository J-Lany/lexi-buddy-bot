import type { BotContext } from "../../context.js";
import type { NavScreen } from "../../session.js";
import type { RenderScreenDeps } from "../types.js";

import { safeEditScreen } from "../../helpers/safe-edit-screen.js";
import { withBreadcrumb } from "../../ui/messages/breadcrumbs.js";
import { helpMessage } from "../../ui/messages/help.messages.js";
import { mainInlineKeyboard } from "../../ui/keyboards/main-inline.keyboard.js";

export async function renderHelpScreen(
  ctx: BotContext,
  _deps: RenderScreenDeps,
  screen: NavScreen,
) {
  if (screen.name !== "help") return;

  await safeEditScreen(ctx, withBreadcrumb(screen, helpMessage()), {
    reply_markup: mainInlineKeyboard(),
    parse_mode: "HTML",
  });
}
