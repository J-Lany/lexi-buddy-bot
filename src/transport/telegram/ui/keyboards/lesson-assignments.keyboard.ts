import { InlineKeyboard } from "grammy";
import { isAssignmentDone } from "../../../../domain/student-assignments/student-assignment-status.js";
import { type LessonAssignmentListItem } from "../../../../domain/lessons/lessons.types.js";
import { ASSIGNMENT_TYPE_MAP } from "../../../../infra/backend-api/backend-api.maps.js";
import type { Translator } from "../helpers/copy.js";

function statusIcon(isDone: boolean) {
  return isDone ? "✅" : "⏳";
}

export function lessonAssignmentsKeyboard(
  t: Translator,
  items: LessonAssignmentListItem[],
) {
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

  kb.text(t("kb-back-to-lessons"), "nav:back").text(t("kb-menu"), "nav:home");

  return kb;
}
