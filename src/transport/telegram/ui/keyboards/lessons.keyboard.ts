import { InlineKeyboard } from "grammy";
import type { StudentLessonListItem } from "../../../../domain/lessons/lessons.types.js";
import type { Translator } from "../helpers/copy.js";

const PAGE_SIZE = 8;

export function lessonsListKeyboard(
  t: Translator,
  items: StudentLessonListItem[],
  page: number,
) {
  const kb = new InlineKeyboard();

  const total = items.length;
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const current = Math.min(Math.max(0, page), pages - 1);

  const start = current * PAGE_SIZE;
  const slice = items.slice(start, start + PAGE_SIZE);

  for (const lesson of slice) {
    const label = lesson.level
      ? `${lesson.title} (${lesson.level})`
      : lesson.title;
    kb.text(label, `lesson_open:${lesson.lessonId}`).row();
  }

  const hasPrev = current > 0;
  const hasNext = current < pages - 1;

  if (hasPrev || hasNext) {
    if (hasPrev) kb.text(t("kb-lessons-prev"), `lessons_page:${current - 1}`);
    if (hasNext) kb.text(t("kb-lessons-next"), `lessons_page:${current + 1}`);
    kb.row();
  }

  kb.text(t("kb-back"), "nav:back").text(t("kb-menu"), "nav:home");

  return kb;
}

export function lessonsPaging(total: number, page: number) {
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const current = Math.min(Math.max(0, page), pages - 1);
  return { page: current, pages, pageSize: PAGE_SIZE };
}
