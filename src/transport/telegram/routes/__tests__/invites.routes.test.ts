import { test } from "node:test";
import assert from "node:assert/strict";

import { registerInvitesRoutes } from "../invites.routes.js";
import { env } from "../../../../config/env.js";
import {
  InviteAlreadyAcceptedError,
  InviteAlreadyDeclinedError,
  InviteNotFoundError,
} from "../../../../domain/invites/invites.errors.js";
import { createFakeBot } from "./helpers/fake-bot.js";
import { createMockCtx } from "./helpers/mock-ctx.js";
import { withEnvOverride } from "./helpers/with-env-override.js";

function setup(
  respondImpl: (params: unknown) => Promise<unknown> = async () => ({}),
) {
  const { bot, findCallbackHandler } = createFakeBot();
  // Test doubles intentionally implement only the route-facing surface.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  registerInvitesRoutes(bot as any, { respond: respondImpl } as any);
  return { findCallbackHandler };
}

test("successful Accept removes the original keyboard and sends a new success message", async () => {
  const { findCallbackHandler } = setup();
  const { ctx, editMessageReplyMarkupCalls, replyCalls, editMessageTextCalls } =
    createMockCtx({
      callbackQuery: { data: "invite_accept:5", message: { message_id: 42 } },
    });

  await findCallbackHandler("invite_accept:5")!(ctx);

  assert.deepEqual(editMessageReplyMarkupCalls, [
    {
      chatId: 999,
      messageId: 42,
      options: { reply_markup: { inline_keyboard: [] } },
    },
  ]);
  assert.ok(replyCalls.some((call) => call.text.includes("invite-accepted")));
  assert.equal(editMessageTextCalls.length, 0);
});

test("successful Accept with GIF keeps original history and sends a new animation", async () => {
  await withEnvOverride(
    env.studentMedia,
    { teacherRequestAcceptedGifFileId: "test_invite_anim" },
    async () => {
      const { findCallbackHandler } = setup();
      const { ctx, sendAnimationCalls, deleteMessageCalls } = createMockCtx({
        callbackQuery: { data: "invite_accept:5", message: { message_id: 42 } },
      });

      await findCallbackHandler("invite_accept:5")!(ctx);

      assert.equal(sendAnimationCalls.length, 1);
      assert.ok(
        String(sendAnimationCalls[0]?.options.caption).includes(
          "invite-accepted",
        ),
      );
      assert.equal(deleteMessageCalls.length, 0);
    },
  );
});

test("successful Decline removes the original keyboard and sends a new result message", async () => {
  const { findCallbackHandler } = setup();
  const { ctx, editMessageReplyMarkupCalls, replyCalls, editMessageTextCalls } =
    createMockCtx({
      callbackQuery: { data: "invite_decline:5", message: { message_id: 42 } },
    });

  await findCallbackHandler("invite_decline:5")!(ctx);

  assert.equal(editMessageReplyMarkupCalls.length, 1);
  assert.ok(replyCalls.some((call) => call.text.includes("invite-declined")));
  assert.equal(editMessageTextCalls.length, 0);
});

test("keyboard cleanup failure does not suppress the committed success result", async () => {
  const { findCallbackHandler } = setup();
  const { ctx, replyCalls } = createMockCtx({
    callbackQuery: { data: "invite_accept:5", message: { message_id: 42 } },
    editMessageReplyMarkupImpl: async () => {
      throw new Error("Telegram cleanup failed");
    },
  });

  await findCallbackHandler("invite_accept:5")!(ctx);
  assert.ok(replyCalls.some((call) => call.text.includes("invite-accepted")));
});

for (const [action, resultKey] of [
  ["accept", "invite-accepted"],
  ["decline", "invite-declined"],
] as const) {
  test(`successful ${action} is not reported as a business failure when result delivery fails`, async () => {
    await withEnvOverride(
      env.studentMedia,
      { teacherRequestAcceptedGifFileId: undefined },
      async () => {
        let respondCalls = 0;
        const { findCallbackHandler } = setup(async () => {
          respondCalls += 1;
          return {};
        });
        const callbackData = `invite_${action}:5`;
        const { ctx, replyCalls } = createMockCtx({
          callbackQuery: { data: callbackData, message: { message_id: 42 } },
          replyImpl: async () => {
            throw new Error("Telegram result delivery failed");
          },
        });

        await findCallbackHandler(callbackData)!(ctx);

        assert.equal(respondCalls, 1);
        assert.ok(replyCalls.some((call) => call.text.includes(resultKey)));
        assert.ok(
          replyCalls.every(
            (call) => !call.text.includes("invite-err-process-failed"),
          ),
        );
      },
    );
  });
}

for (const [ErrorType, expectedKey] of [
  [InviteAlreadyAcceptedError, "invite-err-already-accepted"],
  [InviteAlreadyDeclinedError, "invite-err-already-declined"],
  [InviteNotFoundError, "invite-err-not-found"],
] as const) {
  test(`${ErrorType.name} maps to human-readable copy`, async () => {
    const { findCallbackHandler } = setup(async () => {
      throw new ErrorType();
    });
    const { ctx, replyCalls } = createMockCtx({
      callbackQuery: { data: "invite_accept:5", message: { message_id: 42 } },
    });

    await findCallbackHandler("invite_accept:5")!(ctx);
    assert.ok(replyCalls.some((call) => call.text.includes(expectedKey)));
  });
}

test("unknown Axios-style failures use safe fallback and never expose raw message", async () => {
  const raw = "Request failed with status code 400";
  const { findCallbackHandler } = setup(async () => {
    throw new Error(raw);
  });
  const { ctx, replyCalls } = createMockCtx({
    callbackQuery: { data: "invite_accept:5", message: { message_id: 42 } },
  });

  await findCallbackHandler("invite_accept:5")!(ctx);

  assert.ok(
    replyCalls.some((call) => call.text.includes("invite-err-process-failed")),
  );
  assert.ok(replyCalls.every((call) => !call.text.includes(raw)));
});
