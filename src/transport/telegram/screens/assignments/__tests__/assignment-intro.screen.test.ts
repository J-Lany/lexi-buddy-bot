import { test } from "node:test";
import assert from "node:assert/strict";

import type { BotContext } from "../../../context.js";
import type { SessionData } from "../../../session.js";
import type { InternalAssignmentDto } from "../../../../../infra/backend-api/backend-api.types.js";
import { renderAssignmentIntroScreen } from "../assignment-intro.screen.js";

type CallLogEntry =
  | { type: "editMessageText"; messageId: number; text: string }
  | { type: "reply"; messageId: number; text: string; options: unknown }
  | { type: "deleteMessage"; messageId: number };

function createScreenMockCtx() {
  const log: CallLogEntry[] = [];
  let nextMessageId = 1000;

  const session: SessionData = {
    userId: undefined,
    nav: { stack: [{ name: "assignment_intro", assignmentId: 1 }] },
    ui: {},
  };

  const ctx = {
    from: { id: 111 },
    chat: { id: 999 },
    session,
    t: ((key: string) => key) as BotContext["t"],
    api: {
      editMessageText: async (
        _chatId: number,
        messageId: number,
        text: string,
      ) => {
        log.push({ type: "editMessageText", messageId, text });
      },
      deleteMessage: async (_chatId: number, messageId: number) => {
        log.push({ type: "deleteMessage", messageId });
      },
    },
    reply: async (text: string, options?: unknown) => {
      const messageId = nextMessageId++;
      log.push({ type: "reply", messageId, text, options });
      return { message_id: messageId };
    },
  };

  return { ctx: ctx as unknown as BotContext, log };
}

function hugeAssignment(): InternalAssignmentDto {
  return {
    assignmentId: 1,
    type: "definition_quiz",
    lesson: {
      lessonId: 1,
      title: "Lesson",
      targetLanguage: "en",
      nativeLanguage: "ru",
      instructionLanguage: "ru",
      level: null,
      ageCategory: null,
      topic: null,
      // Long enough to force at least one preceding (overflow) message.
      additionalInstructions: "x".repeat(6000),
    },
    questions: [],
    vocab: [],
  };
}

function fakeDeps(assignment: InternalAssignmentDto) {
  return {
    lessons: {},
    profile: {},
    studentAssignments: {
      preview: async () => assignment,
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } as any;
}

test("the interactive assignment message is sent as a NEW message after all extras, not edited in the old loading message", async () => {
  const { ctx, log } = createScreenMockCtx();
  const deps = fakeDeps(hugeAssignment());

  await renderAssignmentIntroScreen(ctx, deps, {
    name: "assignment_intro",
    assignmentId: 1,
  });

  const replies = log.filter(
    (e): e is Extract<CallLogEntry, { type: "reply" }> => e.type === "reply",
  );
  assert.ok(
    replies.length >= 3,
    "expected loading + at least one extra + the final interactive reply",
  );

  // First reply is the "loading" placeholder.
  assert.equal(replies[0]!.text, "loading");

  // The LAST reply must be the interactive message (it carries the keyboard).
  const lastReply = replies[replies.length - 1]!;
  assert.ok(
    (lastReply.options as { reply_markup?: unknown } | undefined)?.reply_markup,
    "the final message must carry the interactive keyboard",
  );

  // Every reply BEFORE the last one that isn't the loading placeholder is an extra —
  // it must come before the interactive message in the log, proving correct order.
  const lastReplyIndex = log.indexOf(lastReply);
  const extrasBeforeMain = replies.slice(1, -1);
  assert.ok(
    extrasBeforeMain.length >= 1,
    "expected at least one extra (overflow) message",
  );
  for (const extra of extrasBeforeMain) {
    assert.ok(
      log.indexOf(extra) < lastReplyIndex,
      "extras must appear before the interactive message",
    );
  }

  // The interactive message must NEVER be sent via editMessageText — that
  // would leave it positioned at the OLD (earlier) message's spot.
  const edits = log.filter((e) => e.type === "editMessageText");
  assert.equal(
    edits.length,
    0,
    "the interactive message must be a new send, not an edit",
  );

  // The stale loading placeholder must be cleaned up (not left dangling).
  const deletions = log.filter(
    (e): e is Extract<CallLogEntry, { type: "deleteMessage" }> =>
      e.type === "deleteMessage",
  );
  assert.equal(deletions.length, 1);
  assert.equal(deletions[0]!.messageId, replies[0]!.messageId);

  // screenMessageId must now point at the final interactive message, not the old loading one.
  assert.equal(ctx.session.ui.screenMessageId, lastReply.messageId);
});

test("reopening the same assignment intro does not resend the extras again", async () => {
  const { ctx, log } = createScreenMockCtx();
  const deps = fakeDeps(hugeAssignment());
  const screen = { name: "assignment_intro" as const, assignmentId: 1 };

  await renderAssignmentIntroScreen(ctx, deps, screen);
  const extraTextsAfterFirst = log
    .filter(
      (e): e is Extract<CallLogEntry, { type: "reply" }> => e.type === "reply",
    )
    .filter((e) => e.text !== "loading")
    .map((e) => e.text);
  const extraOverflowTexts = extraTextsAfterFirst.slice(0, -1); // exclude the final interactive message
  assert.ok(
    extraOverflowTexts.length >= 1,
    "first render must have sent at least one overflow extra",
  );

  const logLengthBeforeSecondRender = log.length;
  await renderAssignmentIntroScreen(ctx, deps, screen);
  const newEntries = log.slice(logLengthBeforeSecondRender);

  // None of the extras from the first render should be sent again.
  const newReplyTexts = newEntries
    .filter(
      (e): e is Extract<CallLogEntry, { type: "reply" }> => e.type === "reply",
    )
    .map((e) => e.text);
  for (const overflowText of extraOverflowTexts) {
    assert.ok(
      !newReplyTexts.includes(overflowText),
      "an overflow extra was resent on reopening the same assignment",
    );
  }
});

test("a small assignment (no overflow) still sends a fresh interactive message, not an edit", async () => {
  const small: InternalAssignmentDto = {
    assignmentId: 2,
    type: "definition_quiz",
    lesson: {
      lessonId: 1,
      title: "Lesson",
      targetLanguage: "en",
      nativeLanguage: "ru",
      instructionLanguage: "ru",
      level: null,
      ageCategory: null,
      topic: null,
      additionalInstructions: "Short comment.",
    },
    questions: [],
    vocab: [{ term: "cat", translation: "кот" }],
  };

  const { ctx, log } = createScreenMockCtx();
  const deps = fakeDeps(small);

  await renderAssignmentIntroScreen(ctx, deps, {
    name: "assignment_intro",
    assignmentId: 2,
  });

  const replies = log.filter((e) => e.type === "reply");
  // loading + final interactive message, no extras.
  assert.equal(replies.length, 2);
  assert.equal(
    ctx.session.ui.screenMessageId,
    (replies[1] as { messageId: number }).messageId,
  );
});
