import type {
  InternalAssignmentDto,
  InternalAssignmentQuestionDto,
} from "../../../../../infra/backend-api/backend-api.types.js";
import { escapeHtml } from "../../helpers/html.js";
import { uiMessage } from "../../helpers/ui.js";

export function assignmentReviewMessage(params: {
  a: InternalAssignmentDto;
  q: InternalAssignmentQuestionDto;
  index: number;
  studentAnswerText: string | null;
  correctAnswerText: string | null;
}) {
  const { a, q, index, studentAnswerText, correctAnswerText } = params;

  return uiMessage([
    `<b>🔎 Разбор</b> <i>${index + 1}/${a.questions.length}</i>`,
    "",
    `<b>Вопрос</b>\n${escapeHtml(q.text)}`,
    "",
    `<b>Твой ответ</b>\n${escapeHtml(studentAnswerText ?? "—")}`,
    "",
    `<b>Правильный ответ</b>\n${escapeHtml(correctAnswerText ?? "—")}`,
    q.explanation?.trim()
      ? `\n🧠 <b>Пояснение</b>\n${escapeHtml(q.explanation.trim())}`
      : null,
  ]);
}
