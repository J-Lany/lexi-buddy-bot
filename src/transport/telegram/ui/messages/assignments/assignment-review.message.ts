import type {
  InternalAssignmentDto,
  InternalAssignmentQuestionDto,
} from "../../../../../infra/backend-api/backend-api.types.js";
import { escapeHtml } from "../../helpers/html.js";
import { uiMessage } from "../../helpers/ui.js";
import type { Translator } from "../../helpers/copy.js";

export function assignmentReviewMessage(
  t: Translator,
  params: {
    a: InternalAssignmentDto;
    q: InternalAssignmentQuestionDto;
    index: number;
    studentAnswerText: string | null;
    correctAnswerText: string | null;
  },
) {
  const { a, q, index, studentAnswerText, correctAnswerText } = params;

  const page = `${index + 1}/${a.questions.length}`;

  return uiMessage([
    `${t("review-title")} <i>${page}</i>`,
    "",
    `<b>${t("review-question-label")}</b>\n${escapeHtml(q.text)}`,
    "",
    `<b>${t("review-yours-label")}</b>\n${escapeHtml(
      studentAnswerText ?? "—",
    )}`,
    "",
    `<b>${t("review-correct-label")}</b>\n${escapeHtml(
      correctAnswerText ?? "—",
    )}`,
    q.explanation?.trim()
      ? `\n${t("review-explanation-title")}\n${escapeHtml(
          q.explanation.trim(),
        )}`
      : null,
  ]);
}
