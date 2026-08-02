import type { BotContext } from "../../context.js";
import type { NavScreen } from "../../session.js";
import type { RenderScreenDeps } from "../types.js";

import { sendChat } from "../../helpers/send-chat.js";

import {
  assignmentDoneMessage,
  toResultPercent,
} from "../../ui/messages/assignments/assignment-done.message.js";

import {
  assignmentDoneKeyboard,
  assignmentSubmitErrorKeyboard,
} from "../../ui/keyboards/assignment.keyboard.js";
import { assignmentSubmitErrorMessage } from "../../ui/messages/assignments/assignment-submit-error.message.js";
import { env } from "../../../../config/env.js";
import { sendMediaOrFallback } from "../../helpers/media/send-media-or-fallback.js";

export async function renderAssignmentDoneScreen(
  ctx: BotContext,
  _deps: RenderScreenDeps,
  screen: NavScreen,
) {
  if (screen.name !== "assignment_done") return;

  const run = ctx.session.assignmentRun;
  const err = ctx.session.assignmentSubmitError;

  if (!run) {
    await sendChat(ctx, ctx.t("session-not-found"));
    return;
  }

  if (err) {
    await sendChat(
      ctx,
      assignmentSubmitErrorMessage(ctx.t, { details: err.message }),
      {
        reply_markup: assignmentSubmitErrorKeyboard(ctx.t),
      },
    );
    return;
  }

  const score = ctx.session.assignmentLastScore ?? null;

  const hasAttempts = Object.values(run.results).some(
    (bucket) => bucket.attempts?.length,
  );
  const canReview = Boolean(run.submitted && hasAttempts);

  const text = assignmentDoneMessage(ctx.t, score);
  const options = {
    reply_markup: assignmentDoneKeyboard(ctx.t, { canReview }),
    parse_mode: "HTML" as const,
  };

  if (score === null) {
    // No numeric result (done-saved branch) — media selection doesn't apply
    // here at all; this is the exact same call the code makes today.
    await sendChat(ctx, text, options);
    return;
  }

  const resultPercent = toResultPercent(score);
  const isLowResult = resultPercent < 30;

  await sendMediaOrFallback({
    api: ctx.api,
    chatId: ctx.chat!.id,
    fileId: isLowResult
      ? env.studentMedia.taskResultLowVideoFileId
      : env.studentMedia.taskResultPositiveVideoFileId,
    kind: "video",
    caption: text,
    options,
    fallback: () => sendChat(ctx, text, options),
    event: isLowResult
      ? "student_task_result_low"
      : "student_task_result_positive",
  });
}
