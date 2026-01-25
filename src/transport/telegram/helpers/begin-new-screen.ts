import type { BotContext } from "../context.js";

export function beginNewScreen(ctx: BotContext) {
  ctx.session.ui.screenMessageId = undefined;
}
