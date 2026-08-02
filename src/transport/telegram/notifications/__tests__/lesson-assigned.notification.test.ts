import { test } from "node:test";
import assert from "node:assert/strict";
import type { Bot } from "grammy";

import { LessonAssignedNotificationSender } from "../lesson-assigned.notification.js";
import { env } from "../../../../config/env.js";
import { withEnvOverride } from "../../routes/__tests__/helpers/with-env-override.js";

/**
 * LessonAssignedNotificationSender.send() calls getUserLocale(), which does
 * a real Upstash Redis REST call — unrelated to anything this test suite
 * covers (media vs text), but unavoidable to exercise the class at all.
 * Stubs the one HTTP round trip with an empty-session response (Upstash's
 * auto-pipeline batch shape: an array of {result, error}), so getUserLocale
 * falls back to "en" exactly as it would for any session-less user, instead
 * of making a real network call.
 */
async function withStubbedLocaleLookup(fn: () => Promise<void>): Promise<void> {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = (async () =>
    new Response(JSON.stringify([{ result: null }]), {
      status: 200,
      headers: { "content-type": "application/json" },
    })) as typeof fetch;

  try {
    await fn();
  } finally {
    globalThis.fetch = originalFetch;
  }
}

function createFakeBot(
  overrides: {
    sendAnimationImpl?: (
      chatId: number,
      fileId: string,
      options: unknown,
    ) => Promise<{ message_id: number }>;
  } = {},
) {
  const sendMessageCalls: Array<{
    chatId: number;
    text: string;
    options: unknown;
  }> = [];
  const sendAnimationCalls: Array<{
    chatId: number;
    fileId: string;
    options: unknown;
  }> = [];

  const bot = {
    api: {
      sendMessage: async (chatId: number, text: string, options: unknown) => {
        sendMessageCalls.push({ chatId, text, options });
        return { message_id: 1 };
      },
      sendAnimation: async (
        chatId: number,
        fileId: string,
        options: unknown,
      ) => {
        sendAnimationCalls.push({ chatId, fileId, options });
        if (overrides.sendAnimationImpl) {
          return overrides.sendAnimationImpl(chatId, fileId, options);
        }
        return { message_id: 2 };
      },
      deleteMessage: async () => true,
    },
  };

  return { bot: bot as unknown as Bot, sendMessageCalls, sendAnimationCalls };
}

test("without the lesson-assigned GIF env set — sends the plain text message as before", async () => {
  await withStubbedLocaleLookup(async () => {
    const { bot, sendMessageCalls, sendAnimationCalls } = createFakeBot();
    const sender = new LessonAssignedNotificationSender(bot);

    await sender.send({
      telegramId: 111,
      lessonId: 1,
      lessonTitle: "Past Simple",
    });

    assert.equal(sendAnimationCalls.length, 0);
    assert.equal(sendMessageCalls.length, 1);
    assert.ok(sendMessageCalls[0]?.text.includes("Past Simple"));
  });
});

test("with the lesson-assigned GIF env set — sends an animation, not a duplicate text message", async () => {
  await withStubbedLocaleLookup(() =>
    withEnvOverride(
      env.studentMedia,
      { lessonAssignedGifFileId: "test_lesson_anim" },
      async () => {
        const { bot, sendMessageCalls, sendAnimationCalls } = createFakeBot();
        const sender = new LessonAssignedNotificationSender(bot);

        await sender.send({
          telegramId: 111,
          lessonId: 1,
          lessonTitle: "Past Simple",
        });

        assert.equal(sendAnimationCalls.length, 1);
        assert.equal(sendAnimationCalls[0]?.fileId, "test_lesson_anim");
        assert.equal(sendMessageCalls.length, 0);
      },
    ),
  );
});

test("a bad file_id falls back to the plain text message exactly once", async () => {
  await withStubbedLocaleLookup(() =>
    withEnvOverride(
      env.studentMedia,
      { lessonAssignedGifFileId: "bad_file_id" },
      async () => {
        const { GrammyError } = await import("grammy");
        const { bot, sendMessageCalls, sendAnimationCalls } = createFakeBot({
          sendAnimationImpl: async () => {
            throw new GrammyError(
              "Call failed",
              {
                ok: false,
                error_code: 400,
                description:
                  "Bad Request: wrong file identifier/HTTP URL specified",
                parameters: {},
              },
              "sendAnimation",
              {},
            );
          },
        });
        const sender = new LessonAssignedNotificationSender(bot);

        await sender.send({
          telegramId: 111,
          lessonId: 1,
          lessonTitle: "Past Simple",
        });

        assert.equal(sendAnimationCalls.length, 1);
        assert.equal(sendMessageCalls.length, 1);
      },
    ),
  );
});
