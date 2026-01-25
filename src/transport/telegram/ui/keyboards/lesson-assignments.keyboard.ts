import { InlineKeyboard } from "grammy";
import { isAssignmentDone } from "../../../../domain/student-assignments/student-assignment-status.js";
import type { LessonAssignmentListItem } from "../../../../domain/lessons/lessons.types.js";

function statusIcon(isDone: boolean) {
  return isDone ? "✅" : "⏳";
}

export function lessonAssignmentsKeyboard(items: LessonAssignmentListItem[]) {
  const kb = new InlineKeyboard();

  for (const a of items) {
    const done = isAssignmentDone(a.status);
    kb.text(
      `${statusIcon(done)} ${a.type}`,
      `assignment_open:${a.assignmentId}`,
    ).row();
  }

  kb.text("⬅️ Назад к урокам", "nav:back").text("🏠 Меню", "nav:home");

  return kb;
}
