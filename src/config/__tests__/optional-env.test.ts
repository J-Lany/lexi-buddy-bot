import { test } from "node:test";
import assert from "node:assert/strict";

import { normalizeOptionalEnv } from "../optional-env.js";

test("normalizeOptionalEnv — undefined stays undefined", () => {
  assert.equal(normalizeOptionalEnv(undefined), undefined);
});

test("normalizeOptionalEnv — empty string becomes undefined", () => {
  assert.equal(normalizeOptionalEnv(""), undefined);
});

test("normalizeOptionalEnv — whitespace-only string becomes undefined", () => {
  assert.equal(normalizeOptionalEnv("   "), undefined);
});

test("normalizeOptionalEnv — a real value is trimmed and kept", () => {
  assert.equal(normalizeOptionalEnv("  abc123  "), "abc123");
});

test("normalizeOptionalEnv — a value without surrounding whitespace is unchanged", () => {
  assert.equal(normalizeOptionalEnv("abc123"), "abc123");
});
