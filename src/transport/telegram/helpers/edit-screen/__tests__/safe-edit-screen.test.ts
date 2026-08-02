import { test } from "node:test";
import assert from "node:assert/strict";

import { safeEditScreen } from "../safe-edit-screen.js";
import { createMockCtx } from "../../../routes/__tests__/helpers/mock-ctx.js";

test("kind=media — never calls editMessageText, replaces via reply, updates id/kind, deletes old media message", async () => {
  const { ctx, editMessageTextCalls, replyCalls, deleteMessageCalls } =
    createMockCtx({
      session: {
        ui: { screenMessageId: 321, screenMessageKind: "media" },
      },
    });

  await safeEditScreen(ctx, "new-text");

  // editMessageText is untouched here (the default mock impl, which pushes
  // every real call onto editMessageTextCalls), so this length check
  // genuinely proves it was never invoked.
  assert.equal(editMessageTextCalls.length, 0);
  assert.equal(replyCalls.length, 1);
  assert.equal(ctx.session.ui.screenMessageId, 555);
  assert.equal(ctx.session.ui.screenMessageKind, "text");
  assert.deepEqual(deleteMessageCalls, [{ chatId: 999, messageId: 321 }]);
});

test("kind=media — if the replacement reply fails, the old media id/kind are left untouched and the error propagates", async () => {
  const { ctx, deleteMessageCalls } = createMockCtx({
    session: {
      ui: { screenMessageId: 321, screenMessageKind: "media" },
    },
  });
  ctx.reply = (async () => {
    throw new Error("network error");
  }) as typeof ctx.reply;

  await assert.rejects(() => safeEditScreen(ctx, "new-text"));

  assert.equal(ctx.session.ui.screenMessageId, 321);
  assert.equal(ctx.session.ui.screenMessageKind, "media");
  assert.equal(deleteMessageCalls.length, 0);
});

test("kind=media — a failing delete of the old message does not fail the call, retry the reply, or revert the updated session state", async () => {
  const { ctx, replyCalls } = createMockCtx({
    session: {
      ui: { screenMessageId: 321, screenMessageKind: "media" },
    },
  });
  ctx.api.deleteMessage = (async () => {
    throw new Error("message to delete not found");
  }) as typeof ctx.api.deleteMessage;

  await assert.doesNotReject(() => safeEditScreen(ctx, "new-text"));

  assert.equal(replyCalls.length, 1, "the replacement must not be sent twice");
  assert.equal(ctx.session.ui.screenMessageId, 555);
  assert.equal(ctx.session.ui.screenMessageKind, "text");
});

test("kind=undefined (legacy session) — editMessageText is attempted exactly once; a media-shaped error then falls back to replace", async () => {
  const { ctx, replyCalls, deleteMessageCalls } = createMockCtx({
    session: { ui: { screenMessageId: 321 } },
  });
  // The mock's own editMessageTextCalls tracker is bypassed by this
  // override, so it can't be used to prove the call happened — count it
  // independently instead.
  let editMessageTextCallCount = 0;
  ctx.api.editMessageText = (async () => {
    editMessageTextCallCount++;
    throw new Error("Bad Request: there is no text in the message to edit");
  }) as typeof ctx.api.editMessageText;

  await safeEditScreen(ctx, "new-text");

  assert.equal(
    editMessageTextCallCount,
    1,
    "an unknown kind must still attempt editMessageText before falling back",
  );
  assert.equal(replyCalls.length, 1);
  assert.equal(ctx.session.ui.screenMessageId, 555);
  assert.equal(ctx.session.ui.screenMessageKind, "text");
  assert.deepEqual(deleteMessageCalls, [{ chatId: 999, messageId: 321 }]);
});

test("kind=undefined (legacy session) — editMessageText is attempted exactly once; 'message is not modified' self-heals kind to text without replacing anything", async () => {
  const { ctx, replyCalls, deleteMessageCalls } = createMockCtx({
    session: { ui: { screenMessageId: 321 } },
  });
  let editMessageTextCallCount = 0;
  ctx.api.editMessageText = (async () => {
    editMessageTextCallCount++;
    throw new Error("Bad Request: message is not modified");
  }) as typeof ctx.api.editMessageText;

  await safeEditScreen(ctx, "new-text");

  assert.equal(editMessageTextCallCount, 1);
  assert.equal(replyCalls.length, 0);
  assert.equal(deleteMessageCalls.length, 0);
  assert.equal(ctx.session.ui.screenMessageId, 321);
  assert.equal(ctx.session.ui.screenMessageKind, "text");
});

test("kind=text — edits in place as before, no reply/delete, kind stays text", async () => {
  const { ctx, editMessageTextCalls, replyCalls, deleteMessageCalls } =
    createMockCtx({
      session: {
        ui: { screenMessageId: 321, screenMessageKind: "text" },
      },
    });

  await safeEditScreen(ctx, "new-text");

  assert.equal(editMessageTextCalls.length, 1);
  assert.equal(editMessageTextCalls[0]?.messageId, 321);
  assert.equal(replyCalls.length, 0);
  assert.equal(deleteMessageCalls.length, 0);
  assert.equal(ctx.session.ui.screenMessageId, 321);
  assert.equal(ctx.session.ui.screenMessageKind, "text");
});
