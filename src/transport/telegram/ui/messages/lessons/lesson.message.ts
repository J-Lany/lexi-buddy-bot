import type { LessonAssignmentListItem } from "../../../../../domain/lessons/lessons.types.js";
import { isAssignmentDone } from "../../../../../domain/student-assignments/student-assignment-status.js";
import { uiHint, uiMessage, uiTitle, uiMeta } from "../../helpers/ui.js";

export function lessonMessage(params: {
  lessonId: number;
  lessonTitle?: string | null;
  topic?: string | null;
  level?: string | null;
  items: LessonAssignmentListItem[];
}) {
  const { lessonId, lessonTitle, topic, level, items } = params;

  const title = lessonTitle?.trim() ? lessonTitle.trim() : `Урок #${lessonId}`;
  const meta = uiMeta([topic ?? null, level ?? null]);

  if (items.length === 0) {
    return uiMessage([
      uiTitle("📘", title),
      meta,
      "",
      "В этом уроке пока нет заданий.",
      "",
      uiHint("Если ожидаешь задания — уточни у преподавателя 🙂"),
    ]);
  }

  const done = items.filter((x) => isAssignmentDone(x.status)).length;

  return uiMessage([
    uiTitle("📘", title),
    meta,
    "",
    `Прогресс: <b>${done}/${items.length}</b>`,
    "",
    "Выбери задание 👇",
  ]);
}
