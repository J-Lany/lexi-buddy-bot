import type { BotContext } from "../../context.js";
import type { NavScreen } from "../../session.js";
import type { RenderScreenDeps } from "../types.js";

import { sendChat } from "../../helpers/send-chat.js";
import { assignmentReviewKeyboard } from "../../ui/keyboards/assignment.keyboard.js";
import { assignmentReviewMessage } from "../../ui/messages/assignments/assignment-review.message.js";
import { getStudentAnswerText } from "../../../../domain/assignment-run/student-answer.js";

export async function renderAssignmentReviewScreen(
  ctx: BotContext,
  _deps: RenderScreenDeps,
  screen: NavScreen,
) {
  if (screen.name !== "assignment_review") return;

  const run = ctx.session.assignmentRun;
  if (!run || !run.submitted) {
    await sendChat(ctx, "Разбор доступен после отправки ответов.");
    return;
  }

  const a = run.assignment;
  const totalPages = a.questions.length;

  const page = Math.max(0, Math.min(screen.page, totalPages - 1));
  const q = a.questions[page];
  if (!q) return;

  const attempts = run.results[q.id]?.attempts ?? [];
  const last = attempts[attempts.length - 1];

  const studentAnswerText = last ? getStudentAnswerText(q, last.answer) : null;
  const correctAnswerText = q.answers.find((x) => x.isCorrect)?.text ?? null;

  await sendChat(
    ctx,
    assignmentReviewMessage({
      a,
      q,
      index: page,
      studentAnswerText,
      correctAnswerText,
    }),
    {
      reply_markup: assignmentReviewKeyboard(page, totalPages),
    },
  );
}
