import type { BotContext } from "../../context.js";
import type { NavScreen } from "../../session.js";
import type { RenderScreenDeps } from "../types.js";

import { assignmentIntroKeyboard } from "../../ui/keyboards/assignment.keyboard.js";
import { assignmentIntroMessage } from "../../ui/messages/assignments/assignment-intro.message.js";
import { sendChat } from "../../helpers/send-chat.js";

export async function renderAssignmentIntroScreen(
  ctx: BotContext,
  deps: RenderScreenDeps,
  screen: NavScreen,
) {
  if (screen.name !== "assignment_intro") return;

  const telegramId = ctx.from?.id;
  if (!telegramId) return;

  const a = await deps.studentAssignments.preview(
    telegramId,
    screen.assignmentId,
  );

  await sendChat(ctx, assignmentIntroMessage(a), {
    reply_markup: assignmentIntroKeyboard(),
  });
}
