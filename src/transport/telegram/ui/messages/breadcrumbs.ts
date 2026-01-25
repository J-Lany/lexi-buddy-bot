import type { NavScreen } from "../../session.js";

type Crumb = { icon?: string; title: string };

function joinCrumbs(crumbs: Crumb[]) {
  return crumbs
    .map((c) => `${c.icon ? c.icon + " " : ""}${c.title}`)
    .join("  ›  ");
}

/**
 * Breadcrumb для верхней строки экрана.
 * Делаем коротко, без динамических title урока/задания (их можно добавить позже, когда будет кэш/детали).
 */
export function breadcrumb(screen: NavScreen): string {
  const home: Crumb = { icon: "🏠", title: "Меню" };

  if (screen.name === "home") return joinCrumbs([home]);

  if (screen.name === "lessons_list")
    return joinCrumbs([home, { icon: "📖", title: "Уроки" }]);

  if (screen.name === "lesson")
    return joinCrumbs([
      home,
      { icon: "📖", title: "Уроки" },
      { icon: "📘", title: `Урок #${screen.lessonId}` },
    ]);

  if (screen.name === "assignment")
    return joinCrumbs([
      home,
      { icon: "📖", title: "Уроки" },
      { icon: "📝", title: `Задание #${screen.assignmentId}` },
    ]);

  if (screen.name === "profile")
    return joinCrumbs([home, { icon: "👤", title: "Профиль" }]);

  if (screen.name === "help")
    return joinCrumbs([home, { icon: "❓", title: "Помощь" }]);

  return joinCrumbs([home]);
}

/**
 * Оборачивает любой экран в breadcrumb сверху.
 * Между хлебными крошками и контентом — пустая строка.
 */
export function withBreadcrumb(screen: NavScreen, body: string) {
  return `${breadcrumb(screen)}\n\n${body}`;
}
