import { isAssignmentDone } from "../../../../domain/student-assignments/student-assignment-status.js";
import type { LessonAssignmentListItem } from "../../../../domain/lessons/lessons.types.js";

export function lessonAssignmentsHeader(
  lessonId: number,
  items: LessonAssignmentListItem[],
) {
  const total = items.length;
  const done = items.filter((x) => isAssignmentDone(x.status)).length;

  if (total === 0) {
    return `📘 Урок #${lessonId}\n\nВ этом уроке пока нет заданий.`;
  }

  return `📘 Урок #${lessonId}\n\nПрогресс: ${done}/${total}\n\nВыбери задание:`;
}
