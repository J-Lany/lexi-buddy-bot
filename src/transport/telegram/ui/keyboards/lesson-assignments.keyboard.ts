import { InlineKeyboard } from "grammy";
import { isAssignmentDone } from "../../../../domain/student-assignments/student-assignment-status.js";
import { type LessonAssignmentListItem } from "../../../../domain/lessons/lessons.types.js";
import { copy } from "../helpers/copy.js";
import { ASSIGNMENT_TYPE_MAP } from "../../../../infra/backend-api/backend-api.maps.js";

function statusIcon(isDone: boolean) {
  return isDone ? "✅" : "⏳";
}

export function lessonAssignmentsKeyboard(items: LessonAssignmentListItem[]) {
  const kb = new InlineKeyboard();

  for (const a of items) {
    const done = isAssignmentDone(a.status);
    const typeLabel =
      (ASSIGNMENT_TYPE_MAP as Record<string, string>)[a.type] ?? "Task";
    kb.text(
      `${statusIcon(done)} ${typeLabel}`,
      `assignment_open:${a.assignmentId}`,
    ).row();
  }

  kb.text(copy.kb.nav.backToLessons, "nav:back").text(
    copy.kb.nav.menu,
    "nav:home",
  );

  return kb;
}
