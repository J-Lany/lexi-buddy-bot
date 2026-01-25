import type { BotContext } from "../context.js";
import type { LessonsService } from "../../../domain/lessons/lessons.service.js";
import type { ProfileService } from "../../../domain/profile/profile.service.js";
import type { NavScreen } from "../session.js";

import { withLoadingScreen } from "./with-loading.js";
import { safeEditScreen } from "./safe-edit-screen.js";

import { lessonsHeader } from "../ui/messages/lessons.messages.js";
import { lessonsListKeyboard } from "../ui/keyboards/lessons.keyboard.js";
import { lessonAssignmentsHeader } from "../ui/messages/lesson-assignments.messages.js";
import { lessonAssignmentsKeyboard } from "../ui/keyboards/lesson-assignments.keyboard.js";
import { profileMessage } from "../ui/messages/profile.messages.js";
import { helpMessage } from "../ui/messages/help.messages.js";

import { mainInlineKeyboard } from "../ui/keyboards/main-inline.keyboard.js";

export async function renderScreen(
  ctx: BotContext,
  deps: { lessons: LessonsService; profile: ProfileService },
  screen: NavScreen,
) {
  const telegramId = ctx.from?.id;
  if (!telegramId) return;

  if (screen.name === "lessons_list") {
    const items = await withLoadingScreen(ctx, () =>
      deps.lessons.listForStudent(telegramId),
    );

    const text =
      items.length === 0 ? lessonsHeader(0) : lessonsHeader(items.length);

    const reply_markup =
      items.length === 0 ? mainInlineKeyboard() : lessonsListKeyboard(items);

    await safeEditScreen(ctx, text, { reply_markup });
    return;
  }

  if (screen.name === "lesson") {
    const items = await withLoadingScreen(ctx, () =>
      deps.lessons.listAssignmentsForStudent(telegramId, screen.lessonId),
    );

    await safeEditScreen(ctx, lessonAssignmentsHeader(screen.lessonId, items), {
      reply_markup: lessonAssignmentsKeyboard(items),
    });
    return;
  }

  if (screen.name === "assignment") {
    await withLoadingScreen(ctx, async () => true);

    await safeEditScreen(
      ctx,
      `📝 Задание #${screen.assignmentId}\n\n(дальше тут будет прохождение задания)`,
      { reply_markup: mainInlineKeyboard() },
    );
    return;
  }

  if (screen.name === "profile") {
    const data = await withLoadingScreen(ctx, () =>
      deps.profile.get(telegramId),
    );

    await safeEditScreen(ctx, profileMessage(data), {
      reply_markup: mainInlineKeyboard(),
    });
    return;
  }

  if (screen.name === "help") {
    await withLoadingScreen(ctx, async () => true);

    await safeEditScreen(ctx, helpMessage(), {
      reply_markup: mainInlineKeyboard(),
    });
  }
}
