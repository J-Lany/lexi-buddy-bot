import { escapeHtml } from "../../helpers/html.js";
import { uiMessage, uiHint, uiTitle } from "../../helpers/ui.js";

export function assignmentSubmitErrorMessage(params: {
  details?: string | null;
}) {
  const details = params.details?.trim() || null;

  return uiMessage([
    uiTitle("⚠️", "Не получилось отправить ответы"),
    "",
    "Похоже, связь прервалась или сервер занят.",
    "Нажми <b>«Повторить отправку»</b> — и продолжим.",
    "",
    uiHint(
      "Если ошибка повторяется — просто заверши, ответы останутся у тебя в истории чата.",
    ),
    details
      ? `\n<blockquote><i>Детали</i>\n${escapeHtml(details)}</blockquote>`
      : null,
  ]);
}
