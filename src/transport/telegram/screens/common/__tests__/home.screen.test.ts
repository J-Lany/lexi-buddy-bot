import { test } from "node:test";
import assert from "node:assert/strict";

import { renderHomeScreen } from "../home.screen.js";
import { env } from "../../../../../config/env.js";
import { createMockCtx } from "../../../routes/__tests__/helpers/mock-ctx.js";
import { withEnvOverride } from "../../../routes/__tests__/helpers/with-env-override.js";

const HOME_SCREEN = { name: "home" as const };

test("home screen without the main menu GIF env set — edits in place as before", async () => {
  const { ctx, editMessageTextCalls, sendAnimationCalls } = createMockCtx({
    session: { ui: { screenMessageId: 321 }, nav: { stack: [HOME_SCREEN] } },
  });

  await renderHomeScreen(ctx, {} as never, HOME_SCREEN);

  assert.equal(sendAnimationCalls.length, 0);
  assert.equal(editMessageTextCalls.length, 1);
  assert.equal(editMessageTextCalls[0]?.messageId, 321);
});

test("home screen with the main menu GIF env set — sends an animation, not a duplicate text edit", async () => {
  await withEnvOverride(
    env.studentMedia,
    { mainMenuGifFileId: "test_menu_anim" },
    async () => {
      const { ctx, sendAnimationCalls, editMessageTextCalls, replyCalls } =
        createMockCtx({
          session: {
            ui: { screenMessageId: 321 },
            nav: { stack: [HOME_SCREEN] },
          },
        });

      await renderHomeScreen(ctx, {} as never, HOME_SCREEN);

      assert.equal(sendAnimationCalls.length, 1);
      assert.equal(sendAnimationCalls[0]?.fileId, "test_menu_anim");
      assert.equal(editMessageTextCalls.length, 0);
      assert.equal(replyCalls.length, 0);
    },
  );
});

test("home screen with the main menu GIF env set — deletes the old tracked message and re-tracks the new one", async () => {
  await withEnvOverride(
    env.studentMedia,
    { mainMenuGifFileId: "test_menu_anim" },
    async () => {
      const { ctx, deleteMessageCalls } = createMockCtx({
        session: {
          ui: { screenMessageId: 321 },
          nav: { stack: [HOME_SCREEN] },
        },
      });

      await renderHomeScreen(ctx, {} as never, HOME_SCREEN);

      assert.deepEqual(deleteMessageCalls, [{ chatId: 999, messageId: 321 }]);
      assert.notEqual(ctx.session.ui.screenMessageId, 321);
    },
  );
});

test("home screen with the main menu GIF env set but no previously tracked message — sends animation, no delete attempted", async () => {
  await withEnvOverride(
    env.studentMedia,
    { mainMenuGifFileId: "test_menu_anim" },
    async () => {
      const { ctx, sendAnimationCalls, deleteMessageCalls } = createMockCtx({
        session: { ui: {}, nav: { stack: [HOME_SCREEN] } },
      });

      await renderHomeScreen(ctx, {} as never, HOME_SCREEN);

      assert.equal(sendAnimationCalls.length, 1);
      assert.equal(deleteMessageCalls.length, 0);
    },
  );
});

test("a screen other than home is ignored entirely, media env or not", async () => {
  await withEnvOverride(
    env.studentMedia,
    { mainMenuGifFileId: "test_menu_anim" },
    async () => {
      const { ctx, sendAnimationCalls, editMessageTextCalls } = createMockCtx({
        session: { nav: { stack: [{ name: "help" }] } },
      });

      await renderHomeScreen(ctx, {} as never, { name: "help" });

      assert.equal(sendAnimationCalls.length, 0);
      assert.equal(editMessageTextCalls.length, 0);
    },
  );
});
