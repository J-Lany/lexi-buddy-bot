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
import { copy } from "../../ui/helpers/copy.js";

export async function renderAssignmentQuestionScreen(
  ctx: BotContext,
  _deps: RenderScreenDeps,
  screen: NavScreen,
) {
  if (screen.name !== "assignment_question") return;

  const run = ctx.session.assignmentRun;
  if (!run) {
    await sendChat(ctx, copy.ui.assignment.sessionNotFound);
    return;
  }

  if (run.submitted || run.submitInFlight) {
    return;
  }

  const a = run.assignment;
  const q = a.questions[run.index];
  if (!q) {
    await sendChat(ctx, copy.ui.assignment.question.questionNotFound);
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
    parse_mode: "HTML",
  });

  if (mode === "text") {
    const attempts = run.results[q.id]?.attempts ?? [];
    const maxAttempts = maxAttemptsForQuestionType(qType, run.attemptsPolicy);
    const nextAttempt = Math.min(attempts.length + 1, maxAttempts);

    await sendChat(
      ctx,
      assignmentTextAnswerHintMessage({ attempt: nextAttempt, maxAttempts }),
      {
        parse_mode: "HTML",
      },
    );
  }
}
