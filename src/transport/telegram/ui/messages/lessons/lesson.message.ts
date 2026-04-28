import type { LessonAssignmentListItem } from "../../../../../domain/lessons/lessons.types.js";
import { isAssignmentDone } from "../../../../../domain/student-assignments/student-assignment-status.js";
import { uiMessage, uiMeta, uiTitle } from "../../helpers/ui.js";
import type { Translator } from "../../helpers/copy.js";

export function lessonMessage(
  t: Translator,
  params: {
    lessonId: number;
    lessonTitle?: string | null;
    topic?: string | null;
    level?: string | null;
    items: LessonAssignmentListItem[];
  },
) {
  const { lessonId, lessonTitle, topic, level, items } = params;

  const title = lessonTitle?.trim() || `${t("nav-lessons")} #${lessonId}`;
  const meta = uiMeta([topic ?? null, level ?? null]);

  if (items.length === 0) {
    return uiMessage([
      uiTitle("📘", title),
      meta,
      "",
      t("lesson-empty"),
      "",
      t("lesson-empty-hint"),
    ]);
  }

  const done = items.filter((x) => isAssignmentDone(x.status)).length;

  return uiMessage([
    uiTitle("📘", title),
    meta,
    "",
    t("progress", { done, total: items.length }),
    "",
    t("lesson-choose"),
  ]);
}
