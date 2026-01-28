import type { BotContext } from "../../context.js";
import type { NavScreen } from "../../session.js";
import type { RenderScreenDeps } from "../types.js";

import { withLoadingScreen } from "../../helpers/with-loading.js";
import { safeEditScreen } from "../../helpers/safe-edit-screen.js";
import { withBreadcrumb } from "../../ui/messages/breadcrumbs.js";

import { assignmentIntroKeyboard } from "../../ui/keyboards/assignment.keyboard.js";
import { assignmentIntroMessage } from "../../ui/messages/assignments/assignment-intro.message.js";

export async function renderAssignmentIntroScreen(
  ctx: BotContext,
  deps: RenderScreenDeps,
  screen: NavScreen,
) {
  if (screen.name !== "assignment_intro") return;

  const telegramId = ctx.from?.id;
  if (!telegramId) return;

  const a = await withLoadingScreen(ctx, () =>
    deps.studentAssignments.preview(telegramId, screen.assignmentId),
  );

  await safeEditScreen(ctx, withBreadcrumb(screen, assignmentIntroMessage(a)), {
    reply_markup: assignmentIntroKeyboard(),
    parse_mode: "HTML",
  });
}
