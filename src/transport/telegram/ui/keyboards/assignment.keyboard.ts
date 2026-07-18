import { InlineKeyboard } from "grammy";
import type { InternalAssignmentQuestionDto } from "../../../../infra/backend-api/backend-api.types.js";
import { choiceEmoji } from "../../helpers/choice-emoji.js";
import type { Translator } from "../helpers/copy.js";

export function assignmentIntroKeyboard(t: Translator) {
  return new InlineKeyboard()
    .text(t("kb-back"), "nav:back")
    .text(t("kb-begin"), "assignment_begin");
}

export function assignmentQuestionKeyboard(params: {
  sessionId: string;
  question: InternalAssignmentQuestionDto;
  mode: "choice" | "text";
}) {
  const { sessionId, question, mode } = params;

  const kb = new InlineKeyboard();

  if (mode === "choice") {
    for (let i = 0; i < question.answers.length; i++) {
      const a = question.answers[i]!;
      kb.text(
        choiceEmoji(i),
        `assignment_choose:${sessionId}:${question.id}:${a.id}`,
      );
    }
  }

  return kb;
}

export function assignmentDoneKeyboard(
  t: Translator,
  params: { canReview: boolean },
) {
  const kb = new InlineKeyboard();

  kb.text(t("kb-to-lesson"), "assignment_to_lesson").row();

  if (params.canReview) {
    kb.text(t("kb-review"), "assignment_review").row();
  }

  kb.text(t("kb-menu"), "nav:home");
  kb.row().text(t("kb-finish"), "assignment_finish");

  return kb;
}

export function assignmentSubmitErrorKeyboard(t: Translator) {
  return new InlineKeyboard()
    .text(t("kb-retry-submit"), "assignment_submit_retry")
    .row()
    .text(t("kb-finish"), "assignment_finish")
    .row()
    .text(t("kb-menu"), "nav:home");
}

export function assignmentReviewKeyboard(
  t: Translator,
  page: number,
  totalPages: number,
) {
  const kb = new InlineKeyboard();

  if (page > 0)
    kb.text(t("kb-review-prev"), `assignment_review_page:${page - 1}`);
  if (page < totalPages - 1)
    kb.text(t("kb-review-next"), `assignment_review_page:${page + 1}`);

  kb.row().text(t("kb-review-to-lesson"), "assignment_to_lesson");
  kb.row().text(t("kb-review-finish"), "assignment_finish");

  return kb;
}
