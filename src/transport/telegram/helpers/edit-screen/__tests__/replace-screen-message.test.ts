import { test } from "node:test";
import assert from "node:assert/strict";

import { replaceScreenMessage } from "../replace-screen-message.js";
import { createMockCtx } from "../../../routes/__tests__/helpers/mock-ctx.js";

test("replaceScreenMessage — after a successful send, tracks the new message id with kind=text", async () => {
  const { ctx, replyCalls, deleteMessageCalls } = createMockCtx({
    session: {
      ui: { screenMessageId: 321, screenMessageKind: "media" },
    },
  });

  await replaceScreenMessage(ctx, "new-text");

  assert.equal(replyCalls.length, 1);
  assert.equal(ctx.session.ui.screenMessageId, 555);
  assert.equal(ctx.session.ui.screenMessageKind, "text");
  assert.deepEqual(deleteMessageCalls, [{ chatId: 999, messageId: 321 }]);
});
