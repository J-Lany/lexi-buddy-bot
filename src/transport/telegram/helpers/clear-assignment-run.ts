import type { BotContext } from "../context.js";

export function clearAssignmentRun(ctx: BotContext) {
  ctx.session.assignmentRun = null;
  ctx.session.assignmentLastScore = undefined;
  ctx.session.assignmentSubmittedAt = undefined;
  ctx.session.assignmentSubmitError = null;
}
