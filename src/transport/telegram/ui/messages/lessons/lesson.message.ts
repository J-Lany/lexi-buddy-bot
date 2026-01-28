import type { LessonAssignmentListItem } from "../../../../../domain/lessons/lessons.types.js";
import { isAssignmentDone } from "../../../../../domain/student-assignments/student-assignment-status.js";

export function lessonMessage(params: {
  lessonId: number;
  items: LessonAssignmentListItem[];
}) {
  const { lessonId, items } = params;

  if (items.length === 0) {
    return [`📘 Урок #${lessonId}`, "", "В этом уроке пока нет заданий."].join(
      "\n",
    );
  }

  const done = items.filter((x) => isAssignmentDone(x.status)).length;

  return [
    `📘 Урок #${lessonId}`,
    "",
    `Прогресс: ${done}/${items.length}`,
    "",
    "Выбери задание 👇",
  ].join("\n");
}
