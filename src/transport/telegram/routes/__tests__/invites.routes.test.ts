import { test } from "node:test";
import assert from "node:assert/strict";

import { registerInvitesRoutes } from "../invites.routes.js";
import { env } from "../../../../config/env.js";
import {
  InviteAlreadyProcessedError,
  InviteNotFoundError,
} from "../../../../domain/invites/invites.errors.js";
import { createFakeBot } from "./helpers/fake-bot.js";
import { createMockCtx } from "./helpers/mock-ctx.js";
import { withEnvOverride } from "./helpers/with-env-override.js";

function setup(
  respondImpl: (params: unknown) => Promise<unknown> = async () => ({}),
) {
  const { bot, findCallbackHandler } = createFakeBot();
  const respondCalls: unknown[] = [];

  const invites = {
    respond: async (params: unknown) => {
      respondCalls.push(params);
      return respondImpl(params);
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } as any;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  registerInvitesRoutes(bot as any, invites);

  return { findCallbackHandler, respondCalls };
}

test("accept with the GIF env set — sends invite-accepted as an animation, no duplicate text edit", async () => {
  await withEnvOverride(
    env.studentMedia,
    { teacherRequestAcceptedGifFileId: "test_invite_anim" },
    async () => {
      const { findCallbackHandler } = setup();
      const { ctx, sendAnimationCalls, editMessageTextCalls, replyCalls } =
        createMockCtx({
          callbackQuery: {
            data: "invite_accept:5",
            message: { message_id: 42 },
          },
        });

      await findCallbackHandler("invite_accept:5")!(ctx);

      assert.equal(sendAnimationCalls.length, 1);
      assert.equal(sendAnimationCalls[0]?.fileId, "test_invite_anim");
      assert.ok(
        String(sendAnimationCalls[0]?.options.caption).includes(
          "invite-accepted",
        ),
      );
      assert.equal(editMessageTextCalls.length, 0);
      assert.equal(replyCalls.length, 0);
    },
  );
});

test("accept with the GIF env set — deletes the invite message and does not leave it edited in place", async () => {
  await withEnvOverride(
    env.studentMedia,
    { teacherRequestAcceptedGifFileId: "test_invite_anim" },
    async () => {
      const { findCallbackHandler } = setup();
      const { ctx, deleteMessageCalls } = createMockCtx({
        callbackQuery: { data: "invite_accept:5", message: { message_id: 42 } },
      });

      await findCallbackHandler("invite_accept:5")!(ctx);

      assert.deepEqual(deleteMessageCalls, [{ chatId: 999, messageId: 42 }]);
    },
  );
});

test("accept without the GIF env set — falls back to editing the callback message as before", async () => {
  const { findCallbackHandler } = setup();
  const { ctx, editMessageTextCalls, sendAnimationCalls } = createMockCtx({
    callbackQuery: { data: "invite_accept:5", message: { message_id: 42 } },
  });

  await findCallbackHandler("invite_accept:5")!(ctx);

  assert.equal(sendAnimationCalls.length, 0);
  assert.equal(editMessageTextCalls.length, 1);
  assert.ok(editMessageTextCalls[0]?.text.includes("invite-accepted"));
});

test("decline is never routed through the media path, env set or not", async () => {
  await withEnvOverride(
    env.studentMedia,
    { teacherRequestAcceptedGifFileId: "test_invite_anim" },
    async () => {
      const { findCallbackHandler } = setup();
      const { ctx, editMessageTextCalls, sendAnimationCalls } = createMockCtx({
        callbackQuery: {
          data: "invite_decline:5",
          message: { message_id: 42 },
        },
      });

      await findCallbackHandler("invite_decline:5")!(ctx);

      assert.equal(sendAnimationCalls.length, 0);
      assert.equal(editMessageTextCalls.length, 1);
      assert.ok(editMessageTextCalls[0]?.text.includes("invite-declined"));
    },
  );
});

test("InviteAlreadyProcessedError never reaches the media path, even with the GIF env set", async () => {
  await withEnvOverride(
    env.studentMedia,
    { teacherRequestAcceptedGifFileId: "test_invite_anim" },
    async () => {
      const { findCallbackHandler } = setup(async () => {
        throw new InviteAlreadyProcessedError();
      });
      const { ctx, editMessageTextCalls, sendAnimationCalls } = createMockCtx({
        callbackQuery: { data: "invite_accept:5", message: { message_id: 42 } },
      });

      await findCallbackHandler("invite_accept:5")!(ctx);

      assert.equal(sendAnimationCalls.length, 0);
      assert.ok(
        editMessageTextCalls.some((c) =>
          c.text.includes("invite-err-already-processed"),
        ),
      );
    },
  );
});

test("InviteNotFoundError never reaches the media path, even with the GIF env set", async () => {
  await withEnvOverride(
    env.studentMedia,
    { teacherRequestAcceptedGifFileId: "test_invite_anim" },
    async () => {
      const { findCallbackHandler } = setup(async () => {
        throw new InviteNotFoundError();
      });
      const { ctx, editMessageTextCalls, sendAnimationCalls } = createMockCtx({
        callbackQuery: { data: "invite_accept:5", message: { message_id: 42 } },
      });

      await findCallbackHandler("invite_accept:5")!(ctx);

      assert.equal(sendAnimationCalls.length, 0);
      assert.ok(
        editMessageTextCalls.some((c) =>
          c.text.includes("invite-err-not-found"),
        ),
      );
    },
  );
});
