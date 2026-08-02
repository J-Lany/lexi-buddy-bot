import type { BotContext } from "../context.js";
import type { NavScreen } from "../session.js";
import { isAssignmentScreenName, navPeek } from "./nav.js";
import { clearTrackedScreenMessage } from "./screen-message-state.js";

export function beginNewScreen(ctx: BotContext) {
  clearTrackedScreenMessage(ctx);
}

export function ensureScreenMode(ctx: BotContext, next: NavScreen) {
  const before = navPeek(ctx);
  if (!before) return;

  const wasAssignment = isAssignmentScreenName(before.name);
  const willBeAssignment = isAssignmentScreenName(next.name);

  if (wasAssignment !== willBeAssignment) {
    beginNewScreen(ctx);
  }
}
