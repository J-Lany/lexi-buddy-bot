import { test } from "node:test";
import assert from "node:assert/strict";

import { registerLanguageRoutes } from "../language.routes.js";
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
  registerLanguageRoutes(bot as any, deps);

  return { callbackHandlers };
}

test("nav:language from a media Home screen — a single direct safeEditScreen call replaces the media message with no editMessageText call", async () => {
  const { callbackHandlers } = setup();
  const { ctx, editMessageTextCalls, replyCalls, deleteMessageCalls } =
    createMockCtx({
      session: {
        ui: { screenMessageId: 321, screenMessageKind: "media" },
      },
    });
  (ctx as unknown as { i18n: { getLocale: () => Promise<string> } }).i18n = {
    getLocale: async () => "ru",
  };

  await callbackHandlers.get("nav:language")!(ctx);

  assert.equal(editMessageTextCalls.length, 0);
  assert.equal(replyCalls.length, 1);
  assert.deepEqual(deleteMessageCalls, [{ chatId: 999, messageId: 321 }]);
  assert.equal(ctx.session.ui.screenMessageId, 555);
  assert.equal(ctx.session.ui.screenMessageKind, "text");
});
