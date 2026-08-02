import { test } from "node:test";
import assert from "node:assert/strict";

import { Composer, Context, session } from "grammy";
import type { StorageAdapter } from "grammy";

import { createTracingMiddleware } from "../tracing.middleware.js";
import { createUpdateTracker } from "../../../../observability/update-tracker.js";
import { captureConsole } from "../../../../observability/__tests__/helpers/log-capture.js";
import type { BotContext } from "../../context.js";
import type { SessionData } from "../../session.js";

function buildUpdate() {
  return {
    update_id: 1,
    message: {
      message_id: 10,
      date: 0,
      chat: { id: 999, type: "private" as const },
      from: { id: 111, is_bot: false, first_name: "Anna" },
      text: "/start",
    },
  };
}

function buildCtx(): BotContext {
  const update = buildUpdate();
  const api = {} as BotContext["api"];
  const me = { id: 1, is_bot: true, first_name: "bot" } as BotContext["me"];
  return new Context(update, api, me) as unknown as BotContext;
}

const initialSession = (): SessionData => ({
  userId: null,
  nav: { stack: [{ name: "home" }] },
  ui: {},
});

test("update_received is logged before the session storage is touched, and update_completed's duration includes session I/O", async () => {
  const capture = captureConsole();
  const tracker = createUpdateTracker();
  const calls: Array<{ op: string; logCountAtCallTime: number }> = [];
  const DELAY_MS = 30;

  const storage: StorageAdapter<SessionData> = {
    async read() {
      calls.push({ op: "read", logCountAtCallTime: capture.entries.length });
      await new Promise((r) => setTimeout(r, DELAY_MS));
      return undefined;
    },
    async write() {
      calls.push({ op: "write", logCountAtCallTime: capture.entries.length });
      await new Promise((r) => setTimeout(r, DELAY_MS));
    },
    async delete() {
      calls.push({ op: "delete", logCountAtCallTime: capture.entries.length });
    },
  };

  const composer = new Composer<BotContext>();
  composer.use(createTracingMiddleware(tracker));
  composer.use(
    session<SessionData, BotContext>({ storage, initial: initialSession }),
  );
  composer.use(async (ctx, next) => {
    calls.push({ op: "handler", logCountAtCallTime: capture.entries.length });
    await next();
  });

  const ctx = buildCtx();

  try {
    await composer.middleware()(ctx, async () => {});
  } finally {
    capture.restore();
  }

  // The very first storage operation (session read) must happen only after
  // update_received was already logged — never before.
  const firstStorageCall = calls.find((c) => c.op === "read");
  assert.ok(firstStorageCall, "expected the session storage to be read");
  assert.equal(firstStorageCall!.logCountAtCallTime, 1);
  assert.equal(capture.entries[0]!.payload.event, "update_received");

  const completed = capture.entries.find(
    (e) => e.payload.event === "update_completed",
  );
  assert.ok(completed, "expected an update_completed log");
  assert.equal(completed!.payload.success, true);
  assert.ok(
    typeof completed!.payload.duration_ms === "number" &&
      (completed!.payload.duration_ms as number) >= DELAY_MS,
    "update_completed duration must include the session read time",
  );

  assert.equal(tracker.getSnapshot().activeUpdateCount, 0);
});

test("update_failed is logged and the error is rethrown; activeUpdateCount is decremented exactly once", async () => {
  const capture = captureConsole();
  const tracker = createUpdateTracker();
  const boom = new Error("handler exploded");

  const composer = new Composer<BotContext>();
  composer.use(createTracingMiddleware(tracker));
  composer.use(async () => {
    throw boom;
  });

  const ctx = buildCtx();

  let caught: unknown;
  try {
    await composer.middleware()(ctx, async () => {});
  } catch (err) {
    caught = err;
  } finally {
    capture.restore();
  }

  assert.equal(
    caught,
    boom,
    "the original error must be rethrown, not swallowed",
  );

  const failed = capture.entries.find(
    (e) => e.payload.event === "update_failed",
  );
  assert.ok(failed, "expected an update_failed log");
  assert.equal(failed!.payload.success, false);
  assert.equal(failed!.payload.error_kind, "Error");

  const completedLogs = capture.entries.filter(
    (e) => e.payload.event === "update_completed",
  );
  assert.equal(
    completedLogs.length,
    0,
    "must not log update_completed on failure",
  );

  assert.equal(
    tracker.getSnapshot().activeUpdateCount,
    0,
    "activeUpdateCount must be decremented exactly once even on error",
  );
});
