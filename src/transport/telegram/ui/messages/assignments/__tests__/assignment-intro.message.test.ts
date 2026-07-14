import { test } from "node:test";
import assert from "node:assert/strict";

import type { Translator } from "../../../helpers/copy.js";
import type { InternalAssignmentDto } from "../../../../../../infra/backend-api/backend-api.types.js";
import {
  buildAssignmentIntroParts,
  buildTeacherCommentMessages,
  teacherCommentBlock,
  TELEGRAM_SAFE_MESSAGE_LENGTH,
} from "../assignment-intro.message.js";

const t: Translator = ((key: string) => key) as Translator;
const BREADCRUMB = "<i>Home  ›  Lessons  ›  Lesson  ›  Task</i>";

function baseAssignment(
  overrides: Partial<InternalAssignmentDto> = {},
): InternalAssignmentDto {
  return {
    assignmentId: 1,
    type: "definition_quiz",
    lesson: {
      lessonId: 1,
      title: "Lesson",
      targetLanguage: "en",
      nativeLanguage: "ru",
      instructionLanguage: "ru",
      level: null,
      ageCategory: null,
      topic: null,
      additionalInstructions: null,
    },
    questions: [],
    vocab: [],
    ...overrides,
  };
}

function assertHtmlBalanced(text: string) {
  const openBlockquotes = (text.match(/<blockquote[^>]*>/g) ?? []).length;
  const closeBlockquotes = (text.match(/<\/blockquote>/g) ?? []).length;
  assert.equal(
    openBlockquotes,
    closeBlockquotes,
    `unbalanced <blockquote> tags in: ${text.slice(0, 200)}...`,
  );

  const openBold = (text.match(/<b>/g) ?? []).length;
  const closeBold = (text.match(/<\/b>/g) ?? []).length;
  assert.equal(openBold, closeBold, "unbalanced <b> tags");

  const openItalic = (text.match(/<i>/g) ?? []).length;
  const closeItalic = (text.match(/<\/i>/g) ?? []).length;
  assert.equal(openItalic, closeItalic, "unbalanced <i> tags");
}

function assertNoDanglingEntity(text: string) {
  // Every literal "&" must be the start of a complete, closed entity
  // (&amp; &lt; &gt; &quot;) — never a bare "&" left dangling by a chunk cut.
  const entityPattern = /&(amp|lt|gt|quot);/g;
  const bareAmpersands = text.replace(entityPattern, "").match(/&/g) ?? [];
  assert.equal(
    bareAmpersands.length,
    0,
    `found a dangling/unescaped "&" in: ${text.slice(0, 200)}...`,
  );
}

function assertAllPartsWithinLimit(parts: {
  precedingMessages: string[];
  mainScreenMessage: string;
}) {
  for (const message of [...parts.precedingMessages, parts.mainScreenMessage]) {
    assert.ok(
      message.length <= TELEGRAM_SAFE_MESSAGE_LENGTH,
      `message of length ${message.length} exceeds the safe limit (${TELEGRAM_SAFE_MESSAGE_LENGTH})`,
    );
    assertHtmlBalanced(message);
    assertNoDanglingEntity(message);
  }
}

// ─── teacherCommentBlock / buildTeacherCommentMessages ──────────────────────

test("teacherCommentBlock — null/empty/whitespace all return null", () => {
  assert.equal(teacherCommentBlock(t, null), null);
  assert.equal(teacherCommentBlock(t, ""), null);
  assert.equal(teacherCommentBlock(t, "   \n\t  "), null);
});

test("teacherCommentBlock — escapes HTML and preserves multiline text", () => {
  const result = teacherCommentBlock(t, "<b>Line one</b>\nLine two");
  assert.ok(result);
  assert.ok(result.includes("&lt;b&gt;Line one&lt;/b&gt;\nLine two"));
});

test("buildTeacherCommentMessages — empty input returns no messages", () => {
  assert.deepEqual(
    buildTeacherCommentMessages(t, null, TELEGRAM_SAFE_MESSAGE_LENGTH),
    [],
  );
  assert.deepEqual(
    buildTeacherCommentMessages(t, "   ", TELEGRAM_SAFE_MESSAGE_LENGTH),
    [],
  );
});

test("buildTeacherCommentMessages — short comment fits in a single message", () => {
  const messages = buildTeacherCommentMessages(
    t,
    "Watch the video first.",
    TELEGRAM_SAFE_MESSAGE_LENGTH,
  );
  assert.equal(messages.length, 1);
  assert.ok(messages[0]!.includes("Watch the video first."));
  assert.ok(messages[0]!.length <= TELEGRAM_SAFE_MESSAGE_LENGTH);
});

test("buildTeacherCommentMessages — a comment larger than the budget is split, never truncated", () => {
  const longComment = "x".repeat(9000);
  const messages = buildTeacherCommentMessages(
    t,
    longComment,
    TELEGRAM_SAFE_MESSAGE_LENGTH,
  );

  assert.ok(messages.length > 1);
  for (const message of messages) {
    assert.ok(message.length <= TELEGRAM_SAFE_MESSAGE_LENGTH);
    assertHtmlBalanced(message);
  }
  const recombined = messages
    .map((m) =>
      m
        .replace(/^.*<blockquote expandable>/s, "")
        .replace(/<\/blockquote>$/, ""),
    )
    .join("");
  assert.equal(recombined.length, longComment.length);
});

// ─── buildAssignmentIntroParts ───────────────────────────────────────────────

test("buildAssignmentIntroParts — short comment + small vocab: single message, no preceding parts", () => {
  const a = baseAssignment({
    lesson: {
      ...baseAssignment().lesson,
      additionalInstructions: "Short comment.",
    },
    vocab: [{ term: "cat", translation: "кот" }],
  });

  const parts = buildAssignmentIntroParts(t, a, BREADCRUMB);

  assert.deepEqual(parts.precedingMessages, []);
  assert.ok(parts.mainScreenMessage.includes("Short comment."));
  assert.ok(parts.mainScreenMessage.includes(BREADCRUMB));
  assertAllPartsWithinLimit(parts);
});

test("buildAssignmentIntroParts — long comment only: split into a preceding message, main stays small", () => {
  const longComment = "y".repeat(6000);
  const a = baseAssignment({
    lesson: { ...baseAssignment().lesson, additionalInstructions: longComment },
  });

  const parts = buildAssignmentIntroParts(t, a, BREADCRUMB);

  assert.ok(parts.precedingMessages.length >= 1);
  assert.ok(!parts.mainScreenMessage.includes(longComment));
  assert.ok(
    parts.precedingMessages.some((m) => m.includes("y".repeat(100))),
    "the comment content must appear somewhere in the preceding messages",
  );
  assertAllPartsWithinLimit(parts);
});

test("buildAssignmentIntroParts — large vocab only: split into preceding vocab message(s)", () => {
  const vocab = Array.from({ length: 200 }, (_, i) => ({
    term: `word-${i}`,
    translation: `перевод-слова-номер-${i}-с-небольшим-заполнением`,
    synonyms: [`syn-a-${i}`, `syn-b-${i}`],
  }));
  const a = baseAssignment({ vocab });

  const parts = buildAssignmentIntroParts(t, a, BREADCRUMB);

  assert.ok(parts.precedingMessages.length >= 1);
  assert.ok(!parts.mainScreenMessage.includes("word-199"));
  assert.ok(parts.precedingMessages.some((m) => m.includes("word-0")));
  assert.ok(
    parts.precedingMessages.some((m) => m.includes("word-199")),
    "every vocab item must be preserved across the vocab messages",
  );
  assertAllPartsWithinLimit(parts);
});

test("buildAssignmentIntroParts — long comment + large vocab: both split, nothing lost, everything within limit", () => {
  const longComment = "z".repeat(6000);
  const vocab = Array.from({ length: 150 }, (_, i) => ({
    term: `term-${i}`,
    translation: `translation-of-term-number-${i}`,
  }));
  const a = baseAssignment({
    lesson: { ...baseAssignment().lesson, additionalInstructions: longComment },
    vocab,
  });

  const parts = buildAssignmentIntroParts(t, a, BREADCRUMB);

  assert.ok(parts.precedingMessages.length >= 2);
  assert.ok(!parts.mainScreenMessage.includes(longComment));
  assert.ok(!parts.mainScreenMessage.includes("term-149"));
  assertAllPartsWithinLimit(parts);
});

test("buildAssignmentIntroParts — ONE vocab item whose term+translation+synonyms alone exceeds the safe limit is split, not dropped", () => {
  const hugeTranslation = "п".repeat(5000);
  const hugeSynonyms = Array.from({ length: 100 }, (_, i) => `synonym-number-${i}`);
  const vocab = [{ term: "word", translation: hugeTranslation, synonyms: hugeSynonyms }];
  const a = baseAssignment({ vocab });

  const parts = buildAssignmentIntroParts(t, a, BREADCRUMB);

  assertAllPartsWithinLimit(parts);
  assert.ok(parts.precedingMessages.length >= 1);

  const allPrecedingText = parts.precedingMessages.join("");
  assert.ok(allPrecedingText.includes("word"));
  // Every character of the huge translation must survive across the parts.
  const translationOccurrencesLength = (allPrecedingText.match(/п+/g) ?? []).reduce(
    (sum, run) => sum + run.length,
    0,
  );
  assert.equal(translationOccurrencesLength, hugeTranslation.length);
  // Every synonym must survive somewhere.
  for (let i = 0; i < hugeSynonyms.length; i += 1) {
    assert.ok(
      allPrecedingText.includes(`synonym-number-${i}`),
      `synonym-number-${i} must not be lost`,
    );
  }
});

test("buildAssignmentIntroParts — an oversized breadcrumb + lesson title/topic (meta) is split into its own safe message(s)", () => {
  const hugeTitle = "Lesson Title Word ".repeat(150);
  const hugeTopic = "Topic Phrase Word ".repeat(150);
  const hugeBreadcrumb = `<i>${"Home  ›  Lessons  ›  " + hugeTitle}</i>`;

  const a = baseAssignment({
    lesson: { ...baseAssignment().lesson, title: hugeTitle, topic: hugeTopic },
  });

  const parts = buildAssignmentIntroParts(t, a, hugeBreadcrumb);

  assertAllPartsWithinLimit(parts);
  assert.ok(parts.precedingMessages.length >= 1);
  assert.ok(
    !parts.mainScreenMessage.includes(hugeTitle),
    "the oversized meta/breadcrumb must not remain inline in the interactive message",
  );
});

test("buildAssignmentIntroParts — every generated part independently stays within the safe Telegram limit (comment + vocab + huge breadcrumb combined)", () => {
  const longComment = "w".repeat(10000);
  const vocab = Array.from({ length: 500 }, (_, i) => ({
    term: `vocab-term-${i}`,
    translation: `some-translation-text-${i}`,
    synonyms: [`s1-${i}`, `s2-${i}`, `s3-${i}`],
  }));
  const hugeBreadcrumb = `<i>${"Home  ›  Lessons  ›  Lesson  ›  Task ".repeat(120)}</i>`;
  const a = baseAssignment({
    lesson: { ...baseAssignment().lesson, additionalInstructions: longComment },
    vocab,
  });

  const parts = buildAssignmentIntroParts(t, a, hugeBreadcrumb);
  assertAllPartsWithinLimit(parts);
  assert.ok(parts.precedingMessages.length > 3);
});
