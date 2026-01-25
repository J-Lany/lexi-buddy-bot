import { InlineKeyboard } from "grammy";
import type { StudentLessonListItem } from "../../../../domain/lessons/lessons.types.js";

const PAGE_SIZE = 8;

export function lessonsListKeyboard(
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
    if (hasPrev) kb.text("⬅️ Пред.", `lessons_page:${current - 1}`);
    if (hasNext) kb.text("След. ➡️", `lessons_page:${current + 1}`);
    kb.row();
  }

  kb.text("⬅️ Назад", "nav:back").text("🏠 Меню", "nav:home");

  return kb;
}

export function lessonsPaging(total: number, page: number) {
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const current = Math.min(Math.max(0, page), pages - 1);
  return { page: current, pages, pageSize: PAGE_SIZE };
}
