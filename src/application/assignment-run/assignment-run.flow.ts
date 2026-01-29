import { randomUUID } from "crypto";
import type { BotContext } from "../../transport/telegram/context.js";

import { clearAssignmentRun } from "../../transport/telegram/helpers/clear-assignment-run.js";
import type { RenderDeps } from "../../transport/telegram/helpers/render-screen.js";
import { navReplaceTop } from "../../transport/telegram/helpers/nav.js";

import { assignmentFeedbackMessage } from "../../transport/telegram/ui/messages/assignments/assignment-feedback.message.js";

import {
  isTextQuestion,
  isChoiceQuestion,
} from "../../domain/assignment-run/question.type.js";
import { maxAttemptsForQuestionType } from "../../domain/assignment-run/attempts.policy.js";
import { getCorrectAnswerText } from "../../domain/assignment-run/correct-answer.js";
import { isCorrectTextAnswer } from "../../domain/assignment-run/answer.check.js";

export class AssignmentRunFlow {
  async begin(ctx: BotContext, deps: RenderDeps, assignmentId: number) {
    const telegramId = ctx.from?.id;
    if (!telegramId) return;

    const started = await deps.studentAssignments.start(
      telegramId,
      assignmentId,
    );

    ctx.session.assignmentRun = {
      clientSessionId: randomUUID(),

      assignmentId: started.assignment.assignmentId,
      lessonId: started.assignment.lesson.lessonId,

      studentAssignmentId: started.studentAssignmentId,
      attemptNo: started.attemptNo,

      attemptsPolicy: started.attemptsPolicy ?? null,
      assignment: started.assignment,

      index: 0,
      shownAt: Date.now(),

      startInFlight: false,
      nextInFlight: false,
      submitInFlight: false,

      submitted: false,

      results: {},

      ui: {
        feedbackText: null,
        canGoNext: false,
      },
    };

    navReplaceTop(ctx, { name: "assignment_question" });
  }

  async answerChoice(
    ctx: BotContext,
    params: { sessionId?: string; questionId: number; answerId: number },
  ): Promise<boolean> {
    const run = ctx.session.assignmentRun;
    if (!run) return false;
    if (run.submitted) return false;

    if (params.sessionId && params.sessionId !== run.clientSessionId)
      return false;

    const q = run.assignment.questions.find((x) => x.id === params.questionId);
    if (!q) return false;

    const qType = q.questionType;
    if (!isChoiceQuestion(qType)) return false;

    const currentQ = run.assignment.questions[run.index];
    if (!currentQ || currentQ.id !== params.questionId) return false;

    const existing = run.results[params.questionId]?.attempts?.length ?? 0;
    if (existing > 0) return false;

    const chosen = q.answers.find((a) => a.id === params.answerId);
    if (!chosen) return false;

    const isCorrect = Boolean(chosen.isCorrect);
    const correctText = getCorrectAnswerText(q);
    const maxAttempts = maxAttemptsForQuestionType(qType);

    run.results[params.questionId] ??= { attempts: [] };
    run.results[params.questionId]?.attempts.push({
      attempt: 1,
      answer: { answerId: params.answerId, text: chosen.text },
      isCorrect,
      responseTimeMs: Math.max(0, Date.now() - run.shownAt),
    });

    run.shownAt = Date.now();

    run.ui = {
      canGoNext: true,
      feedbackText: assignmentFeedbackMessage({
        correct: isCorrect,
        attempt: 1,
        maxAttempts,
        showCorrectAnswer: !isCorrect,
        correctAnswerText: correctText,
        explanation: q.explanation ?? null,
      }),
    };

    return true;
  }

  async answerText(ctx: BotContext, text: string): Promise<boolean> {
    const run = ctx.session.assignmentRun;
    if (!run) return false;
    if (run.submitted) return false;

    const q = run.assignment.questions[run.index];
    if (!q) return false;

    const qType = q.questionType;
    if (!isTextQuestion(qType)) return false;

    const questionId = q.id;
    const maxAttempts = maxAttemptsForQuestionType(qType);

    run.results[questionId] ??= { attempts: [] };

    const prevAttempts = run.results[questionId].attempts.length;
    const attemptNo = prevAttempts + 1;
    if (attemptNo > maxAttempts) return false;

    const correctText = getCorrectAnswerText(q);
    const correct =
      correctText !== null ? isCorrectTextAnswer(text, correctText) : false;

    run.results[questionId].attempts.push({
      attempt: attemptNo,
      answer: { text },
      isCorrect: correct,
      responseTimeMs: Math.max(0, Date.now() - run.shownAt),
    });

    const lastTry = attemptNo >= maxAttempts;
    const canGoNext = correct || lastTry;

    run.ui = {
      canGoNext,
      feedbackText: assignmentFeedbackMessage({
        correct,
        attempt: attemptNo,
        maxAttempts,
        showCorrectAnswer: !correct && lastTry,
        correctAnswerText: correctText,
        explanation: q.explanation ?? null,
      }),
    };

    if (canGoNext) {
      run.shownAt = Date.now();
    }

    return true;
  }

  takeFeedback(ctx: BotContext): { text: string; canGoNext: boolean } | null {
    const run = ctx.session.assignmentRun;
    if (!run?.ui?.feedbackText) return null;

    const text = run.ui.feedbackText;
    const canGoNext = Boolean(run.ui.canGoNext);

    run.ui.feedbackText = null;
    run.ui.canGoNext = false;

    return { text, canGoNext };
  }

  next(
    ctx: BotContext,
    params?: { sessionId?: string; questionId?: number },
  ): boolean {
    const run = ctx.session.assignmentRun;
    if (!run) return false;
    if (run.submitted) return false;

    if (params?.sessionId && params.sessionId !== run.clientSessionId)
      return false;

    const q = run.assignment.questions[run.index];
    if (!q) return false;

    if (params?.questionId && params.questionId !== q.id) return false;

    const attempts = run.results[q.id]?.attempts ?? [];
    const last = attempts[attempts.length - 1];
    if (!last) return false;

    const maxAttempts = maxAttemptsForQuestionType(q.questionType);
    const canLeave =
      isChoiceQuestion(q.questionType) ||
      last.isCorrect ||
      last.attempt >= maxAttempts;

    if (!canLeave) return false;

    if (run.index < run.assignment.questions.length - 1) {
      run.index += 1;
      run.shownAt = Date.now();
      return true;
    }

    return false;
  }

  shouldAutoSubmit(ctx: BotContext): boolean {
    const run = ctx.session.assignmentRun;
    if (!run) return false;
    if (run.submitted) return false;

    const q = run.assignment.questions[run.index];
    if (!q) return false;

    const attempts = run.results[q.id]?.attempts ?? [];
    const last = attempts[attempts.length - 1];
    if (!last) return false;

    const isLast = run.index >= run.assignment.questions.length - 1;
    if (!isLast) return false;

    const maxAttempts = maxAttemptsForQuestionType(q.questionType);

    return (
      isChoiceQuestion(q.questionType) ||
      last.isCorrect ||
      last.attempt >= maxAttempts
    );
  }

  async submit(ctx: BotContext, deps: RenderDeps) {
    const run = ctx.session.assignmentRun;
    if (!run) return;

    if (run.submitInFlight || run.submitted) return;
    run.submitInFlight = true;

    try {
      const telegramId = ctx.from?.id;
      if (!telegramId) return;

      const results = Object.entries(run.results).map(([qid, payload]) => ({
        questionId: Number(qid),
        attempts: payload.attempts.map((a) => ({
          attempt: a.attempt,
          ...(a.answer !== undefined ? { answer: a.answer } : {}),
          ...(a.isCorrect !== undefined ? { isCorrect: a.isCorrect } : {}),
          ...(a.responseTimeMs !== null
            ? { responseTimeMs: a.responseTimeMs }
            : {}),
        })),
      }));

      const res = await deps.studentAssignments.submit({
        telegramId,
        studentAssignmentId: run.studentAssignmentId,
        clientSessionId: run.clientSessionId,
        results,
      });

      run.submitted = true;
      ctx.session.assignmentLastScore = res.score ?? null;
      ctx.session.assignmentSubmittedAt = Date.now();
      ctx.session.assignmentSubmitError = null;

      navReplaceTop(ctx, { name: "assignment_done" });
    } catch (e) {
      const message = e instanceof Error ? e.message : "Submit failed";
      ctx.session.assignmentSubmitError = { message };
      navReplaceTop(ctx, { name: "assignment_done" });
    } finally {
      run.submitInFlight = false;
    }
  }

  finishToLesson(ctx: BotContext): number | null {
    const run = ctx.session.assignmentRun;
    if (!run) return null;
    const lessonId = run.lessonId;
    clearAssignmentRun(ctx);
    return lessonId;
  }

  finish(ctx: BotContext) {
    clearAssignmentRun(ctx);
    navReplaceTop(ctx, { name: "home" });
  }

  async maybeAutoSubmitAndNavigate(
    ctx: BotContext,
    deps: RenderDeps,
  ): Promise<boolean> {
    if (!this.shouldAutoSubmit(ctx)) return false;

    await this.submit(ctx, deps);
    navReplaceTop(ctx, { name: "assignment_done" });

    return true;
  }
}
