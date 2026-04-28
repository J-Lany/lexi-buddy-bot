import type { InternalAssignmentDto } from "../../../../../infra/backend-api/backend-api.types.js";
import { uiMessage, uiMeta, uiQuote } from "../../helpers/ui.js";
import { escapeHtml } from "../../helpers/html.js";
import type { Translator } from "../../helpers/copy.js";

const KNOWN_TYPES = new Set([
  "definition_quiz",
  "gap_filling",
  "phrase_fail",
  "collocation_check",
]);

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

function vocabBlock(t: Translator, a: InternalAssignmentDto): string | null {
  const items = (a.vocab ?? []).filter((x) => x.term?.trim());
  if (items.length === 0) return null;

  const lines = items.map((x) => {
    const term = escapeHtml(x.term.trim());

    const tr = x.translation?.trim()
      ? ` — ${escapeHtml(x.translation.trim())}`
      : "";

    const syn = x.synonyms?.length
      ? `\n<i>${t("assignment-vocab-synonyms-label")}</i> ${escapeHtml(x.synonyms.join(", "))}`
      : "";

    return `• <b>${term}</b>${tr}${syn}`;
  });

  const content = lines.join("\n\n");
  return [
    t("assignment-vocab-title"),
    `<blockquote expandable>\n${content}\n</blockquote>`,
  ].join("\n");
}

export function assignmentIntroMessage(
  t: Translator,
  a: InternalAssignmentDto,
) {
  const meta = uiMeta([
    a.lesson?.title ?? null,
    a.lesson?.topic ?? null,
    a.lesson?.level ?? null,
  ]);

  const typeKey = (a.type ?? "").trim();
  const isKnown = KNOWN_TYPES.has(typeKey);
  const kb = isKnown ? typeKeyBase(typeKey) : "";

  const title = isKnown
    ? t(`${kb}-title` as Parameters<Translator>[0])
    : t("assignment-title");
  const body = isKnown ? t(`${kb}-body` as Parameters<Translator>[0]) : "";
  const quoteTitle = isKnown
    ? t(`${kb}-example-title` as Parameters<Translator>[0])
    : t("assignment-fallback-example-title");
  const quoteBody = isKnown
    ? t(`${kb}-example-body` as Parameters<Translator>[0])
    : t("assignment-fallback-example-body");
  const noteRaw = isKnown ? t(`${kb}-note` as Parameters<Translator>[0]) : "";
  const note = noteRaw !== "" ? noteRaw : null;

  const howTo = howToAnswerText(t, a);
  const vocab = vocabBlock(t, a);

  return uiMessage([
    meta,
    "",
    title,
    "",
    vocab ? `${vocab}\n` : null,
    body ? body : null,
    "",
    t("questions-count", { n: a.questions.length }),

    !isKnown ? `${t("assignment-how-prefix")} ${howTo}` : null,

    "",
    uiQuote(quoteTitle, quoteBody),

    note ? `\n${note}` : null,

    "",
    t("assignment-ready"),
  ]);
}
