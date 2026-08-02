import { test } from "node:test";
import assert from "node:assert/strict";
import { GrammyError } from "grammy";
import type { Api } from "grammy";

import { sendMediaOrFallback } from "../send-media-or-fallback.js";
import { TELEGRAM_MEDIA_CAPTION_SAFE_LENGTH } from "../caption-limits.js";

function grammyError(errorCode: number, description: string): GrammyError {
  return new GrammyError(
    "Call failed",
    { ok: false, error_code: errorCode, description, parameters: {} },
    "sendAnimation",
    {},
  );
}

type Call = { chatId: number | string; fileId: string; options: unknown };

function createFakeApi(
  overrides: {
    sendAnimationImpl?: (
      chatId: number | string,
      fileId: string,
      options: unknown,
    ) => Promise<{ message_id: number }>;
    sendVideoImpl?: (
      chatId: number | string,
      fileId: string,
      options: unknown,
    ) => Promise<{ message_id: number }>;
    deleteMessageImpl?: (
      chatId: number | string,
      messageId: number,
    ) => Promise<true>;
  } = {},
) {
  const sendAnimationCalls: Call[] = [];
  const sendVideoCalls: Call[] = [];
  const deleteMessageCalls: Array<{
    chatId: number | string;
    messageId: number;
  }> = [];

  const api = {
    sendAnimation: async (
      chatId: number | string,
      fileId: string,
      options: unknown,
    ) => {
      sendAnimationCalls.push({ chatId, fileId, options });
      return overrides.sendAnimationImpl
        ? overrides.sendAnimationImpl(chatId, fileId, options)
        : { message_id: 1001 };
    },
    sendVideo: async (
      chatId: number | string,
      fileId: string,
      options: unknown,
    ) => {
      sendVideoCalls.push({ chatId, fileId, options });
      return overrides.sendVideoImpl
        ? overrides.sendVideoImpl(chatId, fileId, options)
        : { message_id: 2001 };
    },
    deleteMessage: async (chatId: number | string, messageId: number) => {
      deleteMessageCalls.push({ chatId, messageId });
      return overrides.deleteMessageImpl
        ? overrides.deleteMessageImpl(chatId, messageId)
        : (true as const);
    },
  };

  return {
    api: api as unknown as Api,
    sendAnimationCalls,
    sendVideoCalls,
    deleteMessageCalls,
  };
}

test("no fileId — only fallback runs, no Telegram media call", async () => {
  const { api, sendAnimationCalls } = createFakeApi();
  let fallbackCalls = 0;

  await sendMediaOrFallback({
    api,
    chatId: 1,
    fileId: undefined,
    kind: "animation",
    caption: "hello",
    fallback: async () => {
      fallbackCalls += 1;
    },
    event: "test",
  });

  assert.equal(fallbackCalls, 1);
  assert.equal(sendAnimationCalls.length, 0);
});

test("caption longer than the safe length — skips media entirely, goes straight to fallback", async () => {
  const { api, sendAnimationCalls } = createFakeApi();
  let fallbackCalls = 0;

  await sendMediaOrFallback({
    api,
    chatId: 1,
    fileId: "anim_1",
    kind: "animation",
    caption: "x".repeat(TELEGRAM_MEDIA_CAPTION_SAFE_LENGTH + 1),
    fallback: async () => {
      fallbackCalls += 1;
    },
    event: "test",
  });

  assert.equal(fallbackCalls, 1);
  assert.equal(sendAnimationCalls.length, 0);
});

test("successful animation send — sendAnimation called, fallback not called, options passed through unchanged", async () => {
  const { api, sendAnimationCalls } = createFakeApi();
  let fallbackCalls = 0;

  await sendMediaOrFallback({
    api,
    chatId: 42,
    fileId: "anim_1",
    kind: "animation",
    caption: "hello",
    options: { parse_mode: "HTML", reply_markup: { inline_keyboard: [] } },
    fallback: async () => {
      fallbackCalls += 1;
    },
    event: "test",
  });

  assert.equal(fallbackCalls, 0);
  assert.equal(sendAnimationCalls.length, 1);
  assert.equal(sendAnimationCalls[0]?.chatId, 42);
  assert.equal(sendAnimationCalls[0]?.fileId, "anim_1");
  assert.deepEqual(sendAnimationCalls[0]?.options, {
    caption: "hello",
    parse_mode: "HTML",
    reply_markup: { inline_keyboard: [] },
  });
});

test("successful video send uses sendVideo, not sendAnimation", async () => {
  const { api, sendVideoCalls, sendAnimationCalls } = createFakeApi();

  await sendMediaOrFallback({
    api,
    chatId: 42,
    fileId: "vid_1",
    kind: "video",
    caption: "result",
    fallback: async () => {},
    event: "test",
  });

  assert.equal(sendVideoCalls.length, 1);
  assert.equal(sendAnimationCalls.length, 0);
});

test("options without parse_mode never gets one injected by the helper", async () => {
  const { api, sendAnimationCalls } = createFakeApi();

  await sendMediaOrFallback({
    api,
    chatId: 1,
    fileId: "anim_1",
    kind: "animation",
    caption: "hello",
    fallback: async () => {},
    event: "test",
  });

  const options = sendAnimationCalls[0]?.options as Record<string, unknown>;
  assert.equal("parse_mode" in options, false);
});

test("previousMessageId set and send succeeds — old message deleted exactly once, after onSent", async () => {
  const { api, deleteMessageCalls } = createFakeApi();
  const order: string[] = [];

  await sendMediaOrFallback({
    api,
    chatId: 1,
    fileId: "anim_1",
    kind: "animation",
    caption: "hello",
    previousMessageId: 555,
    onSent: () => order.push("onSent"),
    fallback: async () => {},
    event: "test",
  });

  assert.deepEqual(deleteMessageCalls, [{ chatId: 1, messageId: 555 }]);
  assert.deepEqual(order, ["onSent"]);
});

test("previousMessageId not set — deleteMessage is never called", async () => {
  const { api, deleteMessageCalls } = createFakeApi();

  await sendMediaOrFallback({
    api,
    chatId: 1,
    fileId: "anim_1",
    kind: "animation",
    caption: "hello",
    fallback: async () => {},
    event: "test",
  });

  assert.equal(deleteMessageCalls.length, 0);
});

test("previousMessageId equal to the new message id — deleteMessage is never called", async () => {
  const { api, deleteMessageCalls } = createFakeApi({
    sendAnimationImpl: async () => ({ message_id: 555 }),
  });

  await sendMediaOrFallback({
    api,
    chatId: 1,
    fileId: "anim_1",
    kind: "animation",
    caption: "hello",
    previousMessageId: 555,
    fallback: async () => {},
    event: "test",
  });

  assert.equal(deleteMessageCalls.length, 0);
});

test("media-file error (bad file_id) — falls back to text exactly once, no duplicate, no throw", async () => {
  const { api, deleteMessageCalls } = createFakeApi({
    sendAnimationImpl: async () => {
      throw grammyError(
        400,
        "Bad Request: wrong file identifier/HTTP URL specified",
      );
    },
  });
  let fallbackCalls = 0;

  await sendMediaOrFallback({
    api,
    chatId: 1,
    fileId: "bad_id",
    kind: "animation",
    caption: "hello",
    previousMessageId: 555,
    fallback: async () => {
      fallbackCalls += 1;
    },
    event: "test",
  });

  assert.equal(fallbackCalls, 1);
  assert.equal(deleteMessageCalls.length, 0);
});

test("a non-media error is rethrown, not swallowed — fallback is not called", async () => {
  const { api } = createFakeApi({
    sendAnimationImpl: async () => {
      throw grammyError(403, "Forbidden: bot was blocked by the user");
    },
  });
  let fallbackCalls = 0;

  await assert.rejects(
    () =>
      sendMediaOrFallback({
        api,
        chatId: 1,
        fileId: "anim_1",
        kind: "animation",
        caption: "hello",
        fallback: async () => {
          fallbackCalls += 1;
        },
        event: "test",
      }),
    GrammyError,
  );

  assert.equal(fallbackCalls, 0);
});

test("onSent throws after a successful send — the error propagates, fallback is NOT called, no duplicate text is sent", async () => {
  const { api, sendAnimationCalls } = createFakeApi();
  let fallbackCalls = 0;

  await assert.rejects(
    () =>
      sendMediaOrFallback({
        api,
        chatId: 1,
        fileId: "anim_1",
        kind: "animation",
        caption: "hello",
        onSent: () => {
          throw new Error("session write failed");
        },
        fallback: async () => {
          fallbackCalls += 1;
        },
        event: "test",
      }),
    /session write failed/,
  );

  assert.equal(fallbackCalls, 0);
  assert.equal(sendAnimationCalls.length, 1);
});

test("a failed deleteMessage does not throw and does not trigger fallback", async () => {
  const { api } = createFakeApi({
    deleteMessageImpl: async () => {
      throw new Error("message already gone");
    },
  });
  let fallbackCalls = 0;

  await sendMediaOrFallback({
    api,
    chatId: 1,
    fileId: "anim_1",
    kind: "animation",
    caption: "hello",
    previousMessageId: 555,
    fallback: async () => {
      fallbackCalls += 1;
    },
    event: "test",
  });

  assert.equal(fallbackCalls, 0);
});
