import { InlineKeyboard } from "grammy";
import type { InternalAssignmentQuestionDto } from "../../../../infra/backend-api/backend-api.types.js";
import { choiceEmoji } from "../../helpers/choice-emoji.js";

export function assignmentIntroKeyboard() {
  return new InlineKeyboard()
    .text("🔙️ Назад", "nav:back")
    .text("🚀 Начать", "assignment_begin");
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

  kb.text("📚 Другие задания урока", "assignment_to_lesson").row();

  if (params.canReview) {
    kb.text("🔎 Разобрать вопросы и ответы", "assignment_review").row();
  }

  kb.text("🏠 Домой", "nav:home");
  kb.row().text("🏁 Завершить", "assignment_finish");

  return kb;
}

export function assignmentSubmitErrorKeyboard() {
  return new InlineKeyboard()
    .text("🔄 Повторить отправку", "assignment_submit_retry")
    .row()
    .text("🏁 Завершить", "assignment_finish")
    .row()
    .text("🏠 Домой", "nav:home");
}

export function assignmentReviewKeyboard(page: number, totalPages: number) {
  const kb = new InlineKeyboard();

  if (page > 0) kb.text("◀︎", `assignment_review_page:${page - 1}`);
  if (page < totalPages - 1)
    kb.text("▶︎", `assignment_review_page:${page + 1}`);

  kb.row().text("📚 К заданиям урока", "assignment_to_lesson");
  kb.row().text("🏁 Завершить", "assignment_finish");

  return kb;
}
