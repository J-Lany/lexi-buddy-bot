import type { BotContext } from "../../context.js";
import type { NavScreen } from "../../session.js";
import type { RenderScreenDeps } from "../types.js";

import { withLoadingScreen } from "../../helpers/with-loading.js";
import { safeEditScreen } from "../../helpers/safe-edit-screen.js";
import { withBreadcrumb } from "../../ui/messages/breadcrumbs.js";

import { lessonAssignmentsKeyboard } from "../../ui/keyboards/lesson-assignments.keyboard.js";
import { lessonMessage } from "../../ui/messages/lessons/lesson.message.js";

export async function renderLessonScreen(
  ctx: BotContext,
  deps: RenderScreenDeps,
  screen: NavScreen,
) {
  if (screen.name !== "lesson") return;

  const telegramId = ctx.from?.id;
  if (!telegramId) return;

  const items = await withLoadingScreen(ctx, () =>
    deps.lessons.listAssignmentsForStudent(telegramId, screen.lessonId),
  );

  await safeEditScreen(
    ctx,
    withBreadcrumb(screen, lessonMessage({ lessonId: screen.lessonId, items })),
    { reply_markup: lessonAssignmentsKeyboard(items) },
  );
}
