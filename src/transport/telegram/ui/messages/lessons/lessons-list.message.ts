import type { StudentLessonListItem } from "../../../../../domain/lessons/lessons.types.js";
import { uiMessage } from "../../helpers/ui.js";
import { copy } from "../../helpers/copy.js";

export function lessonsListMessage(params: {
  items: StudentLessonListItem[];
  page: number;
  pages: number;
}) {
  const { items, page, pages } = params;

  if (items.length === 0) {
    return uiMessage([
      copy.ui.common.title("📖", copy.ui.lessons.list.title(page, pages)),
      "",
      copy.ui.lessons.list.emptyText,
      "",
      copy.ui.common.hint(copy.ui.lessons.list.emptyHint),
    ]);
  }

  return uiMessage([
    copy.ui.common.title("📖", copy.ui.lessons.list.title(page, pages)),
    "",
    copy.ui.lessons.list.choose,
    "",
    copy.ui.common.hint(copy.ui.lessons.list.pagingHint),
  ]);
}
