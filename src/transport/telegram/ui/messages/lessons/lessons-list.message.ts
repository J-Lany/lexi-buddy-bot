import type { StudentLessonListItem } from "../../../../../domain/lessons/lessons.types.js";
import { uiMessage } from "../../helpers/ui.js";
import type { Translator } from "../../helpers/copy.js";

export function lessonsListMessage(
  t: Translator,
  params: {
    items: StudentLessonListItem[];
    page: number;
    pages: number;
  },
) {
  const { items, page, pages } = params;

  const titleStr =
    pages > 1
      ? t("lessons-list-title-paged", { page: page + 1, pages })
      : t("lessons-list-title");

  if (items.length === 0) {
    return uiMessage([
      titleStr,
      "",
      t("lessons-list-empty"),
      "",
      t("lessons-list-empty-hint"),
    ]);
  }

  return uiMessage([
    titleStr,
    "",
    t("lessons-list-choose"),
    "",
    t("lessons-list-paging-hint"),
  ]);
}
