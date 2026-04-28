import type { BotContext } from "../../context.js";
import type { NavScreen } from "../../session.js";
import type { RenderScreenDeps } from "../types.js";

import { withLoadingScreen } from "../../helpers/with-loading.js";
import { safeEditScreen } from "../../helpers/edit-screen/safe-edit-screen.js";
import { withBreadcrumb } from "../../ui/messages/breadcrumbs.js";

import {
  lessonsListKeyboard,
  lessonsPaging,
} from "../../ui/keyboards/lessons.keyboard.js";
import { lessonsListMessage } from "../../ui/messages/lessons/lessons-list.message.js";

export async function renderLessonsListScreen(
  ctx: BotContext,
  deps: RenderScreenDeps,
  screen: NavScreen,
) {
  if (screen.name !== "lessons_list") return;

  const telegramId = ctx.from?.id;
  if (!telegramId) return;

  const items = await withLoadingScreen(ctx, () =>
    deps.lessons.listForStudent(telegramId),
  );

  ctx.session.ui.lessonsById = items.reduce<
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

  const { page, pages } = lessonsPaging(items.length, screen.page ?? 0);

  await safeEditScreen(
    ctx,
    withBreadcrumb(screen, lessonsListMessage({ items, page, pages })),
    {
      reply_markup: lessonsListKeyboard(items, page),
      parse_mode: "HTML",
    },
  );
}
