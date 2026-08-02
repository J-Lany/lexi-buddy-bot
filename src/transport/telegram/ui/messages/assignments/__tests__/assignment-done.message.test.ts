import { test } from "node:test";
import assert from "node:assert/strict";

import {
  assignmentDoneMessage,
  toResultPercent,
} from "../assignment-done.message.js";

test("toResultPercent — rounds to the nearest whole percent", () => {
  assert.equal(toResultPercent(0.29), 29);
  assert.equal(toResultPercent(0.3), 30);
  assert.equal(toResultPercent(0.75), 75);
  assert.equal(toResultPercent(0.295), 30);
  assert.equal(toResultPercent(1), 100);
  assert.equal(toResultPercent(0), 0);
});

test("assignmentDoneMessage — the displayed percent matches toResultPercent for the same score", () => {
  const t = ((key: string, vars?: Record<string, unknown>) =>
    key === "result-percent" ? `result-percent:${vars?.pct}` : key) as never;

  const text = assignmentDoneMessage(t, 0.295);
  assert.ok(text.includes(`result-percent:${toResultPercent(0.295)}`));
});

test("assignmentDoneMessage — score === null shows done-saved, not a percent", () => {
  const t = ((key: string) => key) as never;
  const text = assignmentDoneMessage(t, null);
  assert.ok(text.includes("done-saved"));
});
