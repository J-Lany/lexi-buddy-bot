import { test } from "node:test";
import assert from "node:assert/strict";

import { i18n, SUPPORTED_LOCALES } from "../../../../../../i18n/index.js";
import type { Translator } from "../../../helpers/copy.js";
import type { InternalAssignmentDto } from "../../../../../../infra/backend-api/backend-api.types.js";
import {
  buildAssignmentIntroParts,
  TELEGRAM_SAFE_MESSAGE_LENGTH,
} from "../assignment-intro.message.js";

/**
 * The "core" (title/body/example/ready) content is built entirely from fixed
 * FTL strings, never from per-request lesson data — so it should always be
 * comfortably within budget. Rather than just asserting that in a comment,
 * this measures it against the real, current translations for every known
 * assignment type in every supported locale, so a future translation update
 * that made one of these strings unexpectedly long would fail a real test
 * instead of silently relying on an assumption.
 */

const KNOWN_TYPES = [
  "definition_quiz",
  "gap_filling",
  "phrase_fail",
  "collocation_check",
];
const UNKNOWN_TYPE = "some_future_type";

function baseAssignment(type: string): InternalAssignmentDto {
  return {
    assignmentId: 1,
    type,
    lesson: {
      lessonId: 1,
      title: "Lesson",
      targetLanguage: "en",
      nativeLanguage: "ru",
      instructionLanguage: "ru",
      level: "B1",
      ageCategory: null,
      topic: "Everyday phrases",
      additionalInstructions: null,
    },
    questions: [
      {
        id: 1,
        text: "Q1",
        questionType: "multiple_choice",
        explanation: null,
        answers: [],
      },
    ],
    vocab: [{ term: "cat", translation: "кот" }],
  };
}

for (const locale of SUPPORTED_LOCALES) {
  const t: Translator = ((key: string, vars?: Record<string, unknown>) =>
    i18n.t(locale, key, vars)) as Translator;

  for (const type of [...KNOWN_TYPES, UNKNOWN_TYPE]) {
    test(`real content — [${locale}] [${type}] intro fits in a single message with no overflow`, () => {
      const a = baseAssignment(type);
      const parts = buildAssignmentIntroParts(
        t,
        a,
        "<i>Home  ›  Lessons  ›  Lesson  ›  Task</i>",
      );

      assert.deepEqual(
        parts.precedingMessages,
        [],
        `unexpected overflow for locale=${locale} type=${type}: ${parts.precedingMessages.length} preceding message(s)`,
      );
      assert.ok(
        parts.mainScreenMessage.length <= TELEGRAM_SAFE_MESSAGE_LENGTH,
        `[${locale}/${type}] core content is ${parts.mainScreenMessage.length} chars — exceeds the safe limit`,
      );
    });
  }
}
