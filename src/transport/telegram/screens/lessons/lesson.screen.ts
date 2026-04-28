import type { BotContext } from "../../context.js";
import type { NavScreen } from "../../session.js";
import type { RenderScreenDeps } from "../types.js";

import { withLoadingScreen } from "../../helpers/with-loading.js";
import { safeEditScreen } from "../../helpers/edit-screen/safe-edit-screen.js";
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

  let meta = ctx.session.ui.lessonsById?.[screen.lessonId];

  if (!meta) {
    const lessons = await deps.lessons.listForStudent(telegramId);

    ctx.session.ui.lessonsById = lessons.reduce<
      NonNullable<BotContext["session"]["ui"]["lessonsById"]>
    >((acc, l) => {
      acc[l.lessonId] = {
        title: l.title,
        targetLanguage: l.targetLanguage,
        nativeLanguage: l.nativeLanguage,
        topic: l.topic ?? null,
        level: l.level ?? null,
      };
      return acc;
    }, {});

    meta = ctx.session.ui.lessonsById?.[screen.lessonId];
  }

  const items = await withLoadingScreen(ctx, () =>
    deps.lessons.listAssignmentsForStudent(telegramId, screen.lessonId),
  );

  await safeEditScreen(
    ctx,
    withBreadcrumb(
      ctx.t,
      screen,
      lessonMessage(ctx.t, {
        lessonId: screen.lessonId,
        lessonTitle: meta?.title ?? null,
        topic: meta?.topic ?? null,
        level: meta?.level ?? null,
        items,
      }),
      { lessonTitle: meta?.title ?? null },
    ),

    {
      reply_markup: lessonAssignmentsKeyboard(ctx.t, items),
      parse_mode: "HTML",
    },
  );
}
