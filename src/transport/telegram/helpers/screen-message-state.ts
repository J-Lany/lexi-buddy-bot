import type { BotContext } from "../context.js";

/**
 * Single write path for ctx.session.ui.screenMessageId /
 * screenMessageKind — the two fields must always change together so
 * safeEditScreen can trust screenMessageKind to reflect what
 * screenMessageId actually points to.
 */
export function setTrackedScreenMessage(
  ctx: BotContext,
  messageId: number,
  kind: "text" | "media",
) {
  ctx.session.ui.screenMessageId = messageId;
  ctx.session.ui.screenMessageKind = kind;
}

export function clearTrackedScreenMessage(ctx: BotContext) {
  ctx.session.ui.screenMessageId = undefined;
  ctx.session.ui.screenMessageKind = undefined;
}
