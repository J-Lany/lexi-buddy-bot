import { test } from "node:test";
import assert from "node:assert/strict";

import { registerProfileRoutes } from "../profile.routes.js";
import { createFakeBot } from "./helpers/fake-bot.js";
import { createMockCtx } from "./helpers/mock-ctx.js";

function setup() {
  const { bot, callbackHandlers } = createFakeBot();

  const deps = {
    lessons: {},
    profile: {},
    studentAssignments: {},
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } as any;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  registerProfileRoutes(bot as any, deps);

  return { callbackHandlers };
}

test("nav:help from a media Home screen — renderHelpScreen makes a single safeEditScreen call, so the media message is replaced directly with no editMessageText call at all", async () => {
  const { callbackHandlers } = setup();
  const { ctx, editMessageTextCalls, replyCalls, deleteMessageCalls } =
    createMockCtx({
      session: {
        ui: { screenMessageId: 321, screenMessageKind: "media" },
      },
    });

  await callbackHandlers.get("nav:help")!(ctx);

  assert.equal(editMessageTextCalls.length, 0);
  assert.equal(replyCalls.length, 1);
  assert.deepEqual(deleteMessageCalls, [{ chatId: 999, messageId: 321 }]);
  assert.equal(ctx.session.ui.screenMessageId, 555);
  assert.equal(ctx.session.ui.screenMessageKind, "text");
});
