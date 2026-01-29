import type {
  InternalAssignmentDto,
  InternalAssignmentQuestionDto,
} from "../../../../../infra/backend-api/backend-api.types.js";
import { escapeHtml } from "../../helpers/html.js";
import { uiMessage } from "../../helpers/ui.js";
import { copy } from "../../helpers/copy.js";

export function assignmentReviewMessage(params: {
  a: InternalAssignmentDto;
  q: InternalAssignmentQuestionDto;
  index: number;
  studentAnswerText: string | null;
  correctAnswerText: string | null;
}) {
  const { a, q, index, studentAnswerText, correctAnswerText } = params;

  const page = `${index + 1}/${a.questions.length}`;

  return uiMessage([
    `${copy.ui.assignment.review.title} <i>${page}</i>`,
    "",
    `<b>${copy.ui.assignment.review.blocks.q}</b>\n${escapeHtml(q.text)}`,
    "",
    `<b>${copy.ui.assignment.review.blocks.yours}</b>\n${escapeHtml(
      studentAnswerText ?? "—",
    )}`,
    "",
    `<b>${copy.ui.assignment.review.blocks.correct}</b>\n${escapeHtml(
      correctAnswerText ?? "—",
    )}`,
    q.explanation?.trim()
      ? `\n${copy.ui.assignment.review.blocks.explanationTitle}\n${escapeHtml(
          q.explanation.trim(),
        )}`
      : null,
  ]);
}
