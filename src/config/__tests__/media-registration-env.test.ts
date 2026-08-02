import { test } from "node:test";
import assert from "node:assert/strict";

import {
  parseAdminIds,
  parseMediaRegistrationEnabled,
} from "../media-registration-env.js";

test("parseMediaRegistrationEnabled — 'true' enables it", () => {
  assert.equal(parseMediaRegistrationEnabled("true"), true);
});

test("parseMediaRegistrationEnabled — is case-insensitive and trims whitespace", () => {
  assert.equal(parseMediaRegistrationEnabled("TRUE"), true);
  assert.equal(parseMediaRegistrationEnabled("  true  "), true);
});

test("parseMediaRegistrationEnabled — undefined, empty, 'false', and garbage all disable it", () => {
  assert.equal(parseMediaRegistrationEnabled(undefined), false);
  assert.equal(parseMediaRegistrationEnabled(""), false);
  assert.equal(parseMediaRegistrationEnabled("false"), false);
  assert.equal(parseMediaRegistrationEnabled("1"), false);
  assert.equal(parseMediaRegistrationEnabled("yes"), false);
});

test("parseAdminIds — undefined and empty string yield an empty allowlist", () => {
  assert.deepEqual(parseAdminIds(undefined), {
    ids: new Set(),
    invalidEntries: [],
  });
  assert.deepEqual(parseAdminIds(""), { ids: new Set(), invalidEntries: [] });
});

test("parseAdminIds — a valid CSV list of IDs parses fully", () => {
  const result = parseAdminIds("111,222, 333");
  assert.deepEqual(result.ids, new Set([111, 222, 333]));
  assert.deepEqual(result.invalidEntries, []);
});

test("parseAdminIds — non-numeric entries are collected as invalid, not dropped silently from the report", () => {
  const result = parseAdminIds("1,abc,2");
  assert.deepEqual(result.ids, new Set([1, 2]));
  assert.deepEqual(result.invalidEntries, ["abc"]);
});

test("parseAdminIds — rejects negatives, zero, decimals, exponent notation, and leading '+'", () => {
  const result = parseAdminIds("-5,0,123.0,1e3,+123,999");
  assert.deepEqual(result.ids, new Set([999]));
  assert.deepEqual(result.invalidEntries, ["-5", "0", "123.0", "1e3", "+123"]);
});

test("parseAdminIds — rejects values that lose precision as a JS number", () => {
  const result = parseAdminIds("9007199254740993,111");
  assert.deepEqual(result.ids, new Set([111]));
  assert.deepEqual(result.invalidEntries, ["9007199254740993"]);
});

test("parseAdminIds — blank entries between commas are ignored, not reported as invalid", () => {
  const result = parseAdminIds("1,,2, ,3");
  assert.deepEqual(result.ids, new Set([1, 2, 3]));
  assert.deepEqual(result.invalidEntries, []);
});
