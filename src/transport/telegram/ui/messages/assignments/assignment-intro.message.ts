import type { InternalAssignmentDto } from "../../../../../infra/backend-api/backend-api.types.js";
import { escapeHtml } from "../../helpers/html.js";
import { uiMessage, uiMeta, uiQuote, uiTitle } from "../../helpers/ui.js";

function howToAnswerText(a: InternalAssignmentDto): string {
  const types = new Set(a.questions.map((q) => q.questionType));
  const hasChoice = types.has("multiple_choice");
  const hasText = types.has("gap_fill") || types.has("open_text");

  if (hasChoice && hasText)
    return "Где-то нужно выбрать вариант, где-то — написать ответ.";
  if (hasChoice) return "Выбирай вариант кнопками под сообщением.";
  if (hasText) return "Пиши ответ сообщением в чат.";
  return "Следуй подсказкам на экране.";
}

export function assignmentIntroMessage(a: InternalAssignmentDto) {
  const meta = uiMeta([
    a.lesson?.title ?? null,
    a.lesson?.topic ?? null,
    a.lesson?.level ?? null,
  ]);

  return uiMessage([
    uiTitle("📝", "Задание"),
    meta,
    "",
    `Вопросов: <b>${a.questions.length}</b>`,
    `Как отвечать: ${escapeHtml(howToAnswerText(a))}`,
    "",
    uiQuote(
      "Пример",
      [
        `<b>Вопрос:</b> What does “break the ice” mean?`,
        `🇦 Say something funny to make people feel relaxed`,
        `🇧 Literally break something`,
        `🇨 Freeze water`,
      ].join("\n"),
    ),
    "",
    "Готов(а)? Нажми <b>«Начать»</b>.",
  ]);
}
