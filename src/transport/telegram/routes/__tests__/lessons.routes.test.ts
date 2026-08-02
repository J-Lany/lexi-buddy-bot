import { test } from "node:test";
import assert from "node:assert/strict";

import { registerLessonsRoutes } from "../lessons.routes.js";
import { createFakeBot } from "./helpers/fake-bot.js";
import { createMockCtx } from "./helpers/mock-ctx.js";

function setup() {
  const { bot, callbackHandlers } = createFakeBot();

  const deps = {
    lessons: { listForStudent: async () => [] },
    profile: {},
    studentAssignments: {},
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } as any;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  registerLessonsRoutes(bot as any, deps);

  return { callbackHandlers };
}

test("nav:lessons from a media Home screen replaces the tracked media message with a new text message, then edits that new message in place for the final list", async () => {
  const { callbackHandlers } = setup();
  const {
    ctx,
    editMessageTextCalls,
    replyCalls,
    deleteMessageCalls,
    allShownText,
  } = createMockCtx({
    session: {
      ui: { screenMessageId: 321, screenMessageKind: "media" },
    },
  });

  await callbackHandlers.get("nav:lessons")!(ctx);

  // Never edits the old media message directly.
  assert.ok(
    !editMessageTextCalls.some((c) => c.messageId === 321),
    "must never call editMessageText against the tracked media message id",
  );

  // Step 1: the loading screen is a fresh text message, not an edit.
  assert.equal(replyCalls.length, 1);
  assert.equal(replyCalls[0]?.text, "loading");

  // Step 2: session now points at the new text message.
  assert.equal(ctx.session.ui.screenMessageId, 555);
  assert.equal(ctx.session.ui.screenMessageKind, "text");

  // Step 3: the old media message is cleaned up.
  assert.deepEqual(deleteMessageCalls, [{ chatId: 999, messageId: 321 }]);

  // Step 4: the final lessons list is an edit-in-place of the NEW text
  // message (text -> text), not another replace.
  assert.equal(editMessageTextCalls.length, 1);
  assert.equal(editMessageTextCalls[0]?.messageId, 555);

  assert.ok(
    !allShownText().some((text) => text.includes("error-generic")),
    "must not fall back to the generic error screen",
  );
});
