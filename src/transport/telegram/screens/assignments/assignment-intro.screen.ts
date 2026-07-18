import type { BotContext } from "../../context.js";
import type { NavScreen } from "../../session.js";
import type { RenderScreenDeps } from "../types.js";

import { withLoadingScreen } from "../../helpers/with-loading.js";
import { replaceScreenMessage } from "../../helpers/edit-screen/replace-screen-message.js";
import { breadcrumb } from "../../ui/messages/breadcrumbs.js";

import { assignmentIntroKeyboard } from "../../ui/keyboards/assignment.keyboard.js";
import { buildAssignmentIntroParts } from "../../ui/messages/assignments/assignment-intro.message.js";

const MAX_TRACKED_INTRO_EXTRAS = 50;

function hasSentIntroExtras(ctx: BotContext, assignmentId: number): boolean {
  return ctx.session.ui.introExtrasSentFor?.includes(assignmentId) ?? false;
}

function markIntroExtrasSent(ctx: BotContext, assignmentId: number) {
  const list = ctx.session.ui.introExtrasSentFor ?? [];
  if (!list.includes(assignmentId)) list.push(assignmentId);
  if (list.length > MAX_TRACKED_INTRO_EXTRAS) list.shift();
  ctx.session.ui.introExtrasSentFor = list;
}

export async function renderAssignmentIntroScreen(
  ctx: BotContext,
  deps: RenderScreenDeps,
  screen: NavScreen,
) {
  if (screen.name !== "assignment_intro") return;

  const telegramId = ctx.from?.id;
  if (!telegramId) return;

  const a = await withLoadingScreen(ctx, () =>
    deps.studentAssignments.preview(telegramId, screen.assignmentId),
  );

  const crumb = breadcrumb(ctx.t, screen, {
    lessonTitle: a.lesson?.title ?? null,
    assignmentType: a.type ?? null,
  });

  const { precedingMessages, mainScreenMessage } = buildAssignmentIntroParts(
    ctx.t,
    a,
    crumb,
  );

  // Extra (overflow) messages only need to be sent once per assignment per
  // session — reopening the same intro screen shouldn't resend them.
  if (
    precedingMessages.length > 0 &&
    !hasSentIntroExtras(ctx, screen.assignmentId)
  ) {
    for (const message of precedingMessages) {
      await ctx.reply(message, { parse_mode: "HTML" });
    }
    markIntroExtrasSent(ctx, screen.assignmentId);
  }

  // Sent fresh (never edited in place) so it always lands after any extras
  // just sent above — editing the old "loading" placeholder here would leave
  // the interactive message positioned BEFORE them in the chat.
  await replaceScreenMessage(ctx, mainScreenMessage, {
    reply_markup: assignmentIntroKeyboard(ctx.t),
    parse_mode: "HTML",
  });
}
