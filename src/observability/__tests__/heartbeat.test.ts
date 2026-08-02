import { test } from "node:test";
import assert from "node:assert/strict";
import { setTimeout as sleep } from "node:timers/promises";

import { startHeartbeat } from "../heartbeat.js";
import { createUpdateTracker } from "../update-tracker.js";
import type { UpdateTracker } from "../update-tracker.js";
import { captureConsole } from "./helpers/log-capture.js";

test("heartbeat reports a hung active update (age growing, no user data)", async () => {
  const capture = captureConsole();
  const tracker = createUpdateTracker();
  tracker.recordUpdateReceived(); // never finished — simulates a stuck update

  const timer = startHeartbeat(tracker, 20);

  try {
    await sleep(45);
  } finally {
    clearInterval(timer);
    capture.restore();
  }

  const heartbeats = capture.entries.filter(
    (e) => e.payload.event === "app_heartbeat",
  );
  assert.ok(heartbeats.length >= 1, "expected at least one heartbeat tick");

  const last = heartbeats.at(-1)!.payload;
  assert.equal(last.active_update_count, 1);
  assert.ok(
    typeof last.active_update_age_ms === "number" &&
      last.active_update_age_ms > 0,
  );

  const allowedFields = new Set([
    "timestamp",
    "level",
    "event",
    "env",
    "service",
    "telegram_user_id",
    "update_id",
    "request_id",
    "user_id",
    "uptime_ms",
    "active_update_count",
    "active_update_age_ms",
    "last_update_received_ago_ms",
    "last_update_finished_ago_ms",
  ]);
  for (const key of Object.keys(last)) {
    assert.ok(
      allowedFields.has(key),
      `unexpected field in heartbeat log: ${key}`,
    );
  }
});

test("clearing the returned timer stops further heartbeat ticks", async () => {
  const capture = captureConsole();
  const tracker = createUpdateTracker();
  const timer = startHeartbeat(tracker, 15);

  await sleep(40);
  clearInterval(timer);
  const countAfterClear = capture.entries.filter(
    (e) => e.payload.event === "app_heartbeat",
  ).length;
  assert.ok(countAfterClear >= 1);

  await sleep(40);
  capture.restore();

  const countAfterWaiting = capture.entries.filter(
    (e) => e.payload.event === "app_heartbeat",
  ).length;
  assert.equal(
    countAfterWaiting,
    countAfterClear,
    "no new heartbeat ticks should fire after clearInterval",
  );
});

test("a throwing tracker does not crash the process or stop the heartbeat timer", async () => {
  const capture = captureConsole();
  const uncaught: unknown[] = [];
  const onUncaughtException = (error: unknown) => uncaught.push(error);
  process.on("uncaughtException", onUncaughtException);

  const throwingTracker: UpdateTracker = {
    recordUpdateReceived() {},
    recordUpdateFinished() {},
    getSnapshot() {
      throw new Error("snapshot exploded");
    },
  };

  const timer = startHeartbeat(throwingTracker, 15);

  if (typeof timer.hasRef === "function") {
    assert.equal(
      timer.hasRef(),
      false,
      "the heartbeat timer must be unref'd so it never keeps the process alive",
    );
  }

  try {
    await sleep(50);
  } finally {
    clearInterval(timer);
    process.off("uncaughtException", onUncaughtException);
    capture.restore();
  }

  assert.equal(
    uncaught.length,
    0,
    "a failing heartbeat tick must never surface as an uncaughtException",
  );

  const failedTicks = capture.entries.filter(
    (e) => e.payload.event === "heartbeat_tick_failed",
  );
  assert.ok(
    failedTicks.length >= 2,
    "the timer must keep firing on schedule after a tick throws, not die after the first failure",
  );
  assert.equal(failedTicks[0]!.payload.level, "error");

  const successfulTicks = capture.entries.filter(
    (e) => e.payload.event === "app_heartbeat",
  );
  assert.equal(
    successfulTicks.length,
    0,
    "a permanently throwing tracker must never fake a successful heartbeat",
  );
});
