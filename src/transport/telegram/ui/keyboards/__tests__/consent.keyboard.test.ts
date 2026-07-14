import { test } from "node:test";
import assert from "node:assert/strict";

import type { Translator } from "../../helpers/copy.js";
import { registrationConsentKeyboard } from "../consent.keyboard.js";

const t: Translator = ((key: string) => key) as Translator;

test("registrationConsentKeyboard — Privacy Policy button links to the privacy URL", () => {
  const kb = registrationConsentKeyboard(t, {
    privacy: "https://example.com/privacy",
    terms: "https://example.com/terms",
  });

  const row = kb.inline_keyboard[0]!;
  assert.equal(row.length, 1);
  assert.equal(row[0]!.text, "kb-consent-privacy");
  assert.equal((row[0] as { url?: string }).url, "https://example.com/privacy");
});

test("registrationConsentKeyboard — Terms of Service button links to the terms URL", () => {
  const kb = registrationConsentKeyboard(t, {
    privacy: "https://example.com/privacy",
    terms: "https://example.com/terms",
  });

  const row = kb.inline_keyboard[1]!;
  assert.equal(row.length, 1);
  assert.equal(row[0]!.text, "kb-consent-terms");
  assert.equal((row[0] as { url?: string }).url, "https://example.com/terms");
});

test("registrationConsentKeyboard — Continue is a callback button with a stable callback_data", () => {
  const kb = registrationConsentKeyboard(t, {
    privacy: "https://example.com/privacy",
    terms: "https://example.com/terms",
  });

  const row = kb.inline_keyboard[2]!;
  assert.equal(row.length, 1);
  assert.equal(row[0]!.text, "kb-consent-continue");
  assert.equal(
    (row[0] as { callback_data?: string }).callback_data,
    "reg_consent_continue",
  );
});

test("registrationConsentKeyboard — exactly three rows, one button each (Privacy / Terms / Continue)", () => {
  const kb = registrationConsentKeyboard(t, {
    privacy: "https://example.com/privacy",
    terms: "https://example.com/terms",
  });

  assert.equal(kb.inline_keyboard.length, 3);
  for (const row of kb.inline_keyboard) {
    assert.equal(row.length, 1);
  }
});
