import { uiHint, uiMessage, uiTitle } from "../helpers/ui.js";
import { escapeHtml } from "../helpers/html.js";

export function homeMessage(firstName?: string | null) {
  const name = firstName?.trim();
  const greeting = name ? `Привет, ${escapeHtml(name)} 👋` : "Привет 👋";

  return uiMessage([
    uiTitle("🏠", "Меню"),
    "",
    greeting,
    "Что хочешь сделать?",
    "",
    uiHint(
      "Уроки и задания появятся тут автоматически, когда преподаватель их назначит.",
    ),
  ]);
}
