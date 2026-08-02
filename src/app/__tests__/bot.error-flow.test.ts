import { test } from "node:test";
import assert from "node:assert/strict";

import { Bot, session } from "grammy";
import type { StorageAdapter } from "grammy";

import { createTracingMiddleware } from "../../transport/telegram/middlewares/tracing.middleware.js";
import { setupErrorHandler } from "../../transport/telegram/middlewares/error-handler.js";
import { createUpdateTracker } from "../../observability/update-tracker.js";
import { captureConsole } from "../../observability/__tests__/helpers/log-capture.js";
import { SessionWriteError } from "../../infra/session/session-write-error.js";
import type { BotContext } from "../../transport/telegram/context.js";
import type { SessionData } from "../../transport/telegram/session.js";

function buildUpdate(id: number) {
  return {
    update_id: id,
    message: {
      message_id: 10,
      date: 0,
      chat: { id: 999, type: "private" as const },
      from: { id: 111, is_bot: false, first_name: "Anna" },
      text: "/start",
    },
  };
}

// A real `Bot` instance is required here (not the hand-rolled fake-bot.ts
// helper used by route tests) — only grammY's own Bot wires up the
// BotError/bot.catch boundary (bot.js: handleUpdate -> handleUpdates ->
// errorHandler) that this test exercises.
function buildTestBot() {
  return new Bot<BotContext>("test-token", {
    botInfo: {
      id: 1,
      is_bot: true,
      first_name: "TestBot",
      username: "test_bot",
      can_join_groups: true,
      can_read_all_group_messages: false,
      supports_inline_queries: false,
      can_connect_to_business: false,
      has_main_web_app: false,
    },
  });
}

test("a route error rethrown by the tracing middleware reaches the existing bot.catch, and the user gets exactly one error reply", async () => {
  const capture = captureConsole();
  const tracker = createUpdateTracker();
  const sendMessageCalls: unknown[] = [];

  const bot = buildTestBot();

  bot.api.config.use(async (prev, method, payload, signal) => {
    if (method === "sendMessage") {
      sendMessageCalls.push(payload);
      return {
        ok: true,
        result: {
          message_id: 1,
          date: 0,
          chat: { id: 999, type: "private" },
          text: "error-generic",
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any;
    }
    return prev(method, payload, signal);
  });

  bot.use(createTracingMiddleware(tracker));
  bot.use((ctx, next) => {
    // Stand-in for the real i18n middleware (not under test here) — the
    // error handler calls ctx.t("error-generic").
    ctx.t = (key) => key;
    return next();
  });
  bot.use(() => {
    throw new Error("route exploded");
  });

  setupErrorHandler(bot);

  try {
    await bot.handleUpdates([buildUpdate(1)]);
  } finally {
    capture.restore();
  }

  assert.equal(
    sendMessageCalls.length,
    1,
    "the user must receive exactly one error reply — no double error-generic",
  );

  const failed = capture.entries.find(
    (e) => e.payload.event === "update_failed",
  );
  assert.ok(failed, "update_failed must be logged by the tracing middleware");
  assert.equal(failed!.payload.success, false);

  const middlewareError = capture.entries.find(
    (e) => e.payload.event === "bot_middleware_error",
  );
  assert.ok(
    middlewareError,
    "existing bot.catch logging must still fire unchanged",
  );

  assert.equal(
    tracker.getSnapshot().activeUpdateCount,
    0,
    "activeUpdateCount must be released even though the route threw",
  );
});

test("a session write failure after a successful handler reply does not send a second error-generic", async () => {
  const capture = captureConsole();
  const tracker = createUpdateTracker();
  const sendMessageCalls: Array<{ text?: string }> = [];

  const bot = buildTestBot();

  bot.api.config.use(async (prev, method, payload, signal) => {
    if (method === "sendMessage") {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      sendMessageCalls.push(payload as any);
      return {
        ok: true,
        result: {
          message_id: 1,
          date: 0,
          chat: { id: 999, type: "private" },
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          text: (payload as any).text,
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any;
    }
    return prev(method, payload, signal);
  });

  // A storage adapter whose write() fails the way createUpstashSessionStorage
  // does — by throwing SessionWriteError — so this test stays independent
  // of Upstash/network specifics and exercises only the tracing + session +
  // bot.catch integration.
  const storage: StorageAdapter<SessionData> = {
    async read() {
      return undefined;
    },
    async write() {
      throw new SessionWriteError(new Error("redis is down"));
    },
    async delete() {},
  };

  bot.use(createTracingMiddleware(tracker));
  bot.use(
    session<SessionData, BotContext>({
      storage,
      initial: () => ({
        userId: null,
        nav: { stack: [{ name: "home" }] },
        ui: {},
      }),
    }),
  );
  bot.use((ctx, next) => {
    ctx.t = (key) => key;
    return next();
  });
  bot.use(async (ctx) => {
    ctx.session.userId = 42; // force a write on finish()
    await ctx.reply("all good, task submitted");
  });

  setupErrorHandler(bot);

  try {
    await bot.handleUpdates([buildUpdate(1)]);
  } finally {
    capture.restore();
  }

  assert.equal(
    sendMessageCalls.length,
    1,
    "only the handler's own reply must be sent — no second, error-generic send",
  );
  assert.equal(sendMessageCalls[0]!.text, "all good, task submitted");

  const failed = capture.entries.find(
    (e) => e.payload.event === "update_failed",
  );
  assert.ok(
    failed,
    "update_failed must still be logged — the update is technically unsuccessful",
  );
  assert.equal(failed!.payload.success, false);

  const completed = capture.entries.find(
    (e) => e.payload.event === "update_completed",
  );
  assert.equal(
    completed,
    undefined,
    "a session write failure must never be masked as update_completed/success",
  );

  const sessionFailure = capture.entries.find(
    (e) => e.payload.event === "session_operation_failed",
  );
  assert.ok(
    sessionFailure === undefined ||
      sessionFailure.payload.operation === "write",
  );

  const middlewareError = capture.entries.find(
    (e) => e.payload.event === "bot_middleware_error",
  );
  assert.ok(
    middlewareError,
    "the session write failure must still be logged by bot.catch — session loss is not hidden",
  );
  assert.equal(middlewareError!.payload.error_kind, "session_write");

  assert.equal(tracker.getSnapshot().activeUpdateCount, 0);
});
