import { test } from "node:test";
import assert from "node:assert/strict";

import {
  buildLegalUrl,
  DEFAULT_WEBSITE_BASE_URL,
  resolveWebsiteBaseUrl,
} from "../website-base-url.js";

test("resolveWebsiteBaseUrl — undefined uses the default", () => {
  assert.equal(resolveWebsiteBaseUrl(undefined), DEFAULT_WEBSITE_BASE_URL);
});

test("resolveWebsiteBaseUrl — empty string uses the default", () => {
  assert.equal(resolveWebsiteBaseUrl(""), DEFAULT_WEBSITE_BASE_URL);
});

test("resolveWebsiteBaseUrl — whitespace-only uses the default", () => {
  assert.equal(resolveWebsiteBaseUrl("   "), DEFAULT_WEBSITE_BASE_URL);
});

test("resolveWebsiteBaseUrl — valid URL without trailing slash is kept as-is", () => {
  assert.equal(
    resolveWebsiteBaseUrl("https://example.com"),
    "https://example.com",
  );
});

test("resolveWebsiteBaseUrl — valid URL with trailing slash is kept as-is", () => {
  assert.equal(
    resolveWebsiteBaseUrl("https://example.com/"),
    "https://example.com/",
  );
});

test("resolveWebsiteBaseUrl — throws a clear error for an invalid URL", () => {
  assert.throws(
    () => resolveWebsiteBaseUrl("not a url"),
    /Invalid WEBSITE_BASE_URL/,
  );
});

test("resolveWebsiteBaseUrl — throws for a non-http(s) protocol", () => {
  assert.throws(
    () => resolveWebsiteBaseUrl("ftp://example.com"),
    /must use http or https/,
  );
});

test("buildLegalUrl — base without trailing slash", () => {
  assert.equal(
    buildLegalUrl("https://example.com", "/terms"),
    "https://example.com/terms",
  );
});

test("buildLegalUrl — base with trailing slash does not produce a double slash", () => {
  assert.equal(
    buildLegalUrl("https://example.com/", "/terms"),
    "https://example.com/terms",
  );
});

test("buildLegalUrl — never depends on user input, only on configured base + fixed path", () => {
  const url = buildLegalUrl(DEFAULT_WEBSITE_BASE_URL, "/privacy");
  assert.equal(url, `${DEFAULT_WEBSITE_BASE_URL}/privacy`);
});
