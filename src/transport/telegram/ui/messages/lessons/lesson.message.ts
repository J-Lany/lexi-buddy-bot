import type { LessonAssignmentListItem } from "../../../../../domain/lessons/lessons.types.js";
import { isAssignmentDone } from "../../../../../domain/student-assignments/student-assignment-status.js";
import { uiMessage, uiMeta } from "../../helpers/ui.js";
import { copy } from "../../helpers/copy.js";

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
      copy.ui.common.title("📘", title),
      meta,
      "",
      copy.ui.lessons.lesson.emptyText,
      "",
      copy.ui.common.hint(copy.ui.lessons.lesson.emptyHint),
    ]);
  }

  const done = items.filter((x) => isAssignmentDone(x.status)).length;

  return uiMessage([
    copy.ui.common.title("📘", title),
    meta,
    "",
    copy.ui.common.labels.progress(done, items.length),
    "",
    copy.ui.lessons.lesson.chooseAssignment,
  ]);
}
