import { escapeHtml } from "../../helpers/html.js";
import { uiMessage } from "../../helpers/ui.js";

export function assignmentFeedbackMessage(params: {
  correct: boolean;
  attempt: number;
  maxAttempts: number;
  correctAnswerText: string | null;
  explanation: string | null;
  showCorrectAnswer: boolean;
}) {
  const {
    correct,
    attempt,
    maxAttempts,
    correctAnswerText,
    explanation,
    showCorrectAnswer,
  } = params;

  const lines: Array<string | null> = [];

  if (correct) {
    lines.push("✅ <b>Верно.</b>");
  } else {
    if (attempt < maxAttempts) {
      lines.push(
        `❌ <b>Пока не так.</b> Попробуй ещё раз <i>(${attempt}/${maxAttempts})</i>.`,
      );
    } else {
      lines.push(
        `❌ <b>Попытки закончились.</b> <i>(${attempt}/${maxAttempts})</i>.`,
      );
    }

    if (showCorrectAnswer && correctAnswerText) {
      lines.push("");
      lines.push(
        `✅ Правильный ответ: <b>${escapeHtml(correctAnswerText)}</b>`,
      );
    }
  }

  if (explanation?.trim()) {
    lines.push("");
    lines.push(`🧠 <b>Пояснение</b>`);
    lines.push(escapeHtml(explanation.trim()));
  }

  return uiMessage(lines);
}
