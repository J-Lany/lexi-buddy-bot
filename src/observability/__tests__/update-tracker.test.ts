import { test } from "node:test";
import assert from "node:assert/strict";
import { setTimeout as sleep } from "node:timers/promises";

import { createUpdateTracker } from "../update-tracker.js";

test("initial snapshot has no update history yet", () => {
  const tracker = createUpdateTracker();
  const snapshot = tracker.getSnapshot();

  assert.equal(snapshot.activeUpdateCount, 0);
  assert.equal(snapshot.activeUpdateAgeMs, null);
  assert.equal(snapshot.lastUpdateReceivedAgoMs, null);
  assert.equal(snapshot.lastUpdateFinishedAgoMs, null);
  assert.ok(snapshot.uptimeMs >= 0);
});

test("recordUpdateReceived marks one active update with a growing age", async () => {
  const tracker = createUpdateTracker();

  tracker.recordUpdateReceived();
  await sleep(15);

  const snapshot = tracker.getSnapshot();
  assert.equal(snapshot.activeUpdateCount, 1);
  assert.ok(
    snapshot.activeUpdateAgeMs !== null && snapshot.activeUpdateAgeMs >= 15,
  );
  assert.equal(snapshot.lastUpdateFinishedAgoMs, null);
});

test("recordUpdateFinished clears the active update and starts lastUpdateFinishedAgoMs", async () => {
  const tracker = createUpdateTracker();

  tracker.recordUpdateReceived();
  tracker.recordUpdateFinished();
  await sleep(10);

  const snapshot = tracker.getSnapshot();
  assert.equal(snapshot.activeUpdateCount, 0);
  assert.equal(snapshot.activeUpdateAgeMs, null);
  assert.ok(
    snapshot.lastUpdateFinishedAgoMs !== null &&
      snapshot.lastUpdateFinishedAgoMs >= 10,
  );
});

test("recordUpdateFinished never drives activeUpdateCount negative", () => {
  const tracker = createUpdateTracker();

  tracker.recordUpdateFinished();
  tracker.recordUpdateFinished();

  assert.equal(tracker.getSnapshot().activeUpdateCount, 0);
});
