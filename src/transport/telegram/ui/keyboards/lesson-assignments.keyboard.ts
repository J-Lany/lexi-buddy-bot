import { InlineKeyboard } from "grammy";
import { isAssignmentDone } from "../../../../domain/student-assignments/student-assignment-status.js";
import {
  ASSIGNMENT_TYPE_MAP,
  type LessonAssignmentListItem,
} from "../../../../domain/lessons/lessons.types.js";
import { copy } from "../helpers/copy.js";

function statusIcon(isDone: boolean) {
  return isDone ? "✅" : "⏳";
}

export function lessonAssignmentsKeyboard(items: LessonAssignmentListItem[]) {
  const kb = new InlineKeyboard();

  for (const a of items) {
    const done = isAssignmentDone(a.status);
    kb.text(
      `${statusIcon(done)} ${ASSIGNMENT_TYPE_MAP[a.type]}`,
      `assignment_open:${a.assignmentId}`,
    ).row();
  }

  kb.text(copy.kb.nav.backToLessons, "nav:back").text(
    copy.kb.nav.menu,
    "nav:home",
  );

  return kb;
}
