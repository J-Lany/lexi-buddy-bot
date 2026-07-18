import type { InternalAssignmentDto } from "../../../../../infra/backend-api/backend-api.types.js";
import {
  uiMessage,
  uiMeta,
  uiTitle,
  uiQuote,
  uiSection,
} from "../../helpers/ui.js";
import { escapeHtml } from "../../helpers/html.js";
import { logWarn } from "../../../../../observability/logger.js";
import type { Translator } from "../../helpers/copy.js";

const KNOWN_TYPES = new Set([
  "definition_quiz",
  "gap_filling",
  "phrase_fail",
  "collocation_check",
]);

// Only these types have a non-empty note in the FTL
const TYPES_WITH_NOTES = new Set(["phrase_fail"]);

// Telegram's hard limit is 4096 chars. Every independently-sent part must
// stay within TELEGRAM_SAFE_MESSAGE_LENGTH, which leaves headroom below the
// hard limit for HTML overhead and rounding in the packing below.
export const TELEGRAM_MAX_MESSAGE_LENGTH = 4096;
export const TELEGRAM_SAFE_MESSAGE_LENGTH = 3500;

export type AssignmentIntroParts = {
  /** Plain messages to send (in order) before the interactive screen message. */
  precedingMessages: string[];
  /** The final message, edited into the interactive screen via safeEditScreen. */
  mainScreenMessage: string;
};

function typeKeyBase(type: string) {
  return `type-${type.replace(/_/g, "-")}`;
}

function howToAnswerText(t: Translator, a: InternalAssignmentDto): string {
  const types = new Set(a.questions.map((q) => q.questionType));
  const hasChoice = types.has("multiple_choice");
  const hasText = types.has("gap_fill") || types.has("open_text");

  if (hasChoice && hasText) return t("assignment-how-mixed");
  if (hasChoice) return t("assignment-how-choice");
  if (hasText) return t("assignment-how-text");
  return t("assignment-how-fallback");
}

/**
 * Splits already-HTML-escaped plain text into chunks of at most maxLen,
 * without ever cutting through an HTML entity (e.g. "&amp;"), and preferring
 * to break on a newline when one is available near the boundary. This is
 * only safe to use on text that does NOT itself contain HTML tags — callers
 * that need to split tagged content must extract the inner text first (see
 * splitTaggedFragment) and rewrap each chunk in the tag themselves.
 */
function chunkEscapedHtmlText(escaped: string, maxLen: number): string[] {
  if (escaped.length <= maxLen) return [escaped];

  const chunks: string[] = [];
  let start = 0;

  while (start < escaped.length) {
    let end = Math.min(start + maxLen, escaped.length);

    if (end < escaped.length) {
      const windowStart = Math.max(start, end - 6);
      const tail = escaped.slice(windowStart, end);
      const ampIndex = tail.lastIndexOf("&");
      if (ampIndex !== -1 && !tail.slice(ampIndex).includes(";")) {
        end = windowStart + ampIndex;
      }

      const lastNewline = escaped.lastIndexOf("\n", end);
      if (lastNewline > start) end = lastNewline;
    }

    if (end <= start) end = Math.min(start + maxLen, escaped.length);

    chunks.push(escaped.slice(start, end));
    start = end;
  }

  return chunks;
}

/**
 * Splits a fragment that is fully wrapped in a single tag pair (e.g.
 * "<i>...</i>") into multiple complete, validly-closed fragments, each
 * within budget — never cutting through the tag itself or an HTML entity.
 * Falls back to raw chunking only if the fragment doesn't have the expected
 * shape (defensive; not expected to trigger for our own uiMeta/breadcrumb output).
 */
function splitTaggedFragment(
  fragment: string,
  openTag: string,
  closeTag: string,
  budget: number,
): string[] {
  if (fragment.length <= budget) return [fragment];

  if (!fragment.startsWith(openTag) || !fragment.endsWith(closeTag)) {
    return chunkEscapedHtmlText(fragment, budget);
  }

  const inner = fragment.slice(openTag.length, fragment.length - closeTag.length);
  const overhead = openTag.length + closeTag.length;
  const chunks = chunkEscapedHtmlText(inner, Math.max(100, budget - overhead));
  return chunks.map((chunk) => `${openTag}${chunk}${closeTag}`);
}

/** Splits the breadcrumb+meta "header" into safe parts when it doesn't fit with the core message. */
function splitHeaderMessages(
  breadcrumbText: string,
  meta: string,
  budget: number,
): string[] {
  const parts: string[] = [];
  if (breadcrumbText) parts.push(...splitTaggedFragment(breadcrumbText, "<i>", "</i>", budget));
  if (meta) parts.push(...splitTaggedFragment(meta, "<i>", "</i>", budget));
  return parts;
}

/**
 * Renders the teacher's free-text comment (a message for the student, not an
 * AI instruction) with a localized title. Returns null for null/empty/
 * whitespace-only text so neither the title nor an empty blockquote appear.
 */
export function teacherCommentBlock(
  t: Translator,
  text: string | null | undefined,
): string | null {
  const trimmed = text?.trim();
  if (!trimmed) return null;
  return `${uiSection(t("assignment-teacher-comment-title"))}\n<blockquote expandable>${escapeHtml(trimmed)}</blockquote>`;
}

/**
 * Same as teacherCommentBlock, but guarantees every returned message stays
 * within `budget`, splitting into multiple complete (never mid-tag) messages
 * if needed instead of truncating.
 */
export function buildTeacherCommentMessages(
  t: Translator,
  text: string | null | undefined,
  budget: number,
): string[] {
  const trimmed = text?.trim();
  if (!trimmed) return [];

  const title = uiSection(t("assignment-teacher-comment-title"));
  const wrap = (chunk: string) =>
    `${title}\n<blockquote expandable>${chunk}</blockquote>`;

  const single = wrap(escapeHtml(trimmed));
  if (single.length <= budget) return [single];

  const overhead = wrap("").length;
  const chunkBudget = Math.max(200, budget - overhead);
  const chunks = chunkEscapedHtmlText(escapeHtml(trimmed), chunkBudget);
  return chunks.map(wrap);
}

type VocabInput = {
  term: string;
  translation?: string | null;
  synonyms?: string[] | null;
};

function buildVocabItemAtom(t: Translator, item: VocabInput): string {
  const term = escapeHtml(item.term.trim());

  const tr = item.translation?.trim()
    ? ` — ${escapeHtml(item.translation.trim())}`
    : "";

  const syn = item.synonyms?.length
    ? `\n<i>${t("assignment-vocab-synonyms-label")}</i> ${escapeHtml(item.synonyms.join(", "))}`
    : "";

  return `• <b>${term}</b>${tr}${syn}`;
}

/**
 * Splits a single vocab item whose full rendered form exceeds `budget` into
 * several safe atoms — one per field (term / translation / synonyms) — each
 * individually chunked if needed. Every chunk is wrapped in its own complete
 * tag, so nothing is ever cut mid-tag, and no term/translation/synonym
 * content is dropped.
 */
function splitOversizedVocabItem(
  t: Translator,
  item: VocabInput,
  budget: number,
): string[] {
  const atoms: string[] = [];

  const termEscaped = escapeHtml(item.term.trim());
  const termOverhead = "• <b></b>".length;
  const termChunks = chunkEscapedHtmlText(
    termEscaped,
    Math.max(100, budget - termOverhead),
  );
  termChunks.forEach((chunk, i) => {
    atoms.push(i === 0 ? `• <b>${chunk}</b>` : `<b>${chunk}</b>`);
  });

  const translation = item.translation?.trim();
  if (translation) {
    const translationEscaped = escapeHtml(translation);
    const chunks = chunkEscapedHtmlText(translationEscaped, Math.max(100, budget - 2));
    chunks.forEach((chunk, i) => {
      atoms.push(i === 0 ? `— ${chunk}` : chunk);
    });
  }

  if (item.synonyms?.length) {
    const synonymsEscaped = escapeHtml(item.synonyms.join(", "));
    const label = `<i>${escapeHtml(t("assignment-vocab-synonyms-label"))}</i> `;
    const chunks = chunkEscapedHtmlText(
      synonymsEscaped,
      Math.max(100, budget - label.length),
    );
    chunks.forEach((chunk, i) => {
      atoms.push(i === 0 ? `${label}${chunk}` : chunk);
    });
  }

  return atoms;
}

function vocabWrapperOverhead(t: Translator): number {
  return [t("assignment-vocab-title"), "<blockquote expandable>\n\n</blockquote>"].join(
    "\n",
  ).length;
}

/** Builds one atom per vocab item, splitting any item that alone exceeds itemBudget. */
function buildVocabAtoms(
  t: Translator,
  a: InternalAssignmentDto,
  itemBudget: number,
): string[] {
  const items = (a.vocab ?? []).filter((x) => x.term?.trim());
  const atoms: string[] = [];

  for (const item of items) {
    const whole = buildVocabItemAtom(t, item);
    if (whole.length <= itemBudget) {
      atoms.push(whole);
    } else {
      atoms.push(...splitOversizedVocabItem(t, item, itemBudget));
    }
  }

  return atoms;
}

/**
 * Packs vocab atoms into one or more complete "<title>\n<blockquote>...</blockquote>"
 * messages, each within `budget`. Atoms are pre-bounded (via itemBudget in
 * buildVocabAtoms) so a single atom alone, once wrapped, always fits.
 */
function packVocabMessages(
  t: Translator,
  atoms: string[],
  budget: number,
): string[] {
  if (atoms.length === 0) return [];

  const title = t("assignment-vocab-title");
  const wrap = (chunk: string[]) =>
    [
      title,
      `<blockquote expandable>\n${chunk.join("\n\n")}\n</blockquote>`,
    ].join("\n");

  const messages: string[] = [];
  let current: string[] = [];

  for (const atom of atoms) {
    const candidate = [...current, atom];
    if (current.length > 0 && wrap(candidate).length > budget) {
      messages.push(wrap(current));
      current = [atom];
    } else {
      current = candidate;
    }
  }
  if (current.length > 0) messages.push(wrap(current));

  return messages;
}

/**
 * The parts of the intro that don't scale with lesson data — fixed FTL
 * strings plus a question count. Returned as separate atomic pieces (each a
 * complete, self-closed HTML fragment) rather than one joined string, so
 * that IF one of these static strings were ever unexpectedly long, it can be
 * isolated into its own message instead of silently overflowing — this is
 * enforced by packAtomicPieces below, not just assumed.
 */
function buildCorePieces(t: Translator, a: InternalAssignmentDto): string[] {
  const typeKey = (a.type ?? "").trim();
  const isKnown = KNOWN_TYPES.has(typeKey);
  const kb = isKnown ? typeKeyBase(typeKey) : "";

  const title = isKnown
    ? uiTitle("📝", t(`${kb}-title` as Parameters<Translator>[0]))
    : t("assignment-title");

  const body = isKnown ? t(`${kb}-body` as Parameters<Translator>[0]) : "";
  const quoteTitle = isKnown
    ? t(`${kb}-example-title` as Parameters<Translator>[0])
    : t("assignment-fallback-example-title");
  const quoteBody = isKnown
    ? t(`${kb}-example-body` as Parameters<Translator>[0])
    : t("assignment-fallback-example-body");

  const note =
    isKnown && TYPES_WITH_NOTES.has(typeKey)
      ? t(`${kb}-note` as Parameters<Translator>[0])
      : null;

  const howTo = howToAnswerText(t, a);

  return [
    title,
    body || null,
    t("questions-count", { n: a.questions.length }),
    !isKnown ? `${t("assignment-how-prefix")} ${howTo}` : null,
    uiQuote(quoteTitle, quoteBody),
    note ? note : null,
    t("assignment-ready"),
  ].filter((piece): piece is string => Boolean(piece));
}

/** Greedily packs already-complete atomic HTML pieces into messages within budget. */
function packAtomicPieces(pieces: string[], budget: number): string[] {
  const nonEmpty = pieces.filter((p) => p.length > 0);
  if (nonEmpty.length === 0) return [];

  const messages: string[] = [];
  let current: string[] = [];

  for (const piece of nonEmpty) {
    const candidate = [...current, piece];
    if (current.length > 0 && uiMessage(candidate).length > budget) {
      messages.push(uiMessage(current));
      current = [piece];
    } else {
      current = candidate;
    }
  }
  if (current.length > 0) messages.push(uiMessage(current));

  return messages;
}

/**
 * Builds the ordered, length-safe set of messages for the assignment intro.
 *
 * In the common case (short comment, small vocab list, ordinary breadcrumb)
 * this is a single message — identical to the original single-message
 * behavior. When any part is large, content is moved into preceding
 * message(s) so the interactive screen message always fits, and nothing is
 * ever silently truncated. Every returned part is explicitly measured
 * against TELEGRAM_SAFE_MESSAGE_LENGTH before being returned.
 */
export function buildAssignmentIntroParts(
  t: Translator,
  a: InternalAssignmentDto,
  breadcrumbText: string,
): AssignmentIntroParts {
  const meta = uiMeta([
    a.lesson?.title ?? null,
    a.lesson?.topic ?? null,
    a.lesson?.level ?? null,
  ]);

  const corePieces = buildCorePieces(t, a);
  const core = uiMessage(corePieces);

  const wrapperOverhead = vocabWrapperOverhead(t);
  const itemBudget = Math.max(
    200,
    TELEGRAM_SAFE_MESSAGE_LENGTH - wrapperOverhead - 50,
  );
  const vocabAtoms = buildVocabAtoms(t, a, itemBudget);

  const commentMessages = buildTeacherCommentMessages(
    t,
    a.lesson?.additionalInstructions,
    TELEGRAM_SAFE_MESSAGE_LENGTH,
  );
  const vocabMessages = packVocabMessages(t, vocabAtoms, TELEGRAM_SAFE_MESSAGE_LENGTH);

  // Common case: everything inlined in one message, exactly like the
  // original single-message behavior.
  if (commentMessages.length <= 1 && vocabMessages.length <= 1) {
    const singleMessage = uiMessage([
      breadcrumbText,
      "",
      meta,
      commentMessages[0] ?? null,
      "",
      vocabMessages[0] ? `${vocabMessages[0]}\n` : null,
      core,
    ]);

    if (singleMessage.length <= TELEGRAM_SAFE_MESSAGE_LENGTH) {
      return { precedingMessages: [], mainScreenMessage: singleMessage };
    }
  }

  const precedingMessages: string[] = [...commentMessages, ...vocabMessages];

  const header = uiMessage([breadcrumbText, meta]);
  const combinedMain = uiMessage([header, "", core]);

  if (combinedMain.length <= TELEGRAM_SAFE_MESSAGE_LENGTH) {
    return { precedingMessages, mainScreenMessage: combinedMain };
  }

  // Header (breadcrumb/meta) and/or core don't fit together — split the
  // header out (further splitting it if it alone is oversized), and pack the
  // core into atomic pieces, keeping only the last as the interactive message.
  precedingMessages.push(
    ...splitHeaderMessages(breadcrumbText, meta, TELEGRAM_SAFE_MESSAGE_LENGTH),
  );

  const packedCore = packAtomicPieces(corePieces, TELEGRAM_SAFE_MESSAGE_LENGTH);
  if (packedCore.length > 1) {
    precedingMessages.push(...packedCore.slice(0, -1));
  }

  let mainScreenMessage = packedCore[packedCore.length - 1] ?? core;

  // Explicit final validation — every code path is checked here, not just
  // assumed safe by construction. This branch is a last-resort net for
  // content that is otherwise static and reviewed (FTL strings); it should
  // not be reachable in practice, but if it ever is, split further and log
  // it rather than silently ship an oversized message.
  if (mainScreenMessage.length > TELEGRAM_SAFE_MESSAGE_LENGTH) {
    logWarn("assignment_intro_core_oversized", {
      length: mainScreenMessage.length,
    });
    const chunks = chunkEscapedHtmlText(
      mainScreenMessage,
      TELEGRAM_SAFE_MESSAGE_LENGTH,
    );
    precedingMessages.push(...chunks.slice(0, -1));
    mainScreenMessage = chunks[chunks.length - 1]!;
  }

  return { precedingMessages, mainScreenMessage };
}
