import { test } from "node:test";
import assert from "node:assert/strict";
import http from "node:http";
import type { AddressInfo } from "node:net";
import { setTimeout as sleep } from "node:timers/promises";

import { Redis } from "@upstash/redis";

import { createUpstashSessionStorage } from "../upstash-session.storage.js";
import { captureConsole } from "../../../observability/__tests__/helpers/log-capture.js";

/**
 * A local stand-in for Upstash's REST endpoint. `delayMs` simulates a slow
 * or hung Upstash; `waitForAbort()` resolves once the client actually drops
 * the connection (real cancellation), rejecting if that never happens
 * within `timeoutMs` — event-driven so it isn't a source of test flakiness
 * under load, unlike a fixed sleep-then-check.
 */
function startMockUpstash(delayMs: number): Promise<{
  url: string;
  close: () => Promise<void>;
  // eslint-disable-next-line no-unused-vars -- named for readability of the type signature only
  waitForAbort: (timeoutMs: number) => Promise<void>;
}> {
  return new Promise((resolve) => {
    let notifyAbort: (() => void) | undefined;
    let aborted = false;
    const abortedPromise = new Promise<void>((res) => {
      notifyAbort = res;
    });

    const server = http.createServer((req, res) => {
      res.on("close", () => {
        if (!res.writableEnded && !aborted) {
          aborted = true;
          notifyAbort?.();
        }
      });

      req.on("data", () => {});
      req.on("end", () => {
        const timer = setTimeout(() => {
          if (res.writableEnded) return;
          // No keep-alive: avoids ambiguity around when the server-side
          // socket actually closes, which otherwise makes server.close()
          // and the abort-detection above unreliable under load.
          res.writeHead(200, {
            "Content-Type": "application/json",
            Connection: "close",
          });
          res.end(JSON.stringify({ result: null }));
        }, delayMs);
        res.on("close", () => clearTimeout(timer));
      });
    });

    server.listen(0, "127.0.0.1", () => {
      const { port } = server.address() as AddressInfo;
      resolve({
        url: `http://127.0.0.1:${port}`,
        close: () =>
          new Promise((r) => {
            server.closeAllConnections();
            server.close(() => r());
          }),
        waitForAbort: (timeoutMs: number) =>
          Promise.race([
            abortedPromise,
            sleep(timeoutMs).then(() => {
              throw new Error(
                "timed out waiting for the server to observe the client abort",
              );
            }),
          ]),
      });
    });
  });
}

function buildRedis(
  url: string,
  overrides: { signal?: () => AbortSignal; retry?: false } = {},
): Redis {
  return new Redis({
    url,
    token: "test-token",
    responseEncoding: false,
    // The client auto-pipelines even a single command by default, sending
    // an array-shaped request and expecting an array-shaped response. The
    // mock server here only speaks plain single-command JSON.
    enableAutoPipelining: false,
    ...overrides,
  });
}

test("a hung Upstash response causes a real abort of the underlying request, bounded by the timeout — not the server's delay", async () => {
  const TIMEOUT_MS = 150;
  const SERVER_DELAY_MS = 2_000; // far beyond the timeout

  const capture = captureConsole();
  const mock = await startMockUpstash(SERVER_DELAY_MS);
  const redis = buildRedis(mock.url, {
    signal: () => AbortSignal.timeout(TIMEOUT_MS),
    retry: false,
  });
  const storage = createUpstashSessionStorage(redis);

  const startedAt = Date.now();
  await assert.rejects(() => storage.read("worst-case-key"));
  const elapsedMs = Date.now() - startedAt;

  // Bounded by the configured timeout, with headroom for scheduling —
  // must never approach the server's multi-second delay.
  assert.ok(
    elapsedMs < TIMEOUT_MS + 300,
    `expected rejection well under ${TIMEOUT_MS + 300}ms, took ${elapsedMs}ms`,
  );

  // Real cancellation, not just "the client gave up waiting": the server
  // must actually observe the connection close.
  await mock.waitForAbort(2_000);

  capture.restore();
  await mock.close();
});

test("a late Upstash response after timeout cannot be observed as a late write — the failure is the only outcome logged", async () => {
  const TIMEOUT_MS = 100;
  const SERVER_DELAY_MS = 600; // responds well after our timeout fires

  const capture = captureConsole();
  const unhandled: unknown[] = [];
  const onUnhandledRejection = (reason: unknown) => unhandled.push(reason);
  process.on("unhandledRejection", onUnhandledRejection);

  const mock = await startMockUpstash(SERVER_DELAY_MS);
  const redis = buildRedis(mock.url, {
    signal: () => AbortSignal.timeout(TIMEOUT_MS),
    retry: false,
  });
  const storage = createUpstashSessionStorage(redis);

  await assert.rejects(() =>
    storage.write("worst-case-key", {
      userId: null,
      nav: { stack: [{ name: "home" }] },
      ui: {},
    }),
  );

  // Wait past the point where the mock server would have sent its "late"
  // response, to prove nothing resolves/logs after the fact.
  await sleep(SERVER_DELAY_MS + 100);

  process.off("unhandledRejection", onUnhandledRejection);
  capture.restore();
  await mock.close();

  assert.equal(
    unhandled.length,
    0,
    "a late response must not surface as a stray rejection",
  );

  const sessionLogs = capture.entries.filter((e) =>
    String(e.payload.event).startsWith("session_operation"),
  );
  assert.equal(
    sessionLogs.length,
    1,
    "exactly one outcome (the timeout failure) must be logged — no late success",
  );
  assert.equal(sessionLogs[0]!.payload.event, "session_operation_failed");
  assert.equal(sessionLogs[0]!.payload.success, false);
});

test("a slow-but-successful session read logs session_operation_slow without losing the value", async () => {
  const capture = captureConsole();
  const mock = await startMockUpstash(350); // above the 300ms slow threshold
  const redis = buildRedis(mock.url);
  const storage = createUpstashSessionStorage(redis);

  const result = await storage.read("slow-key");
  capture.restore();
  await mock.close();

  assert.equal(result, undefined);

  const slow = capture.entries.find(
    (e) => e.payload.event === "session_operation_slow",
  );
  assert.ok(slow, "expected a session_operation_slow log");
  assert.equal(slow!.payload.operation, "read");
  assert.equal(slow!.payload.success, true);
  assert.ok((slow!.payload.duration_ms as number) >= 300);

  const failed = capture.entries.find(
    (e) => e.payload.event === "session_operation_failed",
  );
  assert.equal(failed, undefined);
});

test("a fast Upstash round trip is unaffected — no slow/failed logs, quick resolution", async () => {
  const capture = captureConsole();
  const mock = await startMockUpstash(0);
  const redis = buildRedis(mock.url);
  const storage = createUpstashSessionStorage(redis);

  const startedAt = Date.now();
  const result = await storage.read("fast-key");
  const elapsedMs = Date.now() - startedAt;

  capture.restore();
  await mock.close();

  assert.equal(result, undefined);
  assert.ok(elapsedMs < 300, `expected a fast round trip, took ${elapsedMs}ms`);

  const sessionLogs = capture.entries.filter((e) =>
    String(e.payload.event).startsWith("session_operation"),
  );
  assert.equal(sessionLogs.length, 0);
});

test("session operation logs never contain the session key or payload", async () => {
  const capture = captureConsole();
  const mock = await startMockUpstash(350);
  const redis = buildRedis(mock.url);
  const storage = createUpstashSessionStorage(redis);

  const secretKey = "chat-id-should-never-be-logged-123456";
  await storage.read(secretKey);

  capture.restore();
  await mock.close();

  for (const entry of capture.entries) {
    const serialized = JSON.stringify(entry.payload);
    assert.ok(!serialized.includes(secretKey));
    assert.ok(!("key" in entry.payload));
    assert.ok(!("value" in entry.payload));
    assert.ok(!("payload" in entry.payload));
  }
});
