import type { BotContext } from "../../context.js";
import type { NavScreen } from "../../session.js";
import type { RenderScreenDeps } from "../types.js";

import { sendChat } from "../../helpers/send-chat.js";
import { assignmentQuestionKeyboard } from "../../ui/keyboards/assignment.keyboard.js";
import {
  assignmentQuestionMessage,
  assignmentTextAnswerHintMessage,
} from "../../ui/messages/assignments/assignment-question.message.js";

import { isTextQuestion } from "../../../../domain/assignment-run/question.type.js";
import { maxAttemptsForQuestionType } from "../../../../domain/assignment-run/attempts.policy.js";

export async function renderAssignmentQuestionScreen(
  ctx: BotContext,
  _deps: RenderScreenDeps,
  screen: NavScreen,
) {
  if (screen.name !== "assignment_question") return;

  const run = ctx.session.assignmentRun;
  if (!run) {
    await sendChat(ctx, "Сессия задания не найдена. Открой задание заново.");
    return;
  }

  if (run.submitted || run.submitInFlight) {
    return;
  }

  const a = run.assignment;
  const q = a.questions[run.index];
  if (!q) {
    await sendChat(ctx, "Вопрос не найден. Открой задание заново.");
    return;
  }

  const qType = q.questionType;
  const mode: "choice" | "text" = isTextQuestion(qType) ? "text" : "choice";

  await sendChat(ctx, assignmentQuestionMessage({ a, q, index: run.index }), {
    reply_markup: assignmentQuestionKeyboard({
      sessionId: run.clientSessionId,
      question: q,
      mode,
    }),
  });

  if (mode === "text") {
    const attempts = run.results[q.id]?.attempts ?? [];
    const maxAttempts = maxAttemptsForQuestionType(qType);
    const nextAttempt = Math.min(attempts.length + 1, maxAttempts);

    await sendChat(
      ctx,
      assignmentTextAnswerHintMessage({ attempt: nextAttempt, maxAttempts }),
    );
  }
}
