import { InlineKeyboard } from "grammy";
import type { StudentLessonListItem } from "../../../../domain/lessons/lessons.types.js";

export function lessonsListKeyboard(items: StudentLessonListItem[]) {
  const kb = new InlineKeyboard();

  for (const lesson of items.slice(0, 20)) {
    const label = lesson.level
      ? `${lesson.title} (${lesson.level})`
      : lesson.title;
    kb.text(label, `lesson_open:${lesson.lessonId}`).row();
  }

  return kb;
}
