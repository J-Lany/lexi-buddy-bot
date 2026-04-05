import type { Bot } from "grammy";
import type { BotContext } from "../context.js";
import type { RoutesDeps } from "./routes.deps.js";

import { safeEditScreen } from "../helpers/edit-screen/safe-edit-screen.js";
import { navPeek, navPush, navReplaceTop } from "../helpers/nav.js";
import { renderScreen } from "../helpers/render-screen.js";
import { sendChat } from "../helpers/send-chat.js";
import { ack } from "../helpers/ack.js";
import { goTo } from "../helpers/go-to.js";
import { beginNewScreen } from "../helpers/begin-new-screen.js";

import { AssignmentRunFlow } from "../../../application/assignment-run/assignment-run.flow.js";
import { logError, logInfo } from "../../../observability/logger.js";

const STALE_ASSIGNMENT_TEXT = "Экран устарел. Открой задание заново.";

export function registerStudentAssignmentsRoutes(
  bot: Bot<BotContext>,
  deps: RoutesDeps,
) {
  const flow = new AssignmentRunFlow();
  const beginInFlight = new Set<string>();

  async function advanceOrSubmit(ctx: BotContext) {
    const run = ctx.session.assignmentRun;
    if (!run) return;

    if (await flow.maybeAutoSubmitAndNavigate(ctx, deps)) {
      navReplaceTop(ctx, { name: "assignment_done" });
      await renderScreen(ctx, deps, { name: "assignment_done" });
      return;
    }

    const currentQ = run.assignment.questions[run.index];
    if (!currentQ) return;

    const advanced = flow.next(ctx, {
      sessionId: run.clientSessionId,
      questionId: currentQ.id,
    });

    if (!advanced) return;

    navReplaceTop(ctx, { name: "assignment_question" });
    await renderScreen(ctx, deps, { name: "assignment_question" });
  }

  bot.callbackQuery("assignment_begin", async (ctx) => {
    const telegramId = ctx.from?.id;
    const current = navPeek(ctx);

    if (!telegramId || !current || current.name !== "assignment_intro") {
      await ack(ctx, STALE_ASSIGNMENT_TEXT);
      return;
    }

    const key = `${telegramId}:${current.assignmentId}`;
    if (beginInFlight.has(key)) {
      await ack(ctx, "Уже запускаю задание…");
      return;
    }

    beginInFlight.add(key);
    await ack(ctx);

    try {
      await flow.begin(ctx, deps, current.assignmentId);

      const run = ctx.session.assignmentRun;
      logInfo("assignment_started", {
        assignmentId: current.assignmentId,
        type: run?.assignment.type ?? null,
      });

      navReplaceTop(ctx, { name: "assignment_question" });
      await renderScreen(ctx, deps, { name: "assignment_question" });
    } catch (e) {
      logError("assignment_begin_failed", e, {
        assignmentId: current.assignmentId,
      });

      await safeEditScreen(
        ctx,
        "⚠️ Не удалось начать задание. Попробуй позже.",
      );
    } finally {
      beginInFlight.delete(key);
    }
  });

  bot.callbackQuery(/^assignment_choose:.+$/, async (ctx) => {
    const data = ctx.callbackQuery.data;
    const m = /^assignment_choose:([^:]+):(\d+):(\d+)$/.exec(data);
    if (!m) {
      await ack(ctx, STALE_ASSIGNMENT_TEXT);
      return;
    }

    const sessionId = m[1];
    const questionId = Number(m[2]);
    const answerId = Number(m[3]);

    const ok = await flow.answerChoice(ctx, {
      questionId,
      answerId,
      ...(sessionId ? { sessionId } : {}),
    });

    if (!ok) {
      await ack(ctx, STALE_ASSIGNMENT_TEXT);
      return;
    }

    await ack(ctx);

    const fb = flow.takeFeedback(ctx);
    if (fb) await sendChat(ctx, fb.text);

    await advanceOrSubmit(ctx);
  });

  bot.on("message:text", async (ctx, next) => {
    const current = navPeek(ctx);
    if (!current || current.name !== "assignment_question") return next();

    const run = ctx.session.assignmentRun;
    if (!run || run.submitted || run.startInFlight || run.submitInFlight) {
      return;
    }

    const ok = await flow.answerText(ctx, ctx.message.text);
    if (!ok) return;

    const fb = flow.takeFeedback(ctx);
    if (fb) await sendChat(ctx, fb.text);

    if (fb?.canGoNext) {
      await advanceOrSubmit(ctx);
    }
  });

  bot.callbackQuery("assignment_submit_retry", async (ctx) => {
    const run = ctx.session.assignmentRun;
    if (!run) {
      await ack(ctx, STALE_ASSIGNMENT_TEXT);
      return;
    }

    await ack(ctx);

    await flow.submit(ctx, deps);

    navReplaceTop(ctx, { name: "assignment_done" });
    await renderScreen(ctx, deps, { name: "assignment_done" });
  });

  bot.callbackQuery("assignment_review", async (ctx) => {
    const run = ctx.session.assignmentRun;
    if (!run || !run.submitted) {
      await ack(ctx, STALE_ASSIGNMENT_TEXT);
      return;
    }

    await ack(ctx);

    navPush(ctx, { name: "assignment_review", page: 0 });
    await renderScreen(ctx, deps, { name: "assignment_review", page: 0 });
  });

  bot.callbackQuery(/^assignment_review_page:\d+$/, async (ctx) => {
    const run = ctx.session.assignmentRun;
    if (!run || !run.submitted) {
      await ack(ctx, STALE_ASSIGNMENT_TEXT);
      return;
    }

    const m = /^assignment_review_page:(\d+)$/.exec(ctx.callbackQuery.data);
    if (!m) {
      await ack(ctx, STALE_ASSIGNMENT_TEXT);
      return;
    }

    await ack(ctx);

    const page = Number(m[1]);

    navReplaceTop(ctx, { name: "assignment_review", page });
    await renderScreen(ctx, deps, { name: "assignment_review", page });
  });

  bot.callbackQuery("assignment_to_lesson", async (ctx) => {
    const run = ctx.session.assignmentRun;
    if (!run) {
      await ack(ctx, STALE_ASSIGNMENT_TEXT);
      return;
    }

    await ack(ctx);

    const lessonId = flow.finishToLesson(ctx);
    if (lessonId === null) {
      await sendChat(ctx, STALE_ASSIGNMENT_TEXT);
      return;
    }

    beginNewScreen(ctx);
    await goTo(
      ctx,
      deps,
      { name: "lesson", lessonId },
      { navMode: "reset", clearAssignmentRun: "always" },
    );
  });

  bot.callbackQuery("assignment_finish", async (ctx) => {
    await ack(ctx);

    flow.finish(ctx);

    beginNewScreen(ctx);
    await goTo(
      ctx,
      deps,
      { name: "home" },
      { navMode: "reset", clearAssignmentRun: "always" },
    );
  });
}
