import type { StudentLessonListItem } from "../../../../../domain/lessons/lessons.types.js";

export function lessonsListMessage(params: {
  items: StudentLessonListItem[];
  page: number;
  pages: number;
}) {
  const { items, page, pages } = params;

  if (items.length === 0) {
    return [
      "📖 Уроки",
      "",
      "Пока тут пусто.",
      "Попроси преподавателя назначить урок — и он появится здесь.",
    ].join("\n");
  }

  return [
    pages > 1 ? `📖 Уроки • ${page + 1}/${pages}` : "📖 Уроки",
    "",
    "Выбери урок 👇",
  ].join("\n");
}
