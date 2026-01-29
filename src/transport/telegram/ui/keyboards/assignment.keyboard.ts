import { InlineKeyboard } from "grammy";
import type { InternalAssignmentQuestionDto } from "../../../../infra/backend-api/backend-api.types.js";
import { choiceEmoji } from "../../helpers/choice-emoji.js";
import { copy } from "../helpers/copy.js";

export function assignmentIntroKeyboard() {
  return new InlineKeyboard()
    .text(copy.kb.nav.back, "nav:back")
    .text(copy.kb.assignment.begin, "assignment_begin");
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

export function assignmentDoneKeyboard(params: { canReview: boolean }) {
  const kb = new InlineKeyboard();

  kb.text(copy.kb.assignment.toLesson, "assignment_to_lesson").row();

  if (params.canReview) {
    kb.text(copy.kb.assignment.review, "assignment_review").row();
  }

  kb.text(copy.kb.nav.menu, "nav:home");
  kb.row().text(copy.kb.assignment.finish, "assignment_finish");

  return kb;
}

export function assignmentSubmitErrorKeyboard() {
  return new InlineKeyboard()
    .text(copy.kb.assignment.retrySubmit, "assignment_submit_retry")
    .row()
    .text(copy.kb.assignment.finish, "assignment_finish")
    .row()
    .text(copy.kb.nav.menu, "nav:home");
}

export function assignmentReviewKeyboard(page: number, totalPages: number) {
  const kb = new InlineKeyboard();

  if (page > 0)
    kb.text(copy.kb.reviewPaging.prev, `assignment_review_page:${page - 1}`);
  if (page < totalPages - 1)
    kb.text(copy.kb.reviewPaging.next, `assignment_review_page:${page + 1}`);

  kb.row().text(copy.kb.reviewPaging.toLesson, "assignment_to_lesson");
  kb.row().text(copy.kb.reviewPaging.finish, "assignment_finish");

  return kb;
}
