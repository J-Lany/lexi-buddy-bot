import { uiHint, uiMessage, uiTitle } from "../helpers/ui.js";
import { escapeHtml } from "../helpers/html.js";

export function startNeedRegMessage(firstName: string) {
  return uiMessage([
    uiTitle("👋", `Привет, ${escapeHtml(firstName)}!`),
    "",
    "Я помогу получать задания от преподавателя прямо в этом чате.",
    "",
    uiHint("Нажми «Присоединиться», чтобы подключиться."),
  ]);
}

export function startRegisteredNoTeacherMessage() {
  return uiMessage([
    uiTitle("✅", "Ты уже подключён(а)"),
    "",
    "Пока нет активной группы с преподавателем — поэтому уроки ещё не появились.",
    "",
    uiHint(
      "Попроси у преподавателя приглашение — и всё появится автоматически 🙂",
    ),
  ]);
}

export function startActiveStudentMessage(firstName: string) {
  return uiMessage([
    uiTitle("✅", `Привет, ${escapeHtml(firstName)}!`),
    "",
    "Готово. Уроки и задания доступны в меню.",
  ]);
}
