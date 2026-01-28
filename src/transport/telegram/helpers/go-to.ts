import type { BotContext } from "../context.js";
import type { NavScreen } from "../session.js";
import type { RenderScreenDeps } from "../screens/types.js";

import {
  navPeek,
  navReset,
  navPush,
  isAssignmentScreenName,
  navReplaceTop,
} from "./nav.js";
import { renderScreen } from "./render-screen.js";
import { clearAssignmentRun } from "./clear-assignment-run.js";
import { ensureScreenMode } from "./begin-new-screen.js";

type ClearRunMode = "always" | "ifLeavingAssignment" | "never";
type NavMode = "reset" | "push" | "replaceTop";

export async function goTo(
  ctx: BotContext,
  deps: RenderScreenDeps,
  next: NavScreen,
  opts: {
    navMode?: NavMode;
    clearAssignmentRun?: ClearRunMode;
  } = {},
) {
  const navMode = opts.navMode ?? "reset";
  const clearMode: ClearRunMode =
    opts.clearAssignmentRun ?? "ifLeavingAssignment";

  const before = navPeek(ctx) ?? { name: "home" as const };

  ensureScreenMode(ctx, next);

  if (clearMode !== "never") {
    const leavingAssignment =
      isAssignmentScreenName(before.name) && !isAssignmentScreenName(next.name);

    const shouldClear = clearMode === "always" ? true : leavingAssignment;
    if (shouldClear) clearAssignmentRun(ctx);
  }

  if (navMode === "reset") {
    navReset(ctx, { name: "home" });
    if (next.name !== "home") navPush(ctx, next);
  } else if (navMode === "push") {
    navPush(ctx, next);
  } else {
    navReplaceTop(ctx, next);
  }

  await renderScreen(ctx, deps, next);
}
