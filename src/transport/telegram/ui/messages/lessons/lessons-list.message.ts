import type { StudentLessonListItem } from "../../../../../domain/lessons/lessons.types.js";
import { uiHint, uiMessage, uiTitle } from "../../helpers/ui.js";

export function lessonsListMessage(params: {
  items: StudentLessonListItem[];
  page: number;
  pages: number;
}) {
  const { items, page, pages } = params;

  if (items.length === 0) {
    return uiMessage([
      uiTitle("📖", "Уроки"),
      "",
      "Пока тут пусто.",
      "",
      uiHint("Попроси преподавателя назначить урок — и он появится здесь."),
    ]);
  }

  const header = pages > 1 ? `Уроки • ${page + 1}/${pages}` : "Уроки";

  return uiMessage([
    uiTitle("📖", header),
    "",
    "Выбери урок 👇",
    "",
    uiHint("Можно пролистать список кнопками ниже."),
  ]);
}
