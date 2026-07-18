import type { BotContext } from "../../context.js";
import type { NavScreen } from "../../session.js";
import type { RenderScreenDeps } from "../types.js";

import { sendChat } from "../../helpers/send-chat.js";

import { assignmentDoneMessage } from "../../ui/messages/assignments/assignment-done.message.js";

import {
  assignmentDoneKeyboard,
  assignmentSubmitErrorKeyboard,
} from "../../ui/keyboards/assignment.keyboard.js";
import { assignmentSubmitErrorMessage } from "../../ui/messages/assignments/assignment-submit-error.message.js";

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

  await sendChat(ctx, assignmentDoneMessage(ctx.t, score), {
    reply_markup: assignmentDoneKeyboard(ctx.t, { canReview }),
    parse_mode: "HTML",
  });
}
